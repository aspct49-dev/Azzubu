const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const tls = require('tls');
const { execFile } = require('child_process');

// ── Roobet ──────────────────────────────────────────────────────────────────
const API_TOKEN = fs.readFileSync(path.join(__dirname, 'roobet_api_key'), 'utf8').trim();
const payload = JSON.parse(Buffer.from(API_TOKEN.split('.')[1], 'base64url').toString());
const USER_ID = payload.id;

// ── Discord ──────────────────────────────────────────────────────────────────
let DISCORD_CLIENT_ID = null, DISCORD_CLIENT_SECRET = null;
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'discord_config.json'), 'utf8'));
  if (cfg.client_id && cfg.client_id !== 'YOUR_DISCORD_CLIENT_ID') {
    DISCORD_CLIENT_ID = cfg.client_id;
    DISCORD_CLIENT_SECRET = cfg.client_secret;
    console.log('Discord OAuth2 enabled, client_id:', DISCORD_CLIENT_ID);
  } else {
    console.warn('discord_config.json not filled in — Discord login disabled');
  }
} catch (e) {
  console.warn('discord_config.json not found — Discord login disabled');
}

const DISCORD_REDIRECT_URI = 'http://localhost:8080/api/auth/discord/callback';
let DISCORD_WEBHOOK_URL = null;
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'discord_config.json'), 'utf8'));
  if (cfg.webhook_url && cfg.webhook_url !== 'YOUR_DISCORD_WEBHOOK_URL') {
    DISCORD_WEBHOOK_URL = cfg.webhook_url;
    console.log('Discord webhook enabled');
  }
} catch {}
const ADMIN_USERNAMES = ['aspectdzns_', 'aaevo'];
const sessions = new Map();

// ── Daily claims ─────────────────────────────────────────────────────────────
const DAILY_FILE = path.join(__dirname, 'daily_claims.json');
function loadDaily() {
  try { return JSON.parse(fs.readFileSync(DAILY_FILE, 'utf8')); }
  catch { return {}; }
}
function saveDaily(d) { fs.writeFileSync(DAILY_FILE, JSON.stringify(d, null, 2)); }
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

// ── User profiles ─────────────────────────────────────────────────────────────
const PROFILES_FILE = path.join(__dirname, 'user_profiles.json');
function loadProfiles() {
  try { return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8')); }
  catch { return {}; }
}
function saveProfiles(d) { fs.writeFileSync(PROFILES_FILE, JSON.stringify(d, null, 2)); }

// ── WebSocket client ─────────────────────────────────────────────────────────
function wsConnect(host, port, wsPath, { onOpen, onMessage, onClose } = {}) {
  const key = crypto.randomBytes(16).toString('base64');
  const socket = tls.connect({ host, port, servername: host }, () => {
    socket.write(
      `GET ${wsPath} HTTP/1.1\r\nHost: ${host}\r\nUpgrade: websocket\r\n` +
      `Connection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`
    );
  });
  let upgraded = false, buf = Buffer.alloc(0);
  socket.on('data', chunk => {
    buf = Buffer.concat([buf, chunk]);
    if (!upgraded) {
      const i = buf.indexOf('\r\n\r\n');
      if (i < 0) return;
      upgraded = true; buf = buf.slice(i + 4);
      if (onOpen) onOpen();
    }
    while (buf.length >= 2) {
      const opcode = buf[0] & 0x0f;
      let len = buf[1] & 0x7f, offset = 2;
      if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); offset = 4; }
      else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); offset = 10; }
      if (buf.length < offset + len) break;
      const payload = buf.slice(offset, offset + len); buf = buf.slice(offset + len);
      if (opcode === 1) { try { if (onMessage) onMessage(payload.toString()); } catch {} }
      else if (opcode === 9) wsSendFrame(socket, 0x8A, Buffer.alloc(0));
      else if (opcode === 8) socket.destroy();
    }
  });
  socket.on('error', e => { console.error('WS error:', e.message); if (onClose) onClose(); });
  socket.on('close', () => { if (onClose) onClose(); });
  return socket;
}
function wsSendFrame(socket, opcode, data) {
  const mask = crypto.randomBytes(4), masked = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ mask[i % 4];
  const lenByte = data.length < 126 ? data.length : 126;
  const lenExtra = data.length < 126 ? [] : [(data.length >> 8) & 0xff, data.length & 0xff];
  socket.write(Buffer.concat([Buffer.from([opcode, 0x80 | lenByte, ...lenExtra, ...mask]), masked]));
}
function wsSendJSON(socket, obj) { wsSendFrame(socket, 0x81, Buffer.from(JSON.stringify(obj))); }

