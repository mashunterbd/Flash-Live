import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { backendErrorLogger } from './utils/errorLogger.js';
import { usersService, teamsService, APPWRITE_CONFIG } from './services/appwrite.js';
import { authRouter } from './routes/auth.js';
import { teamsRouter } from './routes/teams.js';
import { channelsRouter } from './routes/channels.js';
import { streamsRouter } from './routes/streams.js';
import { adminRouter } from './routes/admin.js';
import { ensureDatabaseAndCollections } from './services/dbInit.js';
import { initRtmpServer } from './services/rtmpServer.js';

// Load environment variables
dotenv.config();

// Start error logging capture per RULES.md
backendErrorLogger.interceptConsole();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow local network IP, localhost, and requests without origin (mobile clients/tools)
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.') || origin === FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// 1. Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'flash-live-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 2. Safe Public Config endpoint (Zero secrets exposed)
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    appwrite: {
      endpoint: APPWRITE_CONFIG.endpoint,
      projectId: APPWRITE_CONFIG.projectId
    },
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    facebookClientId: process.env.FACEBOOK_CLIENT_ID || process.env.client_id || null,
    rtmpIngestUrl: process.env.RTMP_INGEST_URL || 'rtmp://localhost:1935/live'
  });
});

// 3. Frontend Error Logging endpoint (per RULES.md -> frontend/only_error_logs.json)
app.post('/api/logs/frontend', (req: Request, res: Response) => {
  try {
    const { level, message, source, stack } = req.body;
    const frontendLogPath = path.resolve(process.cwd(), '../frontend/only_error_logs.json');
    
    // Ensure frontend directory exists
    const frontendDir = path.dirname(frontendLogPath);
    if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir, { recursive: true });
    }

    let entries: any[] = [];
    if (fs.existsSync(frontendLogPath)) {
      try {
        entries = JSON.parse(fs.readFileSync(frontendLogPath, 'utf-8'));
      } catch {
        entries = [];
      }
    }

    const cleanMsg = typeof message === 'string' ? message : JSON.stringify(message);
    const hash = Buffer.from(`${source || 'ui'}:${cleanMsg}`).toString('base64').substring(0, 16);
    const now = new Date().toISOString();

    const existing = entries.find(e => e.id === hash);
    if (existing) {
      existing.count += 1;
      existing.last_seen = now;
      if (stack && !existing.stack) existing.stack = stack;
    } else {
      entries.push({
        id: hash,
        level: level || 'error',
        message: cleanMsg,
        source: source || 'frontend',
        count: 1,
        first_seen: now,
        last_seen: now,
        stack
      });
    }

    fs.writeFileSync(frontendLogPath, JSON.stringify(entries, null, 2), 'utf-8');
    res.json({ success: true, id: hash });
  } catch (err) {
    backendErrorLogger.log('error', `Failed to log frontend error: ${(err as Error).message}`, 'frontendLogger');
    res.status(500).json({ error: 'Failed to record log' });
  }
});

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/channels', channelsRouter);
app.use('/api/streams', streamsRouter);
app.use('/api/admin', adminRouter);

// Ensure Appwrite database and schema
ensureDatabaseAndCollections().catch(err => {
  backendErrorLogger.log('warning', `DB auto-init failed: ${err.message}`, 'server_init');
});

// Initialize and start live RTMP Streaming Ingest Server
initRtmpServer();

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  backendErrorLogger.log('error', err.message, 'express_unhandled', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[FlashLive Backend] Server listening on port ${PORT}`);
  console.log(`[FlashLive Backend] Connected to Appwrite: ${APPWRITE_CONFIG.endpoint} (Project: ${APPWRITE_CONFIG.projectId})`);
});

