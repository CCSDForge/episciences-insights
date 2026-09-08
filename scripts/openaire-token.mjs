import fs from 'node:fs';
import path from 'node:path';

/**
 * OAuth2 client-credentials token manager for the OpenAIRE AAI.
 *
 * NOTE: the real token endpoint is /oidc/token, not /token. The latter
 * 404s — verified directly against the API before writing this file.
 */
export class OpenAireTokenManager {
  constructor(options = {}) {
    this.clientId = options.clientId || process.env.OPENAIRE_CLIENT_ID || '';
    this.clientSecret = options.clientSecret || process.env.OPENAIRE_CLIENT_SECRET || '';
    this.authUrl = options.authUrl || process.env.OPENAIRE_AUTH_URL || 'https://aai.openaire.eu/oidc/token';
    this.tokenFilePath = path.resolve(options.cacheDir || './.cache', 'openaire_token.json');
  }

  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  async getAccessToken() {
    if (!this.isConfigured()) return null;

    if (fs.existsSync(this.tokenFilePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(this.tokenFilePath, 'utf-8'));
        if (cached.access_token && cached.expires_at && Date.now() < cached.expires_at) {
          return cached.access_token;
        }
      } catch (err) {
        console.error('[OpenAIRE AAI] Failed to read cached token:', err.message);
      }
    }

    return this.refreshAccessToken();
  }

  async refreshAccessToken() {
    if (!this.isConfigured()) return null;

    console.log('[OpenAIRE AAI] Negotiating a new access token...');
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    try {
      const res = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'CCSD Episciences support@episciences.org',
        },
        body: body.toString(),
      });

      if (!res.ok) {
        console.error(`[OpenAIRE AAI] Token negotiation failed (${res.status} ${res.statusText})`);
        return null;
      }

      const data = await res.json();
      const token = data.access_token;
      const expiresInSec = Number(data.expires_in) || 3600;
      // 120s safety margin so we never fire a request with an expired token.
      const ttlSec = Math.max(60, expiresInSec - 120);
      const expiresAt = Date.now() + ttlSec * 1000;

      fs.writeFileSync(this.tokenFilePath, JSON.stringify({ access_token: token, expires_at: expiresAt }, null, 2));
      console.log(`[OpenAIRE AAI] New token acquired, valid for ${ttlSec}s`);
      return token;
    } catch (err) {
      console.error('[OpenAIRE AAI] Network error while requesting a token:', err.message);
      return null;
    }
  }

  clearTokenCache() {
    if (fs.existsSync(this.tokenFilePath)) {
      try {
        fs.unlinkSync(this.tokenFilePath);
      } catch {
        // best-effort
      }
    }
  }
}