// ── Giveaway ──────────────────────────────────────────────────────────────────
const giveaway = {
  connected: false, active: false, keyword: '!enter',
  entries: new Map(), winners: [], socket: null, chatroomId: null,
};
function giveawaySnap() {
  return {
    connected: giveaway.connected, active: giveaway.active, keyword: giveaway.keyword,
    entries: Array.from(giveaway.entries.values()), winners: giveaway.winners, chatroomId: giveaway.chatroomId,
  };
}
function handleKickMsg(username, content) {
  if (!giveaway.active) return;
  const kw = giveaway.keyword.trim().toLowerCase();
  const msg = content.trim().toLowerCase();
  if (msg === kw || msg.startsWith(kw + ' ')) {
    const key = username.toLowerCase();
    if (!giveaway.entries.has(key))
      giveaway.entries.set(key, { username, joinedAt: new Date().toISOString(), message: content });
  }
}
function kickGet(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get({
      hostname: 'kick.com', path,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Referer': 'https://kick.com/',
        ...headers,
      },
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
  });
}

function curlGet(url) {
  return new Promise((resolve, reject) => {
    execFile(process.platform === 'win32' ? 'curl.exe' : 'curl', ['-s', '-L', '--max-time', '10',
      '-H', 'Accept: application/json',
      '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      url
    ], { maxBuffer: 8 * 1024 * 1024 }, (err, stdout) => {
      if (err) reject(err); else resolve(stdout);
    });
  });
}

async function getKickChatroomId(channel) {
  // Strategy 1: Node https (fast, may be blocked by Cloudflare)
  try {
    const { status, body } = await kickGet(`/api/v2/channels/${channel}`);
    if (status === 200) {
      const data = JSON.parse(body);
      if (data.chatroom?.id) { console.log('Chatroom ID via Node https:', data.chatroom.id); return data.chatroom.id; }
    }
  } catch {}

  // Strategy 2: curl (bypasses Cloudflare's Node TLS fingerprint detection)
  try {
    const stdout = await curlGet(`https://kick.com/api/v2/channels/${channel}`);
    const data = JSON.parse(stdout);
    if (data.chatroom?.id) { console.log('Chatroom ID via curl:', data.chatroom.id); return data.chatroom.id; }
  } catch (e) { console.error('curl strategy failed:', e.message); }

  throw new Error('Could not get chatroom ID for ' + channel);
}

function connectKickChat(channel) {
  return new Promise(async (resolve, reject) => {
  if (giveaway.socket) { giveaway.socket.destroy(); giveaway.socket = null; }
  let chatroomId;
  try { chatroomId = await getKickChatroomId(channel); }
  catch (e) { return reject(e); }
  giveaway.chatroomId = chatroomId;
  const PUSHER_KEY = '32cbd69e4b950bf97679';
  let settled = false;
  let pingTimer = null;
  const timeout = setTimeout(() => {
    if (settled) return;
    settled = true;
    if (giveaway.socket) { giveaway.socket.destroy(); giveaway.socket = null; }
    reject(new Error('Pusher connection timed out — no connection_established event'));
  }, 10000);
  const sock = wsConnect('ws-us2.pusher.com', 443,
    `/app/${PUSHER_KEY}?protocol=7&client=js&version=7.6.0&flash=false`,
    {
      onOpen: () => { console.log('WS TLS handshake done, waiting for Pusher connection_established…'); },
      onMessage: raw => {
        try {
          const frame = JSON.parse(raw);
          if (frame.event === 'pusher:connection_established') {
            console.log('Pusher established, subscribing to chatroom', chatroomId);
            wsSendJSON(sock, { event: 'pusher:subscribe', data: { channel: `chatrooms.${chatroomId}.v2` } });
            giveaway.connected = true;
            console.log(`Kick chat connected: chatroom ${chatroomId}`);
            clearTimeout(timeout);
            pingTimer = setInterval(() => { try { wsSendJSON(sock, { event: 'pusher:ping', data: {} }); } catch {} }, 30000);
            if (!settled) { settled = true; resolve(); }
          }
          if (frame.event === 'pusher:ping') wsSendJSON(sock, { event: 'pusher:pong', data: {} });
          if (frame.event === 'pusher:error') console.error('Pusher error:', frame.data);
          if (frame.event === 'App\\Events\\ChatMessageEvent') {
            const d = JSON.parse(frame.data);
            const user = d.sender?.username || d.sender?.slug;
            if (user && d.content) handleKickMsg(user, d.content);
          }
        } catch {}
      },
      onClose: () => {
        giveaway.connected = false; giveaway.socket = null;
        if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
        console.log('Kick chat disconnected');
        clearTimeout(timeout);
        if (!settled) { settled = true; reject(new Error('Pusher closed connection before subscription confirmed')); }
      },
    }
  );
  giveaway.socket = sock;
  });
}

