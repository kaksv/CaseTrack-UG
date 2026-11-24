'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Loader2,
  Mic,
  MicOff,
  Send,
  Volume2,
} from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import type { AssistantLanguage, AssistantMessage } from '@/lib/types';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, PageHeader } from '@/components/ui/Card';

const languages: Array<{ code: AssistantLanguage; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'lg', label: 'Luganda' },
  { code: 'nyn', label: 'Runyankole' },
  { code: 'luo', label: 'Luo' },
  { code: 'teo', label: 'Ateso' },
  { code: 'sw', label: 'Swahili' },
];

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export default function LegalAssistantPage() {
  const [language, setLanguage] = useState<AssistantLanguage>('en');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      audioRef.current?.pause();
    };
  }, []);

  async function sendMessage(message = input) {
    const text = message.trim();
    if (!text || loading) return;
    setError(null);
    setLoading(true);
    setMessages((current) => [...current, { role: 'user', content: text }]);
    setInput('');

    try {
      const response = await api.legalChat(text, language, messages);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: response.data.answer },
      ]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Microphone recording is not supported by this browser.');
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size === 0) return;
        setLoading(true);
        try {
          const audioBase64 = await blobToBase64(blob);
          const response = await api.speechToText(audioBase64, blob.type, language);
          setInput(response.data.text);
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setLoading(false);
        }
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError('Microphone access was not granted. Check browser permissions and try again.');
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    setRecording(false);
  }

  async function readAloud(text: string) {
    setError(null);
    try {
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        throw new Error('Read-aloud is not supported by this browser.');
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'lg' ? 'lg-UG'
        : language === 'nyn' ? 'nyn-UG'
        : language === 'luo' ? 'luo-UG'
        : language === 'teo' ? 'teo-UG'
        : language === 'sw' ? 'sw-KE'
        : 'en-UG';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Legal education"
        title="Ask about Ugandan law"
        description="Get plain-language general information in English or a local language."
      />

      <Alert tone="warning" title="Important">
        <p>
          This assistant provides general education, not legal advice or official government guidance.
          Verify important deadlines and case-specific decisions with a qualified advocate or relevant authority.
        </p>
      </Alert>

      {error && <Alert tone="error" title="Unable to complete the request">{error}</Alert>}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-4 py-3 sm:px-5">
          <label className="flex items-center gap-2 text-[12px] font-semibold text-ink-700">
            Language
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as AssistantLanguage)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-ink-500 focus:ring-2 focus:ring-gold-500/25"
            >
              {languages.map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </select>
          </label>
          <span className="text-[10.5px] text-ink-400">Gemma · ElevenLabs voice</span>
        </div>

        <div className="min-h-[360px] max-h-[520px] overflow-y-auto px-4 py-5 sm:px-5">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 text-ink-700 ring-1 ring-gold-200">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-ink-900">Start a legal education conversation</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
                For example: “Explain how a Local Council court hearing works.”
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-ink-900 text-white'
                        : 'border border-ink-100 bg-ink-50 text-ink-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => void readAloud(message.content)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg text-[11px] font-semibold text-ink-700 hover:text-ink-950"
                      >
                        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Read aloud
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-[12px] text-ink-400">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Preparing a response…
                </div>
              )}
            </div>
          )}
        </div>

        <form
          className="flex items-end gap-2 border-t border-ink-100 p-3 sm:p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask a general legal question…"
            maxLength={3000}
            rows={2}
            className="min-h-11 flex-1 resize-none rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-300 focus:border-ink-500 focus:ring-2 focus:ring-gold-500/25"
          />
          <Button
            type="button"
            variant={recording ? 'danger' : 'secondary'}
            size="md"
            className="h-11 w-11 px-0"
            onClick={recording ? stopRecording : () => void startRecording()}
            aria-label={recording ? 'Stop recording' : 'Record a question'}
            title={recording ? 'Stop recording' : 'Record a question'}
          >
            {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button type="submit" size="md" className="h-11 w-11 px-0" disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Send question</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
