import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config';
import { AppError, badRequest } from '../lib/errors';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { assistantLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';

export const assistantRouter = Router();

assistantRouter.use(requireAuth);

const languages = ['en', 'lg', 'nyn', 'luo', 'teo', 'sw'] as const;
const languageNames = {
  en: 'English',
  lg: 'Luganda',
  nyn: 'Runyankole',
  luo: 'Luo',
  teo: 'Ateso',
  sw: 'Swahili',
} as const;

const chatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Enter a question')
    .max(env.LEGAL_ASSISTANT_MAX_MESSAGE_LENGTH, 'Question is too long'),
  language: z.enum(languages).default('en'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(env.LEGAL_ASSISTANT_MAX_MESSAGE_LENGTH),
      })
    )
    .max(12)
    .default([]),
});

assistantRouter.post(
  '/chat',
  assistantLimiter,
  validate({ body: chatSchema }),
  asyncHandler(async (req, res) => {
    if (!env.LEGAL_ASSISTANT_ENABLED) {
      throw new AppError(503, 'The legal education assistant is currently unavailable', 'FEATURE_DISABLED');
    }
    if (!env.HUGGINGFACE_API_KEY) {
      throw new AppError(503, 'The Hugging Face provider is not configured', 'PROVIDER_NOT_CONFIGURED');
    }

    const { message, language, history } = req.body as z.infer<typeof chatSchema>;
    const languageName = languageNames[language];
    const systemPrompt =
      `You are CaseTrack UG's legal education assistant. Answer in ${languageName}. ` +
      'Explain general Ugandan law clearly and in plain language. Do not claim to be a lawyer or an official government service. ' +
      'Do not invent statutes, case citations or legal deadlines. If source law or facts are uncertain, say so and advise the user to consult a qualified advocate or the relevant court/authority. ' +
      'Never instruct a person to break the law or provide dangerous evasion advice. End substantive answers with: "This is general legal education, not legal advice."';

    const response = await fetch(`${env.HUGGINGFACE_BASE_URL.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.GEMMA_MODEL,
        temperature: 0.2,
        max_tokens: 800,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10),
          { role: 'user', content: message },
        ],
      }),
    });

    const payload = await response.json().catch(() => null) as
      | { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } }
      | null;

    if (!response.ok) {
      throw new AppError(502, 'The legal education model is temporarily unavailable', 'PROVIDER_ERROR');
    }

    const answer = payload?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      throw new AppError(502, 'The legal education model returned an empty answer', 'PROVIDER_ERROR');
    }

    res.json({ data: { answer, language } });
  })
);

const speechTextSchema = z.object({
  audioBase64: z.string().min(1).max(7_000_000),
  mimeType: z.string().regex(/^audio\/(?:mpeg|mp3|wav|webm|ogg|mp4|x-m4a)$/).default('audio/webm'),
  language: z.enum(languages).default('en'),
});

assistantRouter.post(
  '/speech-to-text',
  assistantLimiter,
  validate({ body: speechTextSchema }),
  asyncHandler(async (req, res) => {
    if (!env.ELEVENLABS_API_KEY) {
      throw new AppError(503, 'ElevenLabs is not configured', 'PROVIDER_NOT_CONFIGURED');
    }

    const { audioBase64, mimeType, language } = req.body as z.infer<typeof speechTextSchema>;
    let audio: Buffer;
    try {
      audio = Buffer.from(audioBase64, 'base64');
    } catch {
      throw badRequest('Invalid audio recording');
    }
    if (audio.length > 5 * 1024 * 1024) {
      throw badRequest('Audio recording is too large');
    }

    const form = new FormData();
    form.append('model_id', env.ELEVENLABS_STT_MODEL);
    form.append('file', new Blob([audio], { type: mimeType }), 'recording');
    if (language !== 'en') form.append('language_code', language);

    const providerResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': env.ELEVENLABS_API_KEY },
      body: form,
    });
    const payload = await providerResponse.json().catch(() => null) as
      | { text?: string; transcript?: string; error?: { message?: string } }
      | null;

    if (!providerResponse.ok) {
      throw new AppError(502, 'Speech transcription is temporarily unavailable', 'PROVIDER_ERROR');
    }
    const text = payload?.text?.trim() || payload?.transcript?.trim();
    if (!text) {
      throw new AppError(422, 'No speech could be transcribed', 'NO_TRANSCRIPT');
    }
    res.json({ data: { text } });
  })
);

const textToSpeechSchema = z.object({
  text: z.string().trim().min(1).max(3000),
  language: z.enum(languages).default('en'),
});

assistantRouter.post(
  '/text-to-speech',
  assistantLimiter,
  validate({ body: textToSpeechSchema }),
  asyncHandler(async (req, res) => {
    if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_VOICE_ID) {
      throw new AppError(503, 'ElevenLabs text-to-speech is not configured', 'PROVIDER_NOT_CONFIGURED');
    }

    const { text, language } = req.body as z.infer<typeof textToSpeechSchema>;
    const providerResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(env.ELEVENLABS_VOICE_ID)}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: env.ELEVENLABS_TTS_MODEL,
          language_code: language,
        }),
      }
    );

    if (!providerResponse.ok) {
      throw new AppError(502, 'Read-aloud is temporarily unavailable', 'PROVIDER_ERROR');
    }
    const audio = Buffer.from(await providerResponse.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.send(audio);
  })
);