// ── GTB state ────────────────────────────────────────────────────────────────
const GTB_FILE = path.join(__dirname, 'gtb_state.json');
function loadGTB() {
  try { return JSON.parse(fs.readFileSync(GTB_FILE, 'utf8')); }
  catch { return { game: null, guesses: [] }; }
}
function saveGTB(s) { fs.writeFileSync(GTB_FILE, JSON.stringify(s, null, 2)); }

// ── Helpers ──────────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html', '.css': 'text/css',
  '.js': 'application/javascript', '.jsx': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function parseCookies(str = '') {
  const out = {};
  for (const part of str.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const s = sessions.get(cookies.az_session);
  return s && s.expires > Date.now() ? s : null;
}

function fetchJson(url, token) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Bad JSON: ' + body.slice(0, 300))); }
      });
    }).on('error', reject);
  });
}

function readBody(req) {
  return new Promise(resolve => {
    let b = '';
    req.on('data', c => b += c);
    req.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve({}); } });
  });
}

function postForm(hostname, path, params) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const req = https.request({
      hostname, path, method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Bad JSON: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function fireWebhook(webhookUrl, payload) {
  const body = JSON.stringify(payload);
  const u = new URL(webhookUrl);
  const req = https.request({
    hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, res => res.resume());
  req.on('error', e => console.error('Webhook error:', e.message));
  req.write(body);
  req.end();
}

// ── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const urlPath = req.url.split('?')[0];

  // ── Roobet proxy ────────────────────────────────────────────────────────
  if (urlPath === '/api/roobet-leaderboard') {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = now.toISOString();
    const url = `https://roobetconnect.com/affiliate/v2/stats?userId=${USER_ID}&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}&timestamp=${Date.now()}`;
    try {
      const data = await fetchJson(url, API_TOKEN);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (e) {
      console.error('Roobet API error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Discord auth: start ──────────────────────────────────────────────────
  if (urlPath === '/api/auth/discord') {
    if (!DISCORD_CLIENT_ID) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Discord OAuth not configured' }));
      return;
    }
    const authUrl = 'https://discord.com/oauth2/authorize'
      + `?client_id=${DISCORD_CLIENT_ID}`
      + `&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}`
      + `&response_type=code&scope=identify`;
    res.writeHead(302, { Location: authUrl });
    res.end();
    return;
  }

  // ── Discord auth: callback ───────────────────────────────────────────────
  if (urlPath === '/api/auth/discord/callback') {
    const params = new URL(req.url, 'http://localhost').searchParams;
    const code = params.get('code');
    if (!code) { res.writeHead(302, { Location: '/?error=no_code' }); res.end(); return; }
    try {
      const tokenData = await postForm('discord.com', '/api/oauth2/token', {
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      });
      if (!tokenData.access_token) throw new Error(JSON.stringify(tokenData));

      const user = await fetchJson('https://discord.com/api/users/@me', tokenData.access_token);
      const token = crypto.randomBytes(32).toString('hex');
      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
        : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(user.id) % 5n)}.png`;

      const username = user.global_name || user.username;
      const isAdmin = ADMIN_USERNAMES.some(n =>
        n === user.username || n === user.global_name || n.toLowerCase() === user.username?.toLowerCase()
      );
      console.log(`Login: username="${user.username}" global_name="${user.global_name}" isAdmin=${isAdmin}`);
      sessions.set(token, {
        id: user.id,
        username,
        avatarUrl,
        isAdmin,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      res.writeHead(302, {
        Location: '/',
        'Set-Cookie': `az_session=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}`,
      });
      res.end();
    } catch (e) {
      console.error('Discord callback error:', e.message);
      res.writeHead(302, { Location: '/?error=auth_failed' });
      res.end();
    }
    return;
  }

  // ── Auth: current user ───────────────────────────────────────────────────
  if (urlPath === '/api/auth/me') {
    const s = getSession(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(s ? { id: s.id, username: s.username, avatarUrl: s.avatarUrl, isAdmin: s.isAdmin } : null));
    return;
  }

  // ── Admin: raw leaderboard ───────────────────────────────────────────────
  if (urlPath === '/api/admin/leaderboard') {
    const s = getSession(req);
    if (!s || !s.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = now.toISOString();
    const url = `https://roobetconnect.com/affiliate/v2/stats?userId=${USER_ID}&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}&timestamp=${Date.now()}`;
    try {
      const data = await fetchJson(url, API_TOKEN);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── GTB: public state ────────────────────────────────────────────────────
  if (urlPath === '/api/gtb' && req.method === 'GET') {
    const s = getSession(req);
    const { game, guesses } = loadGTB();
    if (!game) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('null'); return; }
    const myGuess = s ? (guesses.find(g => g.userId === s.id)?.guess ?? null) : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ...game, totalGuesses: guesses.length, myGuess }));
    return;
  }

  // ── GTB: submit guess ────────────────────────────────────────────────────
  if (urlPath === '/api/gtb/guess' && req.method === 'POST') {
    const s = getSession(req);
    if (!s) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Login required' })); return; }
    const body = await readBody(req);
    const state = loadGTB();
    if (!state.game || state.game.status !== 'open') {
      res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Entries are closed' })); return;
    }
    const guess = Number(body.guess);
    if (!guess || guess <= 0) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Invalid guess' })); return; }
    const entry = { userId: s.id, username: s.username, avatarUrl: s.avatarUrl, guess, submittedAt: new Date().toISOString() };
    const idx = state.guesses.findIndex(g => g.userId === s.id);
    if (idx >= 0) state.guesses[idx] = entry; else state.guesses.push(entry);
    saveGTB(state);
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── GTB: admin create ────────────────────────────────────────────────────
  if (urlPath === '/api/gtb/create' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const body = await readBody(req);
    const game = {
      id: Date.now().toString(),
      startBalance: Number(body.startBalance),
      numBonuses: Number(body.numBonuses),
      status: 'open',
      createdAt: new Date().toISOString(),
      finalBalance: null, winner: null, winnerGuess: null, offBy: null, drawnAt: null,
    };
    saveGTB({ game, guesses: [] });
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(game));
    return;
  }

  // ── GTB: admin close entries ─────────────────────────────────────────────
  if (urlPath === '/api/gtb/close' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const state = loadGTB();
    if (!state.game) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'No active game' })); return; }
    state.game.status = 'closed';
    saveGTB(state);
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(state.game));
    return;
  }

  // ── GTB: admin draw winner ───────────────────────────────────────────────
  if (urlPath === '/api/gtb/draw' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const body = await readBody(req);
    const state = loadGTB();
    if (!state.game) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'No active game' })); return; }
    const finalBalance = Number(body.finalBalance);
    if (!finalBalance || finalBalance <= 0) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Invalid final balance' })); return; }
    let winner = null, minDiff = Infinity;
    for (const g of state.guesses) {
      const diff = Math.abs(g.guess - finalBalance);
      if (diff < minDiff) { minDiff = diff; winner = g; }
    }
    state.game.status = 'drawn';
    state.game.finalBalance = finalBalance;
    state.game.winner = winner?.username ?? null;
    state.game.winnerUserId = winner?.userId ?? null;
    state.game.winnerGuess = winner?.guess ?? null;
    state.game.offBy = winner ? Math.abs(winner.guess - finalBalance) : null;
    state.game.drawnAt = new Date().toISOString();
    if (!state.history) state.history = [];
    state.history.unshift({ ...state.game, totalGuesses: state.guesses.length });
    saveGTB(state);
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(state.game));
    return;
  }

  // ── GTB: admin reset (archive + clear) ──────────────────────────────────
  if (urlPath === '/api/gtb/reset' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const state = loadGTB();
    if (state.game) {
      const archived = { ...state.game, totalGuesses: state.guesses.length, archivedAt: new Date().toISOString() };
      if (!state.history) state.history = [];
      state.history.unshift(archived);
    }
    state.game = null;
    state.guesses = [];
    saveGTB(state);
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── GTB: admin view all guesses ──────────────────────────────────────────
  if (urlPath === '/api/admin/gtb' && req.method === 'GET') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(loadGTB()));
    return;
  }

  // ── Daily: status ────────────────────────────────────────────────────────
  if (urlPath === '/api/daily' && req.method === 'GET') {
    const s = getSession(req);
    if (!s) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ loggedIn: false })); return; }
    const claims = loadDaily();
    const last = claims[s.id]?.lastClaim ?? null;
    const cooldownRemaining = last ? Math.max(0, COOLDOWN_MS - (Date.now() - new Date(last).getTime())) : 0;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ loggedIn: true, canClaim: cooldownRemaining === 0, cooldownRemaining, lastClaim: last }));
    return;
  }

  // ── Daily: claim ─────────────────────────────────────────────────────────
  if (urlPath === '/api/daily/claim' && req.method === 'POST') {
    const s = getSession(req);
    if (!s) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Login required' })); return; }
    const body = await readBody(req);
    const roobetUsername = (body.roobetUsername || '').trim();
    const claims = loadDaily();
    const last = claims[s.id]?.lastClaim ?? null;
    const cooldownRemaining = last ? Math.max(0, COOLDOWN_MS - (Date.now() - new Date(last).getTime())) : 0;
    if (cooldownRemaining > 0) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Cooldown active', cooldownRemaining }));
      return;
    }
    const now = new Date().toISOString();
    const existing = claims[s.id] || {};
    claims[s.id] = {
      username: s.username,
      avatarUrl: s.avatarUrl,
      lastClaim: now,
      claims: [...(existing.claims || []), { claimedAt: now, roobetUsername, status: 'pending' }],
    };
    saveDaily(claims);

    if (roobetUsername) {
      const profiles = loadProfiles();
      profiles[s.id] = { roobetUsername, updatedAt: now };
      saveProfiles(profiles);
    }

    if (DISCORD_WEBHOOK_URL) {
      fireWebhook(DISCORD_WEBHOOK_URL, {
        embeds: [{
          title: '🎯 Affiliate Claim',
          color: 0x7DC8FF,
          thumbnail: { url: s.avatarUrl },
          fields: [
            { name: 'Discord', value: s.username, inline: true },
            { name: 'Roobet Username', value: roobetUsername || 'Not provided', inline: true },
            { name: 'Date & Time', value: new Date(now).toUTCString(), inline: false },
          ],
          timestamp: now,
          footer: { text: 'azzubu.com' },
        }],
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── Admin: all affiliate claims ───────────────────────────────────────────
  if (urlPath === '/api/admin/claims' && req.method === 'GET') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const all = loadDaily();
    const flat = [];
    for (const userId of Object.keys(all)) {
      const u = all[userId];
      for (const c of (u.claims || [])) {
        flat.push({
          userId,
          discordUsername: u.username,
          avatarUrl: u.avatarUrl,
          claimedAt: c.claimedAt,
          roobetUsername: c.roobetUsername || '',
          status: c.status || 'pending',
          claimedOutAt: c.claimedOutAt || null,
        });
      }
    }
    flat.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(flat));
    return;
  }

  // ── Admin: mark claim as claimed ──────────────────────────────────────────
  if (urlPath === '/api/admin/claims/mark' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const body = await readBody(req);
    const { userId, claimedAt, status } = body;
    const all = loadDaily();
    const u = all[userId];
    if (!u) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'User not found' })); return; }
    const c = (u.claims || []).find(x => x.claimedAt === claimedAt);
    if (!c) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Claim not found' })); return; }
    c.status = status === 'pending' ? 'pending' : 'claimed';
    c.claimedOutAt = c.status === 'claimed' ? new Date().toISOString() : null;
    saveDaily(all);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── User: get profile ─────────────────────────────────────────────────────
  if (urlPath === '/api/user/profile' && req.method === 'GET') {
    const s = getSession(req);
    if (!s) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Login required' })); return; }
    const profiles = loadProfiles();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(profiles[s.id] || {}));
    return;
  }

  // ── User: save profile ────────────────────────────────────────────────────
  if (urlPath === '/api/user/profile' && req.method === 'POST') {
    const s = getSession(req);
    if (!s) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Login required' })); return; }
    const body = await readBody(req);
    const profiles = loadProfiles();
    profiles[s.id] = { roobetUsername: (body.roobetUsername || '').trim(), updatedAt: new Date().toISOString() };
    saveProfiles(profiles);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── User: claims history ──────────────────────────────────────────────────
  if (urlPath === '/api/user/claims' && req.method === 'GET') {
    const s = getSession(req);
    if (!s) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Login required' })); return; }
    const claims = loadDaily();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(claims[s.id]?.claims || []));
    return;
  }

  // ── Kick: chatroom ID lookup ──────────────────────────────────────────────
  if (urlPath === '/api/kick/chatroom' && req.method === 'GET') {
    const channel = new URL(req.url, 'http://localhost').searchParams.get('channel') || 'azzubu';
    try {
      const id = await getKickChatroomId(channel);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ chatroomId: id }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Giveaway: state ──────────────────────────────────────────────────────
  if (urlPath === '/api/giveaway' && req.method === 'GET') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(giveawaySnap())); return;
  }
  // ── Giveaway: connect ─────────────────────────────────────────────────────
  if (urlPath === '/api/giveaway/connect' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const body = await readBody(req);
    try {
      await connectKickChat('azzubu');
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true, chatroomId: giveaway.chatroomId }));
    } catch (e) { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: e.message })); }
    return;
  }
  // ── Giveaway: disconnect ──────────────────────────────────────────────────
  if (urlPath === '/api/giveaway/disconnect' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    if (giveaway.socket) { giveaway.socket.destroy(); giveaway.socket = null; }
    giveaway.connected = false; giveaway.active = false;
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true })); return;
  }
  // ── Giveaway: start collecting ────────────────────────────────────────────
  if (urlPath === '/api/giveaway/start' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const body = await readBody(req);
    if (body.keyword) giveaway.keyword = body.keyword.trim();
    giveaway.active = true;
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true })); return;
  }
  // ── Giveaway: stop collecting ─────────────────────────────────────────────
  if (urlPath === '/api/giveaway/stop' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    giveaway.active = false;
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true })); return;
  }
  // ── Giveaway: spin ────────────────────────────────────────────────────────
  if (urlPath === '/api/giveaway/spin' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const entries = Array.from(giveaway.entries.values());
    if (!entries.length) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'No entries' })); return; }
    const winner = entries[Math.floor(Math.random() * entries.length)];
    const wonAt = new Date().toISOString();
    giveaway.entries.delete(winner.username.toLowerCase());
    giveaway.winners.unshift({ ...winner, wonAt });
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true, winner: { ...winner, wonAt } })); return;
  }
  // ── Giveaway: remove entry ────────────────────────────────────────────────
  if (urlPath === '/api/giveaway/remove' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    const body = await readBody(req);
    giveaway.entries.delete((body.username || '').toLowerCase());
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true })); return;
  }
  // ── Giveaway: clear ───────────────────────────────────────────────────────
  if (urlPath === '/api/giveaway/clear' && req.method === 'POST') {
    const s = getSession(req);
    if (!s?.isAdmin) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Forbidden' })); return; }
    giveaway.entries.clear(); giveaway.winners = [];
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true })); return;
  }

  // ── Auth: logout ─────────────────────────────────────────────────────────
  if (urlPath === '/api/auth/logout') {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.az_session) sessions.delete(cookies.az_session);
    res.writeHead(302, {
      Location: '/',
      'Set-Cookie': 'az_session=; HttpOnly; Path=/; Max-Age=0',
    });
    res.end();
    return;
  }

  // ── Static files ─────────────────────────────────────────────────────────
  const filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(8080, () => {
  console.log('azzubu server → http://localhost:8080');
  console.log('Roobet proxy  → http://localhost:8080/api/roobet-leaderboard');
  console.log('userId:', USER_ID);
});
