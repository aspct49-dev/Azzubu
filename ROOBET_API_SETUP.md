# Roobet API — Backend Proxy Setup

**Never put your API token in frontend JavaScript.** It would be visible to
anyone who opens the page. The token must live on a server you control;
the frontend calls *that* server, which adds the token and forwards to Roobet.

---

## Option A — Cloudflare Worker (recommended, free tier)

1. In Cloudflare dashboard → Workers & Pages → Create Worker
2. Paste this code:

```js
export default {
  async fetch(request, env) {
    // Adjust window: this month so far
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = now.toISOString();

    const url = new URL('https://roobetconnect.com/affiliate/v2/stats');
    url.searchParams.set('userId', env.ROOBET_USER_ID);
    url.searchParams.set('startDate', start);
    url.searchParams.set('endDate', end);
    url.searchParams.set('timestamp', Date.now().toString());
    // optionally: url.searchParams.set('categories', 'slots,casino');

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${env.ROOBET_API_TOKEN}` },
    });
    const data = await r.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',           // or your domain
        'Cache-Control': 'public, max-age=60',        // cache 60s
      },
    });
  },
};
```

3. Settings → Variables → add:
   - `ROOBET_API_TOKEN` = your token (mark as encrypted/secret)
   - `ROOBET_USER_ID` = your affiliate user id
4. Note the worker URL, e.g. `https://azzubu-roobet.your-name.workers.dev`

---

## Option B — Vercel / Next.js API route

`/api/roobet-leaderboard.js`:

```js
export default async function handler(req, res) {
  const start = new Date(new Date().setDate(1)).toISOString();
  const end = new Date().toISOString();
  const url = `https://roobetconnect.com/affiliate/v2/stats`
    + `?userId=${process.env.ROOBET_USER_ID}`
    + `&startDate=${start}&endDate=${end}`
    + `&timestamp=${Date.now()}`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.ROOBET_API_TOKEN}` },
  });
  res.setHeader('Cache-Control', 's-maxage=60');
  res.json(await r.json());
}
```

Set `ROOBET_API_TOKEN` and `ROOBET_USER_ID` in Vercel project env vars.

---

## Wire the frontend

Open `leaderboard.jsx` and replace the `fetchRoobetLeaderboard()` stub:

```js
async function fetchRoobetLeaderboard() {
  const r = await fetch('https://YOUR-WORKER-URL/');  // your proxy URL
  const raw = await r.json();

  // shape it for the UI
  return {
    periodStart: raw.startDate || new Date(new Date().setDate(1)).toISOString(),
    periodEnd:   raw.endDate   || new Date(new Date().setMonth(new Date().getMonth()+1, 1)).toISOString(),
    totalPrize:  1000,
    entries: raw
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 16)
      .map((row, i) => ({
        rank: i + 1,
        user: maskName(row.username),
        wagered: row.wagered,
        prize: PRIZE_TABLE[i] ?? 0,
      })),
  };
}

const PRIZE_TABLE = [400, 200, 150, 50, 40, 30, 25, 20, 15, 10, 10, 10, 10, 10, 10, 10];

function maskName(name) {
  if (!name || name.length <= 4) return '****' + (name ?? '');
  return '*'.repeat(name.length - 4) + name.slice(-4);
}
```

---

## Before you go live

- [ ] **Rotate the token you pasted** — it's compromised the moment it left your machine.
- [ ] Lock the worker's `Access-Control-Allow-Origin` to your actual domain (not `*`).
- [ ] Cache 30–120s so you don't burn your API quota on every page load.
- [ ] Test the proxy URL in your browser — it should return JSON, not an error.
