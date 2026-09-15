import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Point the hub proxy at a closed port so proxied routes fail fast with 502
// (proves they are NOT gated) without touching any real service.
process.env.CLRHUB_API_URL = 'http://127.0.0.1:9';
delete process.env.ALLOW_PUBLIC_SIGNUP;

let server;
let base;

before(async () => {
  const { app } = await import('../server/index.js');
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

const post = (path, body = {}) =>
  fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

for (const path of ['/api/auth/register', '/api/auth/signup']) {
  test(`${path} is closed by default`, async () => {
    const r = await post(path, { email: 'a@example.com', password: 'x'.repeat(12), name: 'A' });
    assert.equal(r.status, 403);
    assert.deepEqual(await r.json(), { error: 'Registration is closed' });
  });
}

test('/api/auth/forgot-password is closed by default', async () => {
  const r = await post('/api/auth/forgot-password', { email: 'a@example.com' });
  assert.equal(r.status, 403);
  assert.deepEqual(await r.json(), { error: 'Password reset is closed' });
});

test('login is still proxied (not gated)', async () => {
  const r = await post('/api/auth/login', { email: 'a@example.com', password: 'x' });
  assert.equal(r.status, 502);
});

test('refresh is still proxied (not gated)', async () => {
  const r = await post('/api/auth/refresh', { refresh_token: 'x' });
  assert.equal(r.status, 502);
});

test('me still requires a token', async () => {
  const r = await fetch(base + '/api/auth/me');
  assert.equal(r.status, 401);
});

test('ALLOW_PUBLIC_SIGNUP=1 re-opens the register and forgot-password proxies', () => {
  const script = `
    process.env.CLRHUB_API_URL = 'http://127.0.0.1:9';
    const { app } = await import(${JSON.stringify(fileURLToPath(new URL('../server/index.js', import.meta.url)))});
    const s = app.listen(0, '127.0.0.1', async () => {
      const codes = [];
      for (const p of ['/api/auth/register', '/api/auth/forgot-password']) {
        const r = await fetch('http://127.0.0.1:' + s.address().port + p, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        codes.push(r.status);
      }
      console.log(codes.join(','));
      s.close();
    });
  `;
  const out = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    env: { ...process.env, ALLOW_PUBLIC_SIGNUP: '1' },
    encoding: 'utf8',
  });
  assert.equal(out.stdout.trim(), '502,502');
});
