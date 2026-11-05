import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('backend environment file exists and contains essential keys', () => {
  const envPath = path.resolve(process.cwd(), '.env');
  assert.ok(fs.existsSync(envPath), 'backend/.env should exist');
  const envContent = fs.readFileSync(envPath, 'utf8');
  assert.match(envContent, /APPWRITE_ENDPOINT/, 'APPWRITE_ENDPOINT should be defined');
  assert.match(envContent, /APPWRITE_PROJECT_ID/, 'APPWRITE_PROJECT_ID should be defined');
});

test('error log file backend/only_error_logs.json structure', () => {
  const logPath = path.resolve(process.cwd(), 'only_error_logs.json');
  if (fs.existsSync(logPath)) {
    const raw = fs.readFileSync(logPath, 'utf8');
    const parsed = JSON.parse(raw);
    assert.ok(Array.isArray(parsed), 'only_error_logs.json must be an array');
  }
});
