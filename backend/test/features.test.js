import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_API_URL || 'http://127.0.0.1:5000';
const TEST_ORG_ID = '6aec4ad00008859371b2';
const ADMIN_USER_ID = '6aec344800296c3cb621';

test('Backend Health Endpoint responds OK', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});

test('Channels API returns list and quota', async () => {
  const res = await fetch(`${BASE_URL}/api/channels?orgId=${TEST_ORG_ID}`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(typeof data.total === 'number');
  assert.ok(typeof data.quota === 'number');
  assert.ok(Array.isArray(data.channels));
});

test('Stream Session API returns Ingest URL and Stream Key', async () => {
  const res = await fetch(`${BASE_URL}/api/streams/session?orgId=${TEST_ORG_ID}`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.streamKey);
  assert.ok(data.ingestUrl);
});

test('Unified Title API propagates title to destinations', async () => {
  const res = await fetch(`${BASE_URL}/api/streams/title`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId: TEST_ORG_ID, title: 'Automated Test Stream Title' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.syncedPlatforms));
});

test('Admin Organizations API returns team roster for Super Admin', async () => {
  const res = await fetch(`${BASE_URL}/api/admin/organizations`, {
    headers: { 'x-user-id': ADMIN_USER_ID }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.organizations));
});

test('Admin Email Providers API allows fetching configurations', async () => {
  const res = await fetch(`${BASE_URL}/api/admin/email-providers`, {
    headers: { 'x-user-id': ADMIN_USER_ID }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.configs);
});

