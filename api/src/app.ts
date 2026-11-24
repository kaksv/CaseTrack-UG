import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOrigins, env } from './config';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/error';
import { authRouter } from './routes/auth';
import { casesRouter } from './routes/cases';
import { notificationsRouter } from './routes/notifications';
import { institutionsRouter } from './routes/institutions';
import { healthRouter } from './routes/health';
import { assistantRouter } from './routes/assistant';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.TRUST_PROXY);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, health checks, server-to-server).
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = origin.replace(/\/$/, '');
      callback(null, corsOrigins.includes(normalized));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86_400,
    credentials: false,
  })
);

app.use(express.json({ limit: '8mb' }));

if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      // Path only: no query strings, bodies, headers, or tokens.
      console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - startedAt}ms`);
    });
    next();
  });
}

app.get('/api', (_req, res) => {
  res.json({
    data: {
      name: 'CaseTrack UG API',
      version: '1.0.0',
      documentation: 'See README.md in the repository root',
    },
  });
});

app.use('/api', apiLimiter);
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/institutions', institutionsRouter);
app.use('/api/cases', casesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/assistant', assistantRouter);

app.use(notFoundHandler);
app.use(errorHandler);
