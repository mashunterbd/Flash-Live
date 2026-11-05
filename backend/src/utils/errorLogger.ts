import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ErrorLogEntry {
  id: string;
  level: 'error' | 'warning';
  message: string;
  source: string;
  count: number;
  first_seen: string;
  last_seen: string;
  stack?: string;
}

export class ErrorLogger {
  private logFilePath: string;
  private entries: Map<string, ErrorLogEntry> = new Map();

  constructor(filePath?: string) {
    this.logFilePath = filePath || path.resolve(process.cwd(), 'only_error_logs.json');
    this.initFile();
  }

  private initFile(): void {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const raw = fs.readFileSync(this.logFilePath, 'utf-8').trim();
        if (raw) {
          const list: ErrorLogEntry[] = JSON.parse(raw);
          list.forEach(entry => this.entries.set(entry.id, entry));
        }
      } else {
        fs.writeFileSync(this.logFilePath, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch {
      fs.writeFileSync(this.logFilePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  private flushToFile(): void {
    try {
      const data = Array.from(this.entries.values());
      fs.writeFileSync(this.logFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      process.stderr.write(`Failed to flush error log: ${(err as Error).message}\n`);
    }
  }

  public log(level: 'error' | 'warning', message: string, source: string, stack?: string): void {
    const cleanMsg = typeof message === 'string' ? message : JSON.stringify(message);
    const hash = crypto.createHash('sha256').update(`${source}:${cleanMsg}`).digest('hex').substring(0, 16);
    const now = new Date().toISOString();

    const existing = this.entries.get(hash);
    if (existing) {
      existing.count += 1;
      existing.last_seen = now;
      if (stack && !existing.stack) existing.stack = stack;
    } else {
      this.entries.set(hash, {
        id: hash,
        level,
        message: cleanMsg,
        source,
        count: 1,
        first_seen: now,
        last_seen: now,
        stack
      });
    }

    this.flushToFile();
  }

  public interceptConsole(): void {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: unknown[]) => {
      const msg = args.map(a => (a instanceof Error ? a.message : typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      const stack = args.find(a => a instanceof Error) ? (args.find(a => a instanceof Error) as Error).stack : undefined;
      this.log('error', msg, 'console.error', stack);
      originalError.apply(console, args);
    };

    console.warn = (...args: unknown[]) => {
      const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      this.log('warning', msg, 'console.warn');
      originalWarn.apply(console, args);
    };

    process.on('uncaughtException', (err: Error) => {
      this.log('error', err.message, 'uncaughtException', err.stack);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      const msg = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      this.log('error', msg, 'unhandledRejection', stack);
    });
  }
}

export const backendErrorLogger = new ErrorLogger();
