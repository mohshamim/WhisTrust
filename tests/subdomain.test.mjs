import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  extractSubdomain,
  getOrganizationFromRequest,
  getSubdomainRewrite,
} from '../lib/utils/subdomain.ts';

test('classifies only valid single-label subdomains of approved domains', () => {
  const cases = [
    ['ACME.WHISTRUST.APP.:443', 'acme'],
    ['demo.whistrust.com', 'demo'],
    ['superadmin.whistrust.app', 'superadmin'],
    ['whistrust.com', null],
    ['www.whistrust.com', null],
    ['whistrust.app', null],
    ['www.whistrust.app', null],
    ['localhost:3000', null],
    ['whistrust.vercel.app', null],
    ['whistrust-git-fix-team.vercel.app', null],
    ['demo.vercel.app', null],
    ['demo.whistrust.com.example.org', null],
    ['demo.evilwhistrust.com', null],
    ['nested.demo.whistrust.com', null],
    ['-invalid.whistrust.app', null],
    [`${'a'.repeat(64)}.whistrust.app`, null],
  ];
  for (const [host, expected] of cases) {
    assert.equal(extractSubdomain(host), expected, host);
  }
});

test('leaves the homepage and public routes on Vercel, marketing, and localhost hosts', () => {
  for (const host of [
    'whistrust.vercel.app',
    'whistrust-git-fix-team.vercel.app',
    'whistrust.com',
    'www.whistrust.com',
    'localhost:3000',
  ]) {
    for (const path of ['/', '/features', '/org/acme/login']) {
      assert.equal(getSubdomainRewrite(new URL(`https://${host}${path}`), host), null);
    }
  }
});

test('rewrites demo, super-admin, and tenant paths while retaining the query string', () => {
  const cases = [
    ['demo.whistrust.com', '/', '/demo'],
    ['superadmin.whistrust.app', '/login', '/superadmin/login'],
    ['acme.whistrust.app', '/', '/org/acme'],
    ['acme.whistrust.app', '/report', '/org/acme/report'],
    ['unknown.whistrust.app', '/login', '/org/unknown/login'],
    ['acme.whistrust.app', '/sso/callback', '/org/acme/sso/callback'],
  ];
  for (const [host, path, expected] of cases) {
    const url = new URL(`https://${host}${path}?a=one%2Btwo&a=three&empty=`);
    const result = getSubdomainRewrite(url, host);
    assert.equal(result?.pathname, expected);
    assert.equal(result?.search, url.search);
    assert.equal(result?.origin, url.origin);
    assert.equal(url.pathname, path);
  }
});

test('leaves direct tenant routes, already-prefixed pages, API, assets, and PWA files alone', () => {
  for (const host of ['demo.whistrust.com', 'superadmin.whistrust.app', 'acme.whistrust.app']) {
    for (const path of [
      '/org/acme',
      '/org/acme/sso/callback?code=test&state=test',
      '/api/reports/track',
      '/_next/static/chunk.js',
      '/_next/image',
      '/static/assets',
      '/manifest.json',
      '/sw.js',
      '/offline.html',
    ]) {
      assert.equal(getSubdomainRewrite(new URL(`https://${host}${path}`), host), null, path);
    }
  }
  assert.equal(getSubdomainRewrite(new URL('https://demo.whistrust.com/demo'), 'demo.whistrust.com'), null);
  assert.equal(getSubdomainRewrite(new URL('https://superadmin.whistrust.app/superadmin/login'), 'superadmin.whistrust.app'), null);
});

test('SSO resolves the organization from a direct path on platform hosts', () => {
  const callback = '/org/acme/sso/callback';
  assert.equal(getOrganizationFromRequest('whistrust-git-fix-team.vercel.app', callback), 'acme');
  assert.equal(getOrganizationFromRequest('localhost:3000', callback), 'acme');
  assert.equal(getOrganizationFromRequest('acme.whistrust.app', '/sso/callback'), 'acme');
  assert.equal(getOrganizationFromRequest('demo.vercel.app', '/sso/callback'), null);
});
