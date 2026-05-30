const { useState, useEffect, useRef } = React;

/* ====================== Icons ====================== */
const I = {
  home: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>,
  trophy: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 4h8v3a4 4 0 0 1-8 0V4z"/><path d="M8 4H5v2a3 3 0 0 0 3 3"/><path d="M16 4h3v2a3 3 0 0 1-3 3"/><path d="M10 14h4v3h-4z"/><path d="M9 17h6v3H9z"/></svg>,
  gift: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M4 12v9h16v-9"/><path d="M12 8v13"/><path d="M12 8s-2-4-5-4a2 2 0 0 0 0 4h5z"/><path d="M12 8s2-4 5-4a2 2 0 0 1 0 4h-5z"/></svg>,
  target: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>,
  store: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7l1.5-3h13L20 7"/><rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M8 7v3a2 2 0 0 1-4 0V7"/><path d="M16 7v3a2 2 0 0 0 4 0V7"/></svg>,
  cal: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/></svg>,
  flag: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>,
  calc: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8"/><circle cx="8.5" cy="12" r=".5" fill="currentColor"/><circle cx="12" cy="12" r=".5" fill="currentColor"/><circle cx="15.5" cy="12" r=".5" fill="currentColor"/><circle cx="8.5" cy="16" r=".5" fill="currentColor"/><circle cx="12" cy="16" r=".5" fill="currentColor"/><circle cx="15.5" cy="16" r=".5" fill="currentColor"/></svg>,
  crown: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8z"/></svg>,
  coin: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg>,
  chev: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>,
  copy: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  arrowR: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  globe: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  help: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 1-1 1.7"/><circle cx="12" cy="17" r=".8" fill="currentColor"/></svg>,
  card: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>,
  discord: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M20.3 4.4A19.3 19.3 0 0 0 15.2 3c-.2.4-.5.9-.7 1.3a17.8 17.8 0 0 0-5 0A13 13 0 0 0 8.8 3a19.3 19.3 0 0 0-5.1 1.4A19.8 19.8 0 0 0 .4 17.8a19.4 19.4 0 0 0 5.9 3 14 14 0 0 0 1.2-2 12.8 12.8 0 0 1-2-.9c.2-.1.3-.2.5-.4a13.8 13.8 0 0 0 11.8 0l.5.4a12.8 12.8 0 0 1-2 .9 14 14 0 0 0 1.2 2 19.4 19.4 0 0 0 5.9-3A19.8 19.8 0 0 0 20.3 4.4zM8 15c-1.1 0-2-.9-2-2.1S7 10.9 8 10.9s2 .9 2 2S9.1 15 8 15zm7.9 0c-1.1 0-2-.9-2-2.1s.9-2 2-2 2 .9 2 2-.9 2.1-2 2.1z"/></svg>,
  // socials
  kick: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M3 4h4v5l4-5h5l-5 6 5 6h-5l-4-5v5H3V4z"/></svg>,
  twitter: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.3L4.5 21H1.4l7.5-8.6L1 3h6.5l4.5 6L17.5 3zm-1.1 16h1.8L7.7 5H5.8l10.6 14z"/></svg>,
  twitch: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M4 3h17v12l-5 5h-3l-3 3H7v-3H3V6l1-3zm1 2v12h3v2.5L10.5 17H14l4-4V5H5zm9 3h2v5h-2V8zm-5 0h2v5H9V8z"/></svg>,
  tiktok: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16 3h3c.2 2.3 1.7 4 4 4.2v3c-1.6 0-3-.4-4.2-1.1v6.4c0 3.6-2.9 6.5-6.5 6.5S5.8 19.1 5.8 15.5 8.7 9 12.3 9c.4 0 .8 0 1.2.1v3.2c-.4-.1-.8-.2-1.2-.2-1.8 0-3.3 1.5-3.3 3.3s1.5 3.3 3.3 3.3 3.3-1.5 3.3-3.3V3z"/></svg>,
  play: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 4l14 8-14 8z"/></svg>,
  shuffle: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  stop: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6"/></svg>,
  checkCircle: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  msg: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  users: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  wifi: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  wifiOff: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  x: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  menu: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
};

/* ====================== Sidebar ====================== */
function Sidebar({ active, onChange, user, open, onClose }) {
  const items = [
    { id: 'home', label: 'Home', icon: I.home },
    { id: 'lb', label: 'Leaderboard', icon: I.trophy, chip: <span className="chip chip-warn">$1K</span> },
    { id: 'guess', label: 'Guess The Balance', icon: I.target },
    { id: 'daily', label: 'Daily Rewards', icon: I.gift, chip: <span className="chip chip-good">FREE</span> },
    ...(user ? [{ id: 'profile', label: 'My Profile', icon: I.card }] : []),
    ...(user?.isAdmin ? [{ id: 'admin', label: 'Admin', icon: I.flag, chip: <span className="chip chip-violet">ADMIN</span> }] : []),
  ];
  const handleClick = (id) => { onChange(id); onClose?.(); };
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <img src="assets/azzubu-logo.png" alt="azzubu" />
      </div>

      <nav className="nav">
        {items.map(it => {
          const Icon = it.icon;
          return (
            <div key={it.id}
              className={`nav-item ${active === it.id ? 'active' : ''}`}
              onClick={() => handleClick(it.id)}>
              <Icon/>
              <span className="label">{it.label}</span>
              {it.chip}
            </div>
          );
        })}
      </nav>

      <div className="section-label">Play on</div>
      <div className="play-on">
        <a href="https://roobet.com/?ref=azzubu" target="_blank" rel="noopener noreferrer" className="partner-btn partner-btn-img">
          <img src="assets/roobet-logo.png" alt="Roobet" />
        </a>
      </div>

      <a href="https://discord.gg/Prw3aHG6q" target="_blank" rel="noopener noreferrer" className="kyc">
        <div className="kyc-head">
          <I.card/> KYC Help <span className="chip chip-violet" style={{marginLeft: 'auto'}}>TICKET</span>
        </div>
        <div className="kyc-note">Need KYC help? Open a ticket in our Discord.</div>
      </a>

      <div className="sidebar-user">
        {user ? (
          <>
            <img src={user.avatarUrl} alt="" className="sidebar-user-avatar"/>
            <span className="sidebar-user-name">{user.username}</span>
            <a href="/api/auth/logout" className="btn btn-ghost sidebar-logout">Log out</a>
          </>
        ) : (
          <a href="/api/auth/discord" className="btn btn-discord sidebar-login">
            <I.discord style={{width:15,height:15}}/> Login
          </a>
        )}
      </div>
    </aside>
  );
}

