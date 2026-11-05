import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function errorLogsPlugin() {
  return {
    name: 'auto-error-logs',
    buildStart() {
      const logPath = path.resolve(process.cwd(), 'only_error_logs.json');
      if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, JSON.stringify([], null, 2), 'utf-8');
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), errorLogsPlugin()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
