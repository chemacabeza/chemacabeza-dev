#!/usr/bin/env node
// One-time helper: walks the LinkedIn 3-legged OAuth flow and prints the
// LINKEDIN_ACCESS_TOKEN + LINKEDIN_PERSON_URN values that the publish workflow
// expects as GitHub repository secrets.
//
// Prerequisites:
//   1. Create a LinkedIn app at https://www.linkedin.com/developers/
//   2. Under "Products", request access to:
//        - "Sign In with LinkedIn using OpenID Connect"  (gives openid/profile/email)
//        - "Share on LinkedIn"                            (gives w_member_social)
//   3. Under "Auth", add an authorized redirect URL:
//        http://localhost:5174/callback
//   4. Copy the Client ID and Client Secret, then run:
//        LINKEDIN_CLIENT_ID=xxx LINKEDIN_CLIENT_SECRET=yyy node scripts/linkedin-poster/setup-auth.mjs
import './_ipv4-fetch.mjs'; // must precede any fetch(); see file for why
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { exec } from 'node:child_process';

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const PORT = parseInt(process.env.PORT || '5174', 10);
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = ['openid', 'profile', 'email', 'w_member_social'].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing env vars: LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET');
  console.error('Create a developer app at https://www.linkedin.com/developers/');
  console.error(`Add this redirect URL to the app: ${REDIRECT_URI}`);
  process.exit(2);
}

const state = randomBytes(16).toString('hex');
const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('state', state);
authUrl.searchParams.set('scope', SCOPES);

console.log('\nOpen this URL in your browser if it does not open automatically:\n');
console.log(authUrl.toString());
console.log('');

const opener =
  process.platform === 'darwin' ? 'open' :
  process.platform === 'win32' ? 'start ""' :
  'xdg-open';
exec(`${opener} "${authUrl.toString()}"`);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/callback') {
    res.writeHead(404).end('Not found');
    return;
  }
  const code = url.searchParams.get('code');
  const got = url.searchParams.get('state');
  const err = url.searchParams.get('error');

  if (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end(`OAuth error: ${err} — ${url.searchParams.get('error_description') || ''}`);
    console.error(`✗ OAuth error: ${err}`);
    server.close();
    return;
  }
  if (!code || got !== state) {
    res.writeHead(400).end('Bad state or missing code');
    return;
  }

  let tokenJson;
  try {
    const tokenResp = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });
    tokenJson = await tokenResp.json();
    if (!tokenResp.ok) throw new Error(`HTTP ${tokenResp.status}: ${JSON.stringify(tokenJson)}`);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Token exchange failed: ${e.message}`);
    console.error(`✗ Token exchange failed: ${e.message}`);
    server.close();
    return;
  }

  const accessToken = tokenJson.access_token;

  // /v2/userinfo (OIDC) returns { sub, name, email, ... }. `sub` is the LinkedIn member id.
  let personUrn = null;
  try {
    const meResp = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const me = await meResp.json();
    if (me && me.sub) personUrn = `urn:li:person:${me.sub}`;
  } catch {
    // fall through
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h2>Done. Return to the terminal — your secrets are printed there.</h2>');

  const expiresDays = Math.round((tokenJson.expires_in || 0) / 86400);
  const expiresOn = new Date(Date.now() + (tokenJson.expires_in || 0) * 1000)
    .toISOString()
    .slice(0, 10);
  console.log('\n──────── COPY THESE INTO GITHUB REPO SECRETS ────────');
  console.log(`LINKEDIN_ACCESS_TOKEN=${accessToken}`);
  console.log(`LINKEDIN_PERSON_URN=${personUrn || '(failed to fetch — call /v2/userinfo manually)'}`);
  console.log('───────────────────────────────────────────────────────');
  console.log(`\nToken expires in ~${expiresDays} days — on ${expiresOn}. Set a reminder to re-run this then.`);
  console.log('Set them at:  https://github.com/<owner>/<repo>/settings/secrets/actions');
  console.log('\nWhen the token expires, re-run this script and update LINKEDIN_ACCESS_TOKEN.');
  server.close();
});

server.listen(PORT, () => {
  console.log(`Waiting for OAuth callback on ${REDIRECT_URI} ...`);
});
