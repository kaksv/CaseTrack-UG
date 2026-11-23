import { Router } from 'express';
import { databaseState } from '../db';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const database = databaseState();
  const healthy = database === 'connected';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'casetrack-ug-api',
    database,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