/* ====================== Topbar ====================== */
function Topbar({ user }) {
  return <div className="topbar"/>;
}

/* ====================== Hero ====================== */
function Hero() {
  return (
    <section className="hero">
      <div>
        <div className="hero-badge">
          <I.star style={{width: 14, height: 14}}/> Live Stream Experience
        </div>
        <h1>Welcome To <span className="wordmark">Azzubu</span></h1>
        <p className="lede">
          Join the cloud. Earn rewards while you watch, climb leaderboards, snag raffle drops,
          and unlock VIP perks that follow you across the stream.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-cyan btn-lg">
            <I.crown style={{width: 16, height: 16}}/> Join VIP Now
          </button>
          <button className="btn btn-outline btn-lg">
            <I.trophy style={{width: 16, height: 16}}/> View Leaderboard
          </button>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-num">$10K</div>
            <div className="stat-label">Total Rewards</div>
          </div>
          <div className="stat">
            <div className="stat-num">24/7</div>
            <div className="stat-label">Live Support</div>
          </div>
          <div className="stat">
            <div className="stat-num">1K+</div>
            <div className="stat-label">Members</div>
          </div>
        </div>
      </div>

      <StreamCard/>
    </section>
  );
}

function StreamCard() {
  return (
    <div className="stream-card">
      <div className="stream-frame">
        <iframe
          src="https://player.kick.com/azzubu"
          className="stream-iframe"
          allowFullScreen={true}
          allow="autoplay; fullscreen"
          title="azzubu live stream"
        />
      </div>
      <div className="socials">
        <a className="social" href="https://kick.com/azzubu" target="_blank" rel="noopener noreferrer"><img src="assets/kick-logo.webp" alt="Kick" className="social-img"/><span className="social-label">Kick</span></a>
        <a className="social" href="https://x.com/Azzubu" target="_blank" rel="noopener noreferrer"><img src="assets/x-logo.png" alt="X" className="social-img"/><span className="social-label">X</span></a>
        <a className="social" href="https://www.instagram.com/azzubu_" target="_blank" rel="noopener noreferrer"><img src="assets/insta-logo.webp" alt="Instagram" className="social-img social-img-lg"/><span className="social-label">Instagram</span></a>
        <a className="social" href="https://discord.gg/Prw3aHG6q" target="_blank" rel="noopener noreferrer"><img src="assets/discord-lgo.png" alt="Discord" className="social-img social-img-lg"/><span className="social-label">Discord</span></a>
      </div>
    </div>
  );
}

