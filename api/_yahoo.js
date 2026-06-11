// api/_yahoo.js — shared helper, imported by all API route files
// Vercel serverless functions can share module-level state within a warm instance.
// Crumb/cookie will be re-fetched when the instance is cold or on 401/403.

let _cookie = null;
let _crumb = null;

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.5',
};

export async function getYahooCrumb() {
  if (_crumb && _cookie) return { crumb: _crumb, cookie: _cookie };

  const consentRes = await fetch('https://finance.yahoo.com/', {
    headers: {
      'User-Agent': BASE_HEADERS['User-Agent'],
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    redirect: 'follow',
  });

  const rawCookies = consentRes.headers.getSetCookie?.() || [];
  const cookieStr = rawCookies.map(c => c.split(';')[0]).join('; ');
  _cookie = cookieStr || 'A1=d=AQA';

  const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { ...BASE_HEADERS, Cookie: _cookie },
  });

  _crumb = crumbRes.ok ? (await crumbRes.text()).trim() : null;
  return { crumb: _crumb, cookie: _cookie };
}

export async function yahooFetch(url, useCrumb = false) {
  let fullUrl = url;
  const headers = { ...BASE_HEADERS };

  if (useCrumb) {
    const { crumb, cookie } = await getYahooCrumb();
    if (crumb) fullUrl += (url.includes('?') ? '&' : '?') + `crumb=${encodeURIComponent(crumb)}`;
    if (cookie) headers['Cookie'] = cookie;
  }

  const res = await fetch(fullUrl, { headers });

  if (useCrumb && (res.status === 401 || res.status === 403)) {
    _crumb = null;
    _cookie = null;
    const { crumb, cookie } = await getYahooCrumb();
    let retryUrl = url;
    if (crumb) retryUrl += (url.includes('?') ? '&' : '?') + `crumb=${encodeURIComponent(crumb)}`;
    const retry = await fetch(retryUrl, { headers: { ...BASE_HEADERS, Cookie: cookie || '' } });
    if (!retry.ok) throw new Error(`Yahoo Finance error: ${retry.status} on retry`);
    return retry.json();
  }

  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
  return res.json();
}

export function toSymbol(ticker) {
  const t = ticker.toUpperCase();
  return t.includes('.JK') ? t : `${t}.JK`;
}

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
