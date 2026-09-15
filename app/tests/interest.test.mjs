import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInterestPayload,
  submitInterest,
  interestEndpoint,
  DEFAULT_INTEREST_ENDPOINT,
} from '../src/lib/interest.ts';

test('payload with a note', () => {
  assert.deepEqual(
    buildInterestPayload({ name: ' Ada ', email: 'ada@example.com', company: 'Acme', note: 'Training the team' }),
    {
      name: 'Ada',
      email: 'ada@example.com',
      company: 'Acme',
      message: 'Interest: clrClaude\n\nTraining the team',
      app: 'clrclaude',
      website: '',
    },
  );
});

test('payload without a note or company', () => {
  const p = buildInterestPayload({ name: 'Ada', email: 'ada@example.com' });
  assert.equal(p.message, 'Registered interest via clrclaude.clrtech.xyz');
  assert.equal(p.company, '');
  assert.equal(p.website, '');
});

test('default endpoint', () => {
  assert.equal(interestEndpoint(), DEFAULT_INTEREST_ENDPOINT);
  assert.equal(DEFAULT_INTEREST_ENDPOINT, 'https://clrtech.co.za/api/contact');
});

test('submit posts JSON and reports success', async () => {
  let seen;
  const fake = async (url, init) => {
    seen = { url, init };
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  const r = await submitInterest({ name: 'Ada', email: 'ada@example.com' }, fake);
  assert.deepEqual(r, { ok: true, error: null });
  assert.equal(seen.url, DEFAULT_INTEREST_ENDPOINT);
  assert.equal(seen.init.method, 'POST');
  assert.equal(JSON.parse(seen.init.body).app, 'clrclaude');
});

test('submit surfaces the server error string', async () => {
  const fake = async () => new Response(JSON.stringify({ ok: false, error: 'Please provide your name' }), { status: 400 });
  assert.deepEqual(await submitInterest({ name: '', email: '' }, fake), { ok: false, error: 'Please provide your name' });
});

test('submit reports network failure', async () => {
  const fake = async () => {
    throw new TypeError('fetch failed');
  };
  assert.deepEqual(await submitInterest({ name: 'a', email: 'b' }, fake), {
    ok: false,
    error: 'Network error, please try again',
  });
});