/* ====================== Partners ====================== */
function Partners({ onCopy }) {
  const partners = [
    {
      name: 'Roobet',
      domain: 'ROOBET.COM',
      logoImg: 'assets/roobet-logo.png',
      color: '#E7BE3F',
      mainLabel: 'MAIN BONUS',
      mainValue: 'INSTANT RAKEBACK',
      extraLabel: 'EXTRA',
      extraValue: 'WAGER LEADERBOARD',
    },
  ];
  return (
    <section className="section">
      <div className="section-head">
        <img src="assets/bonuses-logo.png" alt="bonuses" className="section-img" />
        <div className="sub">Use code <strong style={{color: '#7DC8FF'}}>AZZUBU</strong> on partner sites to unlock rewards</div>
      </div>
      <div className="partner-grid partner-grid-single">
        {partners.map(p => (
          <div key={p.name} className="partner-card" style={{'--accent': p.color}}>
            <div className="partner-logo">
              <img src={p.logoImg} alt={p.name} className="partner-logo-img" />
            </div>
            <div className="partner-row">
              <I.globe/> <span className="accent">{p.domain}</span>
            </div>
            <div className="bonus-tile main-bonus">
              <div className="bonus-label">{p.mainLabel}</div>
              <div className="bonus-value">{p.mainValue}</div>
              <div className="bonus-accent" style={{background: p.color}}/>
            </div>
            <div className="bonus-tile">
              <div className="bonus-label">{p.extraLabel}</div>
              <div className="bonus-value-sm">{p.extraValue}</div>
            </div>
            <div className="code-row">
              <div>
                <div className="code-label">Code</div>
                <div className="code-val">AZZUBU</div>
              </div>
              <button className="copy-btn" onClick={() => onCopy('AZZUBU')} title="Copy code">
                <I.copy/>
              </button>
            </div>
            <a href="https://roobet.com/?ref=azzubu" target="_blank" rel="noopener noreferrer" className="claim-btn" style={{background: p.color, color: '#0D2444', textDecoration: 'none', display: 'block', textAlign: 'center'}}>
              CLAIM BONUS
            </a>
            <a href="https://roobet.com/?ref=azzubu" target="_blank" rel="noopener noreferrer" className="how-link">
              <I.help style={{width: 14, height: 14}}/> HOW TO CLAIM BONUS
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ====================== FAQ ====================== */
function FAQ() {
  const qs = [
    { q: 'What is azzubu?',
      a: "azzubu is a community hub built around the stream — earn points while watching, compete on leaderboards, enter raffles, and unlock perks that travel with you across partner sites." },
    { q: 'How do I earn rewards?',
      a: "Watch the stream, drop in chat, and play on partner sites with the code AZZUBU. Every action drips points into your account that you can spend in the Store or save for raffles." },
    { q: 'How do I connect my accounts?',
      a: "Hit Sign In, link your Kick or Discord, then connect any partner accounts from your profile page. Your stats sync automatically once linked." },
    { q: 'How does the leaderboard work?',
      a: "Leaderboards reset monthly. Top wagerers on partner sites with code AZZUBU split the prize pool — current pool is $25K. Position updates every 15 minutes." },
    { q: 'How can I get support?',
      a: "Open a ticket in the Azzubu Discord under #support, or use the Help button bottom-right. We aim to respond within an hour." },
  ];
  const [open, setOpen] = useState(-1);
  return (
    <section className="section">
      <div className="section-head">
        <img src="assets/FAQ.png" alt="FAQ" className="section-img" />
        <div className="sub">Find answers to common questions</div>
      </div>
      <div className="faq-list">
        {qs.map((it, i) => (
          <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
            <div className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
              <span>{it.q}</span>
              <I.chev/>
            </div>
            <div className="faq-a">{it.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ====================== Daily Rewards ====================== */
function useMidnightCountdown() {
  const getMsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now); midnight.setHours(24,0,0,0);
    return midnight - now;
  };
  const [ms, setMs] = useState(getMsUntilMidnight);
  useEffect(() => {
    const t = setInterval(() => setMs(getMsUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  return ms;
}

function useCooldown(ms) {
  const [remaining, setRemaining] = useState(ms);
  useEffect(() => {
    if (ms <= 0) return;
    setRemaining(ms);
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1000)), 1000);
    return () => clearInterval(t);
  }, [ms]);
  return remaining;
}

function DailyRewards({ user }) {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [roobetInput, setRoobetInput] = useState('');
  const cooldown = useCooldown(status?.cooldownRemaining ?? 0);
  const midnightMs = useMidnightCountdown();

  const load = () => fetch('/api/daily').then(r => r.json()).then(setStatus).catch(() => {});
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (user) {
      fetch('/api/user/profile').then(r => r.json()).then(p => {
        if (p.roobetUsername) setRoobetInput(p.roobetUsername);
      }).catch(() => {});
    }
  }, [user]);

  const claim = async () => {
    if (!roobetInput.trim()) return;
    setBusy(true);
    const r = await fetch('/api/daily/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roobetUsername: roobetInput.trim() }),
    });
    const d = await r.json();
    setBusy(false);
    if (d.ok) { setClaimed(true); setShowForm(false); load(); }
  };

  const pad = n => String(n).padStart(2, '0');
  const fmtMs = ms => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return { h: pad(h), m: pad(m), s: pad(s) };
  };

  const onCooldown = !claimed && status?.loggedIn && !status?.canClaim && cooldown > 0;
  const timerMs = onCooldown ? cooldown : midnightMs;
  const { h, m, s } = fmtMs(timerMs);

  return (
    <section className="dr-section">
      <div className="dr-chip-bg"><img src="assets/azzubu-chip.png" alt=""/></div>

      <div className="dr-badge"><span className="dr-badge-dot"/> Monthly Rewards System</div>
      <h1 className="dr-title">100% Affiliate Money Back</h1>

      <div className="dr-timer-row">
        <div className="dr-timer-cell"><span className="dr-timer-num">{h}</span><span className="dr-timer-lbl">h</span></div>
        <span className="dr-timer-sep">:</span>
        <div className="dr-timer-cell"><span className="dr-timer-num">{m}</span><span className="dr-timer-lbl">m</span></div>
        <span className="dr-timer-sep">:</span>
        <div className="dr-timer-cell"><span className="dr-timer-num">{s}</span><span className="dr-timer-lbl">s</span></div>
        <svg className="dr-timer-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </div>
      <div className="dr-timer-sub">{onCooldown ? 'Time until next claim' : 'Time until day ends'}</div>

      <p className="dr-desc">Claim back 100% of your affiliate revenue throughout the month based on your wagering activity with code <strong style={{color:'var(--azz-bright)'}}>AZZUBU</strong></p>

      <div className="dr-actions">
        {!status && <div className="spinner"/>}

        {status && !status.loggedIn && (
          <a href="/api/auth/discord" className="btn btn-discord">
            <I.discord style={{width:16,height:16}}/> Login with Discord
          </a>
        )}

        {status?.loggedIn && (claimed || onCooldown) && (
          <div className="dr-claimed-state">
            {claimed && <div className="dr-success-pill"><I.check style={{width:14,height:14}}/> Claimed! Team notified.</div>}
            {onCooldown && !claimed && <div className="dr-cooldown-pill">Already claimed — resets in {h}h {m}m</div>}
          </div>
        )}

        {status?.loggedIn && status.canClaim && !claimed && !showForm && (
          <button className="dr-claim-btn" onClick={() => setShowForm(true)}>
            Claim Now
          </button>
        )}

        {status?.loggedIn && status.canClaim && !claimed && showForm && (
          <div className="dr-claim-form">
            <div className="dr-form-title">Enter your details to claim</div>
            <div className="dr-form-field">
              <label>Discord</label>
              <input type="text" className="dr-form-input dr-form-readonly" value={user?.username || ''} readOnly/>
            </div>
            <div className="dr-form-field">
              <label>Roobet Username</label>
              <input type="text" className="dr-form-input" value={roobetInput} onChange={e => setRoobetInput(e.target.value)} placeholder="Your Roobet username" autoFocus onKeyDown={e => e.key === 'Enter' && claim()}/>
            </div>
            <div className="dr-form-actions">
              <button className="dr-form-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="dr-claim-btn dr-claim-btn-sm" onClick={claim} disabled={busy || !roobetInput.trim()}>
                {busy ? <div className="spinner"/> : 'Submit Claim'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ====================== User Panel ====================== */
function UserPanel({ user }) {
  const [profile, setProfile] = useState(null);
  const [claims, setClaims] = useState(null);
  const [roobetInput, setRoobetInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/profile').then(r => r.json()).then(p => {
      setProfile(p);
      setRoobetInput(p.roobetUsername || '');
    }).catch(() => setProfile({}));
    fetch('/api/user/claims').then(r => r.json()).then(setClaims).catch(() => setClaims([]));
  }, [user]);

  const saveProfile = async () => {
    setSaving(true); setSaved(false);
    const r = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roobetUsername: roobetInput.trim() }),
    });
    const d = await r.json();
    setSaving(false);
    if (d.ok) setSaved(true);
  };

  if (!user) return (
    <section className="up-section">
      <div className="up-login-prompt">
        <p>Log in to view your profile and claim history.</p>
        <a href="/api/auth/discord" className="btn btn-discord"><I.discord style={{width:16,height:16}}/> Login with Discord</a>
      </div>
    </section>
  );

  return (
    <section className="up-section">
      <div className="up-profile-card">
        <img src={user.avatarUrl} alt="" className="up-avatar"/>
        <div className="up-profile-info">
          <div className="up-username">{user.username}</div>
          <div className="up-sub">Discord Member{user.isAdmin ? ' · Admin' : ''}</div>
        </div>
      </div>

      <div className="up-card">
        <div className="up-card-title">Roobet Account</div>
        <div className="up-card-sub">Link your Roobet username to speed up future claims</div>
        <div className="up-field-row">
          <input
            type="text"
            className="up-input"
            value={roobetInput}
            onChange={e => { setRoobetInput(e.target.value); setSaved(false); }}
            placeholder="Your Roobet username"
            onKeyDown={e => e.key === 'Enter' && saveProfile()}
          />
          <button className="btn btn-cyan" onClick={saveProfile} disabled={saving || !roobetInput.trim()}>
            {saving ? <div className="spinner"/> : saved ? <><I.check style={{width:14,height:14}}/> Saved</> : 'Save'}
          </button>
        </div>
        <div className="up-field-hint">Use code <strong style={{color:'var(--azz-bright)'}}>AZZUBU</strong> on Roobet to qualify for affiliate money back</div>
      </div>

      <div className="up-card">
        <div className="up-card-title">Claim History</div>
        {!claims && <div className="lb-loading"><div className="spinner"/></div>}
        {claims && claims.length === 0 && <div className="up-empty">No claims yet. Head to Daily Rewards to make your first claim!</div>}
        {claims && claims.length > 0 && (
          <div className="admin-table-wrap" style={{marginTop:14}}>
            <table className="admin-table">
              <thead><tr><th>#</th><th>Date &amp; Time</th><th>Roobet Username</th><th>Status</th></tr></thead>
              <tbody>
                {[...claims].reverse().map((c, i) => (
                  <tr key={i}>
                    <td className="admin-rank">{claims.length - i}</td>
                    <td className="admin-dim">{new Date(c.claimedAt).toLocaleString()}</td>
                    <td className="admin-user">{c.roobetUsername || '—'}</td>
                    <td><span className={`claim-status claim-${c.status || 'pending'}`}>{c.status || 'pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* ====================== Guess The Balance ====================== */
function GuessTheBalance({ user }) {
  const [game, setGame] = useState(undefined);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => fetch('/api/gtb').then(r => r.json()).then(setGame).catch(() => setGame(null));
  useEffect(() => { load(); }, []);

  const submitGuess = async () => {
    const n = parseFloat(input.replace(/[$,\s]/g, ''));
    if (isNaN(n) || n <= 0) { setMsg('Enter a valid number'); return; }
    setBusy(true); setMsg(null);
    const r = await fetch('/api/gtb/guess', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guess: n }) });
    const d = await r.json();
    setBusy(false);
    if (d.ok) { setMsg('Guess submitted!'); setInput(''); load(); } else setMsg(d.error || 'Error');
  };

  const fmt = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (game === undefined) return <section className="gtb-section"><div className="lb-loading"><div className="spinner"/></div></section>;

  return (
    <section className="gtb-section">
      <div className="gtb-badge"><I.target style={{width:13,height:13}}/> GUESS THE BALANCE</div>
      <h1 className="gtb-title">Bonus Hunt — Closest Wins</h1>
      <p className="gtb-sub">Submit your guess for the final bonus-hunt balance. The closest number when the admin draws wins.</p>

      {!game ? (
        <div className="gtb-empty">No active game right now. Check back during the next stream!</div>
      ) : (
        <div className="gtb-card">
          <div className="gtb-card-head">
            <div>
              <div className="gtb-start">{fmt(game.startBalance)} START</div>
              <div className="gtb-opened">Opened {new Date(game.createdAt).toLocaleString()}</div>
              {game.numBonuses > 0 && <div className="gtb-bonuses">{game.numBonuses} bonuses</div>}
            </div>
            <div className={`gtb-status-badge gtb-s-${game.status}`}>{game.status.charAt(0).toUpperCase() + game.status.slice(1)}</div>
          </div>

          {game.status === 'drawn' && (
            <div className="gtb-winner-wrap">
              <div className="gtb-trophy-icon"><I.trophy style={{width:38,height:38}}/></div>
              <div className="gtb-winner-name">{game.winner} won</div>
              <div className="gtb-winner-stats">
                <div className="gtb-wstat"><div className="gtb-wstat-lbl">Final Balance</div><div className="gtb-wstat-val">{fmt(game.finalBalance)}</div></div>
                <div className="gtb-wstat"><div className="gtb-wstat-lbl">Winning Guess</div><div className="gtb-wstat-val">{fmt(game.winnerGuess)}</div></div>
                <div className="gtb-wstat"><div className="gtb-wstat-lbl">Off By</div><div className="gtb-wstat-val">{fmt(game.offBy)}</div></div>
              </div>
              {game.myGuess !== null && <div className="gtb-my-label">Your guess was {fmt(game.myGuess)}</div>}
            </div>
          )}

          {game.status === 'open' && (
            <div className="gtb-guess-area">
              {!user ? (
                <a href="/api/auth/discord" className="btn btn-discord btn-lg"><I.discord style={{width:16,height:16}}/> Login with Discord to guess</a>
              ) : (
                <>
                  {game.myGuess !== null && (
                    <div className="gtb-my-guess">Your current guess: <strong>{fmt(game.myGuess)}</strong></div>
                  )}
                  <div className="gtb-input-row">
                    <span className="gtb-input-prefix">$</span>
                    <input className="gtb-input" type="number" min="0" step="1" placeholder={game.myGuess !== null ? 'Update guess…' : 'Enter your guess…'} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitGuess()} />
                    <button className="btn btn-cyan" onClick={submitGuess} disabled={busy}>
                      {game.myGuess !== null ? 'Update' : 'Submit Guess'}
                    </button>
                  </div>
                </>
              )}
              {msg && <div className="gtb-msg">{msg}</div>}
              <div className="gtb-count">{game.totalGuesses} guess{game.totalGuesses !== 1 ? 'es' : ''} submitted</div>
            </div>
          )}

          {game.status === 'closed' && (
            <div className="gtb-closed-wrap">
              <I.flag style={{width:20,height:20,color:'var(--warn)'}}/>
              <div>
                <div className="gtb-closed-title">Entries are closed</div>
                <div className="gtb-closed-sub">Waiting for the result — {game.totalGuesses} guesses submitted</div>
                {game.myGuess !== null && <div className="gtb-my-guess">Your guess: <strong>{fmt(game.myGuess)}</strong></div>}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ====================== Admin: GTB tab ====================== */
function AdminGTB() {
  const [state, setState] = useState(null);
  const [form, setForm] = useState({ startBalance: '', numBonuses: '' });
  const [drawAmt, setDrawAmt] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('ok');

  const load = () => fetch('/api/admin/gtb').then(r => r.json()).then(setState).catch(() => {});
  useEffect(() => { load(); }, []);

  const api = async (endpoint, body = {}) => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      setBusy(false);
      if (d.error) { setMsg(d.error); setMsgType('err'); }
      else { setMsg('Done!'); setMsgType('ok'); load(); }
    } catch (e) {
      setBusy(false); setMsg('Request failed: ' + e.message); setMsgType('err');
    }
  };

  const fmt = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const game = state?.game;
  const guesses = state?.guesses ?? [];

  return (
    <div className="agtb">
      {msg && <div className={`agtb-msg ${msgType === 'err' ? 'agtb-msg-err' : ''}`}>{msg}</div>}

      {/* ── New game form ── */}
      {(!game || game.status === 'drawn') && (
        <div className="agtb-card">
          <div className="agtb-card-title">New Game</div>
          <div className="agtb-row">
            <div className="agtb-field">
              <label>Start Balance ($)</label>
              <input type="number" value={form.startBalance} onChange={e => setForm(f => ({...f, startBalance: e.target.value}))} placeholder="5500"/>
            </div>
            <div className="agtb-field">
              <label>Number of Bonuses</label>
              <input type="number" value={form.numBonuses} onChange={e => setForm(f => ({...f, numBonuses: e.target.value}))} placeholder="20"/>
            </div>
          </div>
          <button className="btn btn-cyan" disabled={busy || !form.startBalance} onClick={() => api('/api/gtb/create', form)}>Create Game</button>
        </div>
      )}

      {/* ── Active game controls ── */}
      {game && (
        <div className="agtb-card">
          <div className="agtb-card-head">
            <div>
              <div className="agtb-card-title">{fmt(game.startBalance)} START {game.numBonuses > 0 && <span className="agtb-dim">· {game.numBonuses} bonuses</span>}</div>
              <div className="agtb-dim">Opened {new Date(game.createdAt).toLocaleString()} · {guesses.length} guess{guesses.length !== 1 ? 'es' : ''}</div>
            </div>
            <div className={`gtb-status-badge gtb-s-${game.status}`}>{game.status}</div>
          </div>

          {game.status === 'open' && (
            <div className="agtb-actions">
              <button className="btn btn-warn" disabled={busy} onClick={() => api('/api/gtb/close')}>Close Entries</button>
            </div>
          )}

          {game.status === 'closed' && (
            <div className="agtb-draw-box">
              <div className="agtb-draw-label">Enter the final balance to find the closest guess</div>
              <div className="agtb-draw-row">
                <input type="number" value={drawAmt} onChange={e => setDrawAmt(e.target.value)} placeholder="e.g. 7064" onKeyDown={e => e.key === 'Enter' && drawAmt && api('/api/gtb/draw', { finalBalance: Number(drawAmt) })}/>
                <button className="btn btn-cyan" disabled={busy || !drawAmt} onClick={() => api('/api/gtb/draw', { finalBalance: Number(drawAmt) })}>Draw Winner</button>
              </div>
            </div>
          )}

          {game.status === 'drawn' && (
            <div className="agtb-winner-row">
              <I.trophy style={{width:18,height:18,color:'var(--good)'}}/>
              <span>Winner: <strong>{game.winner}</strong> — guessed {fmt(game.winnerGuess)}, off by {fmt(game.offBy)}</span>
            </div>
          )}

          <div className="agtb-footer-actions">
            <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => { if (confirm('Archive and delete this game?')) api('/api/gtb/reset'); }}>
              Delete / Reset Game
            </button>
          </div>
        </div>
      )}

      {/* ── Guesses table ── */}
      {guesses.length > 0 && (
        <div className="agtb-card">
          <div className="agtb-card-title">Guesses</div>
          <div className="admin-table-wrap" style={{marginTop:12}}>
            <table className="admin-table">
              <thead><tr><th>#</th><th>User</th><th>Guess</th><th>Submitted</th>{game?.status === 'drawn' && <th>Off By</th>}</tr></thead>
              <tbody>
                {[...guesses].sort((a,b) => a.guess - b.guess).map((g, i) => (
                  <tr key={g.userId} className={game?.winner === g.username ? 'admin-row-prize' : ''}>
                    <td className="admin-rank">{i+1}</td>
                    <td className="admin-user">{g.username}</td>
                    <td className="admin-num">{fmt(g.guess)}</td>
                    <td className="admin-dim">{new Date(g.submittedAt).toLocaleString()}</td>
                    {game?.status === 'drawn' && <td className="admin-num">{fmt(Math.abs(g.guess - game.finalBalance))}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── History ── */}
      {state?.history?.length > 0 && (
        <div className="agtb-card">
          <div className="agtb-card-title">Winner History</div>
          <div className="admin-table-wrap" style={{marginTop:12}}>
            <table className="admin-table">
              <thead><tr><th>Date</th><th>Start</th><th>Final</th><th>Winner</th><th>Winning Guess</th><th>Off By</th><th>Guesses</th><th>Status</th></tr></thead>
              <tbody>
                {state.history.map((h, i) => (
                  <tr key={i}>
                    <td className="admin-dim">{new Date(h.drawnAt || h.archivedAt || h.createdAt).toLocaleDateString()}</td>
                    <td className="admin-num">{fmt(h.startBalance)}</td>
                    <td className="admin-num">{h.finalBalance ? fmt(h.finalBalance) : '—'}</td>
                    <td className="admin-user">{h.winner || '—'}</td>
                    <td className="admin-num">{h.winnerGuess ? fmt(h.winnerGuess) : '—'}</td>
                    <td className="admin-num">{h.offBy != null ? fmt(h.offBy) : '—'}</td>
                    <td className="admin-dim">{h.totalGuesses ?? '—'}</td>
                    <td><span className={`gtb-status-badge gtb-s-${h.status}`}>{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================== Giveaway: Avatar ====================== */
function GaAvatar({ username, avatarUrl }) {
  const [errored, setErrored] = useState(false);
  const initial = username?.charAt(0)?.toUpperCase() || '?';
  if (avatarUrl && !errored) {
    return <img src={avatarUrl} alt={username} className="gas-avatar" onError={() => setErrored(true)}/>;
  }
  return <div className="gas-avatar gas-avatar-fallback">{initial}</div>;
}

/* ====================== Giveaway: Spin Strip ====================== */
function SpinStrip({ strip, targetX, spinKey, onComplete, avatars }) {
  const trackRef = useRef(null);
  useEffect(() => {
    if (!trackRef.current || !strip.length) return;
    trackRef.current.style.transition = 'none';
    trackRef.current.style.transform = 'translateX(0)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 4.5s cubic-bezier(0.12, 0.8, 0.15, 1.0)';
        trackRef.current.style.transform = `translateX(${targetX}px)`;
      }
    }));
  }, [spinKey]);
  return (
    <div className="gas-window">
      <div className="gas-fade gas-fade-left"/>
      <div className="gas-fade gas-fade-right"/>
      <div className="gas-highlight"/>
      <div ref={trackRef} className="gas-track" onTransitionEnd={(e) => { if (e.propertyName === 'transform') onComplete?.(); }}>
        {strip.map((name, i) => (
          <div key={i} className="gas-cell">
            <GaAvatar username={name} avatarUrl={avatars[name.toLowerCase()]}/>
            <span className="gas-name">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====================== Giveaway Admin ====================== */
const PUSHER_KEY = '32cbd69e4b950bf97679';
const KICK_CHANNEL = 'azzubu';
const ITEM_W = 140;
const VISIBLE = 5;
const CENTER = 2;

function GiveawayAdmin() {
  const [keyword, setKeyword] = useState('!enter');
  const [isListening, setIsListening] = useState(false);
  const [entries, setEntries] = useState([]);
  const [winner, setWinner] = useState(null);
  const [winnerMessages, setWinnerMessages] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinStrip, setSpinStrip] = useState([]);
  const [spinTargetX, setSpinTargetX] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [avatars, setAvatars] = useState({});

  const isListeningRef = useRef(false);
  const keywordRef = useRef('!enter');
  const winnerRef = useRef(null);
  const wsRef = useRef(null);
  const spinWinnerRef = useRef('');
  const chatroomIdRef = useRef(null);
  const fetchingRef = useRef(new Set());

  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { keywordRef.current = keyword; }, [keyword]);
  useEffect(() => { winnerRef.current = winner; }, [winner]);

  useEffect(() => {
    entries.forEach(async (entry) => {
      const key = entry.username.toLowerCase();
      if (fetchingRef.current.has(key)) return;
      fetchingRef.current.add(key);
      try {
        const res = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(entry.username)}`, { headers: { Accept: 'application/json' } });
        const data = await res.json();
        const url = data?.user?.profile_pic || data?.user?.profile_picture;
        if (url) setAvatars(prev => ({ ...prev, [key]: url }));
      } catch {}
    });
  }, [entries]);

  const connectChat = async () => {
    if (wsRef.current) return true;
    setWsStatus('connecting');
    if (!chatroomIdRef.current) {
      try {
        const res = await fetch(`/api/kick/chatroom?channel=${encodeURIComponent(KICK_CHANNEL)}`);
        const data = await res.json();
        if (!data.chatroomId) { setWsStatus('error'); return false; }
        chatroomIdRef.current = data.chatroomId;
      } catch { setWsStatus('error'); return false; }
    }
    const roomId = chatroomIdRef.current;
    const ws = new WebSocket(`wss://ws-us2.pusher.com/app/${PUSHER_KEY}?protocol=7&client=js&version=7.4.0&flash=false`);
    wsRef.current = ws;
    ws.onopen = () => {
      setWsStatus('connected');
      ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `chatrooms.${roomId}.v2` } }));
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event !== 'App\\Events\\ChatMessageEvent') return;
        const data = JSON.parse(msg.data);
        const username = data?.sender?.username || data?.sender?.slug || '';
        const text = data?.content || '';
        if (!username || !text) return;
        if (winnerRef.current && username.toLowerCase() === winnerRef.current.toLowerCase()) {
          setWinnerMessages(p => [{ username, message: text, timestamp: Date.now() }, ...p].slice(0, 50));
        }
        if (isListeningRef.current && text.trim().toLowerCase() === keywordRef.current.trim().toLowerCase()) {
          setEntries(prev => {
            if (prev.some(en => en.username.toLowerCase() === username.toLowerCase())) return prev;
            return [...prev, { username, enteredAt: Date.now() }];
          });
        }
      } catch {}
    };
    ws.onerror = () => setWsStatus('error');
    ws.onclose = () => { setWsStatus('disconnected'); wsRef.current = null; };
    return true;
  };

  const disconnectChat = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setWsStatus('disconnected');
    setIsListening(false);
  };

  const startListening = async () => {
    if (wsStatus !== 'connected') {
      const ok = await connectChat();
      if (!ok) return;
    }
    setIsListening(true);
  };

  const stopListening = () => setIsListening(false);

  const spin = () => {
    if (entries.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setWinner(null);
    setWinnerMessages([]);
    const names = entries.map(e => e.username);
    const rand = () => names[Math.floor(Math.random() * names.length)];
    const picked = rand();
    spinWinnerRef.current = picked;
    const prepad = Array.from({ length: CENTER }, rand);
    const middle = Array.from({ length: 70 }, rand);
    const postpad = Array.from({ length: CENTER }, rand);
    const strip = [...prepad, ...middle, picked, ...postpad];
    const winnerIdx = CENTER + middle.length;
    const targetX = -(winnerIdx - CENTER) * ITEM_W;
    setSpinStrip(strip);
    setSpinTargetX(targetX);
    setSpinKey(k => k + 1);
  };

  const handleAnimationComplete = () => {
    if (!isSpinning) return;
    const picked = spinWinnerRef.current;
    setWinner(picked);
    setIsSpinning(false);
    setEntries(prev => prev.filter(e => e.username.toLowerCase() !== picked.toLowerCase()));
  };

  const removeEntry = (username) => {
    setEntries(prev => prev.filter(e => e.username.toLowerCase() !== username.toLowerCase()));
  };

  useEffect(() => () => { wsRef.current?.close(); }, []);

  const STATUS_LABEL = { disconnected: 'Disconnected', connecting: 'Connecting…', connected: 'Live', error: 'Connection Error' };
  const containerW = VISIBLE * ITEM_W;

  return (
    <div className="ga">
      <div className="ga-head">
        <div>
          <div className="ga-title"><I.gift style={{width:20,height:20,color:'var(--good)'}}/> Giveaway Spinner</div>
          <div className="ga-sub">Collect entries from Kick chat and spin a winner</div>
        </div>
        <div className={`ga-status ga-status-${wsStatus}`}>
          {wsStatus === 'connected' ? <I.wifi style={{width:13,height:13}}/> : <I.wifiOff style={{width:13,height:13}}/>}
          {STATUS_LABEL[wsStatus]}
        </div>
      </div>

      <div className="ga-grid">
        {/* ── Left controls ── */}
        <div className="ga-col-left">
          <div className="ga-card">
            <h2 className="ga-card-h">Setup</h2>

            <div className="ga-field">
              <label>Entry Keyword</label>
              <input
                className="ga-input"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                disabled={isListening}
                placeholder="!enter"
              />
              <p className="ga-field-hint">Viewers type this in Kick chat to enter</p>
            </div>

            <div className="ga-btn-stack">
              {!isListening ? (
                <button className="ga-btn ga-btn-primary" onClick={startListening} disabled={wsStatus === 'connecting'}>
                  <I.play style={{width:13,height:13}}/>
                  {wsStatus === 'connecting' ? 'Connecting…' : 'Start Collecting'}
                </button>
              ) : (
                <button className="ga-btn ga-btn-stop" onClick={stopListening}>
                  <I.stop style={{width:14,height:14}}/> Stop Collecting
                </button>
              )}
              {wsStatus === 'connected' && !isListening && (
                <button className="ga-btn ga-btn-ghost" onClick={disconnectChat}>
                  <I.wifiOff style={{width:13,height:13}}/> Disconnect
                </button>
              )}
              {wsStatus === 'error' && (
                <button className="ga-btn ga-btn-ghost" onClick={connectChat} style={{color:'#ff6b6b'}}>
                  <I.wifi style={{width:13,height:13}}/> Retry Connection
                </button>
              )}
            </div>

            <div className="ga-divider"/>

            <div className="ga-btn-stack">
              <button className="ga-btn ga-btn-spin" onClick={spin} disabled={entries.length === 0 || isSpinning}>
                <I.shuffle style={{width:15,height:15}}/> SPIN ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
              </button>
              <button className="ga-btn ga-btn-clear" onClick={() => { setEntries([]); setWinner(null); setWinnerMessages([]); setSpinStrip([]); fetchingRef.current.clear(); setAvatars({}); }}>
                <I.trash style={{width:12,height:12}}/> Clear All
              </button>
            </div>
          </div>

          <div className="ga-card">
            <div className="ga-card-head-row">
              <h2 className="ga-card-h"><I.users style={{width:13,height:13}}/> Entries</h2>
              <span className="ga-count">{entries.length}</span>
            </div>
            <div className="ga-entry-list">
              {entries.length === 0
                ? <p className="ga-list-empty">No entries yet</p>
                : entries.map((e, i) => (
                    <div key={e.username} className="ga-entry-row">
                      <GaAvatar username={e.username} avatarUrl={avatars[e.username.toLowerCase()]}/>
                      <span className="ga-entry-name">{e.username}</span>
                      <span className="ga-entry-rank">#{i+1}</span>
                      <button className="ga-entry-remove" onClick={() => removeEntry(e.username)} title={`Remove ${e.username}`}>
                        <I.x style={{width:11,height:11}}/>
                      </button>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* ── Right spinner + winner ── */}
        <div className="ga-col-right">
          <div className="ga-spin-card" style={{minHeight: 220}}>
            {spinStrip.length > 0 ? (
              <div className="ga-spin-wrap">
                <SpinStrip
                  strip={spinStrip}
                  targetX={spinTargetX}
                  spinKey={spinKey}
                  onComplete={handleAnimationComplete}
                  avatars={avatars}
                />
                {isSpinning && <p className="ga-spinning-text">Spinning…</p>}
              </div>
            ) : (
              <p className="ga-spin-idle">Add entries and press SPIN</p>
            )}
          </div>

          {winner && !isSpinning && (
            <div className="ga-winner-card">
              <GaAvatar username={winner} avatarUrl={avatars[winner.toLowerCase()]}/>
              <div className="ga-winner-info">
                <p className="ga-winner-label">Winner</p>
                <p className="ga-winner-name-big">{winner}</p>
              </div>
              <I.checkCircle style={{width:28,height:28,color:'var(--good)',marginLeft:'auto',flexShrink:0}}/>
            </div>
          )}

          {winner && (
            <div className="ga-card">
              <h2 className="ga-card-h"><I.msg style={{width:13,height:13,color:'var(--good)'}}/> {winner}'s Messages</h2>
              <div className="ga-msg-list">
                {winnerMessages.length === 0
                  ? <p className="ga-list-empty">Waiting for {winner} to send a message…</p>
                  : winnerMessages.map((m, i) => (
                      <div key={i} className="ga-msg-row">
                        <span className="ga-msg-user">{m.username}:</span>
                        <span className="ga-msg-text">{m.message}</span>
                      </div>
                    ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====================== Admin Claims ====================== */
function AdminClaims() {
  const [claims, setClaims] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => fetch('/api/admin/claims').then(r => r.json()).then(setClaims).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  const setStatus = async (userId, claimedAt, status) => {
    const key = `${userId}-${claimedAt}`;
    setBusy(key);
    await fetch('/api/admin/claims/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, claimedAt, status }),
    });
    setBusy(null);
    load();
  };

  if (!claims) return <div className="lb-loading"><div className="spinner"/></div>;

  const pendingCount = claims.filter(c => c.status === 'pending').length;

  return (
    <div className="ap-card">
      <div className="ap-card-title">
        Affiliate Claims <span className="ap-card-sub">— {pendingCount} pending, {claims.length} total</span>
      </div>
      {claims.length === 0 ? (
        <div className="ga-list-empty" style={{padding: 24}}>No affiliate claims yet</div>
      ) : (
        <div className="admin-table-wrap" style={{marginTop:14}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Discord</th>
                <th>Roobet Username</th>
                <th>Claimed At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(c => {
                const key = `${c.userId}-${c.claimedAt}`;
                return (
                  <tr key={key} className={c.status === 'pending' ? 'admin-row-prize' : ''}>
                    <td className="admin-user">
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {c.avatarUrl && <img src={c.avatarUrl} alt="" style={{width:24,height:24,borderRadius:'50%'}}/>}
                        {c.discordUsername}
                      </div>
                    </td>
                    <td className="admin-user">{c.roobetUsername || '—'}</td>
                    <td className="admin-dim">{new Date(c.claimedAt).toLocaleString()}</td>
                    <td>
                      <span className={`claim-status claim-${c.status}`}>{c.status}</span>
                    </td>
                    <td>
                      {c.status === 'pending' ? (
                        <button
                          className="btn btn-cyan btn-sm"
                          onClick={() => setStatus(c.userId, c.claimedAt, 'claimed')}
                          disabled={busy === key}
                          style={{padding:'6px 12px', fontSize:13}}
                        >
                          {busy === key ? '…' : 'Mark Claimed'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setStatus(c.userId, c.claimedAt, 'pending')}
                          disabled={busy === key}
                          style={{padding:'6px 12px', fontSize:12, color:'var(--text-dim)'}}
                        >
                          Undo
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ====================== Admin Panel ====================== */
function AdminPanel() {
  const [tab, setTab] = useState('lb');
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (tab !== 'lb' || rows) return;
    fetch('/api/admin/leaderboard')
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setRows(d.sort((a,b) => b.wagered - a.wagered)) : setErr(d.error))
      .catch(e => setErr(e.message));
  }, [tab]);

  const PRIZE_TABLE = [350, 200, 120, 80, 60, 50, 40, 35, 30, 25];
  const fmt = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="ap-section">
      <div className="ap-header">
        <h1 className="ap-title">Admin Panel</h1>
        <div className="ap-tabs">
          <button className={`ap-tab ${tab === 'lb' ? 'active' : ''}`} onClick={() => setTab('lb')}>
            <I.trophy style={{width:14,height:14}}/> Leaderboard
          </button>
          <button className={`ap-tab ${tab === 'gtb' ? 'active' : ''}`} onClick={() => setTab('gtb')}>
            <I.target style={{width:14,height:14}}/> Guess The Balance
          </button>
          <button className={`ap-tab ${tab === 'giveaway' ? 'active' : ''}`} onClick={() => setTab('giveaway')}>
            <I.gift style={{width:14,height:14}}/> Giveaway
          </button>
          <button className={`ap-tab ${tab === 'claims' ? 'active' : ''}`} onClick={() => setTab('claims')}>
            <I.card style={{width:14,height:14}}/> Claims
          </button>
        </div>
      </div>

      {tab === 'lb' && (
        <div className="ap-card">
          <div className="ap-card-title">Live Leaderboard <span className="ap-card-sub">— unmasked</span></div>
          {err && <div className="admin-error">{err}</div>}
          {!rows && !err && <div className="lb-loading"><div className="spinner"/></div>}
          {rows && (
            <div className="admin-table-wrap" style={{marginTop:16}}>
              <table className="admin-table">
                <thead><tr><th>#</th><th>Username</th><th>Wagered</th><th>Weighted</th><th>Fav Game</th><th>Prize</th></tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.uid} className={i < 10 ? 'admin-row-prize' : ''}>
                      <td className="admin-rank">{i+1}</td>
                      <td className="admin-user">{r.username}</td>
                      <td className="admin-num">{fmt(r.wagered)}</td>
                      <td className="admin-num admin-dim">{fmt(r.weightedWagered)}</td>
                      <td className="admin-dim">{r.favoriteGameTitle || '—'}</td>
                      <td className="admin-prize">{PRIZE_TABLE[i] ? '$'+PRIZE_TABLE[i] : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="admin-footer">{rows.length} users tracked this period</div>
            </div>
          )}
        </div>
      )}

      {tab === 'gtb' && <AdminGTB/>}
      {tab === 'giveaway' && <GiveawayAdmin/>}
      {tab === 'claims' && <AdminClaims/>}
    </section>
  );
}

/* ====================== App ====================== */
function App() {
  const [toast, setToast] = useState(null);
  const [active, setActive] = useState('home');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(u => setUser(u)).catch(() => {});
  }, []);

  const copyCode = (code) => {
    try { navigator.clipboard?.writeText(code); } catch (e) {}
    setToast(`Copied "${code}" to clipboard`);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 1800);
  };

  const renderMain = () => {
    if (active === 'admin' && user?.isAdmin) return <AdminPanel/>;
    if (active === 'guess') return <GuessTheBalance user={user}/>;
    if (active === 'daily') return <DailyRewards user={user}/>;
    if (active === 'profile') return <UserPanel user={user}/>;
    if (active === 'lb') {
      return (
        <div className="page-placeholder">
          <div className="placeholder-card">
            <div className="placeholder-emoji"><I.trophy style={{width:40,height:40}}/></div>
            <h2>Coming Soon</h2>
            <p>The leaderboard is being polished. Check back soon!</p>
          </div>
        </div>
      );
    }
    if (active === 'home') {
      return (<>
        <Hero/>
        <Partners onCopy={copyCode}/>
        <FAQ/>
      </>);
    }
    return (
      <div className="page-placeholder">
        <div className="placeholder-card">
          <div className="placeholder-emoji">✦</div>
          <h2>Coming Soon</h2>
          <p>This section is still being polished.</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="shell">
        <Sidebar active={active} onChange={setActive} user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
        <main className="main">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <I.menu style={{width:22,height:22}}/>
          </button>
          <Topbar user={user}/>
          {renderMain()}
        </main>
      </div>
      <div className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}/>
      <div className={`toast ${toast ? 'show' : ''}`}>
        <I.check/> {toast}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
