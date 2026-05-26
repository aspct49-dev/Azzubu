/* ====================== Leaderboard ====================== *\
| When wiring real data, replace fetchRoobetLeaderboard() below.   |
| Roobet exposes affiliate stats via:                              |
|   GET https://roobetconnect.com/affiliate/v2/stats               |
|        ?userId=<your-uid>&startDate=ISO&endDate=ISO              |
|        &timestamp=<unix-ms>                                      |
|   Authorization: Bearer <ROOBET_API_KEY>                         |
| MUST be called from a backend proxy — never embed the key in JS. |
\* ================================================================ */

const { useState: useStateLB, useEffect: useEffectLB, useMemo: useMemoLB } = React;

const PRIZE_TABLE = [350, 200, 120, 80, 60, 50, 40, 35, 30, 25];

function maskName(name) {
  if (!name || name.length <= 4) return '****' + (name ?? '');
  return '*'.repeat(name.length - 4) + name.slice(-4);
}

async function fetchRoobetLeaderboard() {
  try {
    const r = await fetch('/api/roobet-leaderboard');
    const raw = await r.json();
    if (!Array.isArray(raw)) throw new Error('unexpected shape');

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    return {
      periodStart,
      periodEnd,
      totalPrize: 1000,
      entries: raw
        .sort((a, b) => b.wagered - a.wagered)
        .slice(0, 10)
        .map((row, i) => ({
          rank: i + 1,
          user: maskName(row.username),
          wagered: row.wagered,
          prize: PRIZE_TABLE[i] ?? 0,
        })),
    };
  } catch (e) {
    console.warn('Roobet API unavailable, using mock data:', e.message);
    return MOCK_LB;
  }
}

const MOCK_LB = {
  periodStart: '2026-05-22T00:00:00Z',
  periodEnd:   '2026-06-22T00:00:00Z',
  totalPrize:  1000,
  entries: [
    { rank: 1,  user: '*****Sloth',         wagered: 906812.95, prize: 350 },
    { rank: 2,  user: '****Degens',         wagered: 257054.44, prize: 200 },
    { rank: 3,  user: '*****lifess',        wagered: 238640.51, prize: 120 },
    { rank: 4,  user: '***PLE',             wagered: 203648.75, prize: 80  },
    { rank: 5,  user: '*********ckEnjoyer', wagered: 202410.11, prize: 60  },
    { rank: 6,  user: '***u59',             wagered: 89940.58,  prize: 50  },
    { rank: 7,  user: '***naZ',             wagered: 88203.10,  prize: 40  },
    { rank: 8,  user: '***toe',             wagered: 65332.65,  prize: 35  },
    { rank: 9,  user: '***ubu',             wagered: 55021.25,  prize: 30  },
    { rank: 10, user: '*******d0uGnOw',     wagered: 35081.85,  prize: 25  },
  ],
};

const fmtMoney = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtMoneyShort = (n) => '$' + Number(n).toLocaleString('en-US');

function useCountdown(target) {
  const [now, setNow] = useStateLB(Date.now());
  useEffectLB(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hours, mins, secs };
}

function CountdownPill({ end }) {
  const { days, hours, mins, secs } = useCountdown(end);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div className="countdown">
      <div className="cd-cell"><span className="cd-num">{pad(days)}</span><span className="cd-lbl">d</span></div>
      <div className="cd-cell"><span className="cd-num">{pad(hours)}</span><span className="cd-lbl">h</span></div>
      <div className="cd-cell"><span className="cd-num">{pad(mins)}</span><span className="cd-lbl">m</span></div>
      <div className="cd-cell"><span className="cd-num">{pad(secs)}</span><span className="cd-lbl">s</span></div>
      <svg className="cd-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
    </div>
  );
}

function PodiumCard({ entry, place }) {
  const styles = {
    1: { color: '#FFD66B', label: '1', tone: 'gold' },
    2: { color: '#A8C8EE', label: '2', tone: 'silver' },
    3: { color: '#E59A6A', label: '3', tone: 'bronze' },
  };
  const s = styles[place];
  if (!entry) return (
    <div className={`podium-card podium-${s.tone} podium-empty`} style={{'--accent': s.color}}>
      <div className="podium-medal" style={{background: s.color}}>{s.label}</div>
      <div className="podium-avatar"><img src="assets/azzubu-chip.png" alt="" /></div>
      <div className="podium-name" style={{opacity:0.4}}>—</div>
    </div>
  );
  return (
    <div className={`podium-card podium-${s.tone}`} style={{'--accent': s.color}}>
      <div className="podium-medal" style={{background: s.color}}>{s.label}</div>
      <div className="podium-avatar">
        <img src="assets/azzubu-chip.png" alt="" />
      </div>
      <div className="podium-name">{entry.user}</div>
      <div className="podium-row-label">Total Wagered</div>
      <div className="podium-wager">{fmtMoney(entry.wagered)}</div>
      <div className="podium-row-label">Prize</div>
      <div className="podium-prize" style={{color: s.color}}>{fmtMoney(entry.prize)}</div>
    </div>
  );
}

function LeaderRow({ entry }) {
  return (
    <div className="leader-row">
      <div className="lr-rank">{entry.rank}</div>
      <div className="lr-chip">
        <img src="assets/azzubu-chip.png" alt="" />
      </div>
      <div className="lr-name">{entry.user}</div>
      <div className="lr-stats">
        <div className="lr-stat">
          <div className="lr-stat-lbl">Wagered</div>
          <div className="lr-stat-val">{fmtMoney(entry.wagered)}</div>
        </div>
        <div className="lr-stat">
          <div className="lr-stat-lbl">Prize</div>
          <div className="lr-stat-val lr-stat-prize">{fmtMoney(entry.prize)}</div>
        </div>
      </div>
    </div>
  );
}

function Leaderboard() {
  const [data, setData] = useStateLB(null);
  const [loading, setLoading] = useStateLB(true);
  const [tab, setTab] = useStateLB('roobet');

  useEffectLB(() => {
    let alive = true;
    fetchRoobetLeaderboard().then(d => {
      if (!alive) return;
      setData(d); setLoading(false);
    }).catch(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  if (loading || !data) {
    return (
      <section className="lb-section">
        <div className="lb-loading"><div className="spinner"/></div>
      </section>
    );
  }

  const sorted = [...data.entries].sort((a, b) => a.rank - b.rank);
  const podium = { 1: sorted.find(e => e.rank === 1), 2: sorted.find(e => e.rank === 2), 3: sorted.find(e => e.rank === 3) };
  const others = sorted.filter(e => e.rank > 3);

  const dateRangeLabel = (() => {
    const f = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${f(data.periodStart)} – ${f(data.periodEnd)}`;
  })();

  return (
    <section className="lb-section">
      <div className="lb-brandbar">
        <img src="assets/roobet-logo.png" alt="Roobet" className="lb-brandbar-roobet" />
        <span className="lb-brandbar-x">×</span>
        <img src="assets/azzubu-logo.png" alt="Azzubu" className="lb-brandbar-azz" />
      </div>

      <div className="lb-title-wrap">
        <div className="lb-prize">{fmtMoneyShort(data.totalPrize)}</div>
        <h1 className="lb-title">LEADERBOARD</h1>
      </div>

      <div className="lb-date">{dateRangeLabel}</div>
      <CountdownPill end={data.periodEnd}/>

      <div className="lb-personal">No personal entry found</div>
      <button className="lb-prev-btn">Show Previous Leaderboard</button>

      <div className="podium">
        <PodiumCard entry={podium[2]} place={2}/>
        <PodiumCard entry={podium[1]} place={1}/>
        <PodiumCard entry={podium[3]} place={3}/>
      </div>

      <div className="lb-others-head">OTHER LEADERS</div>
      <div className="leaders-list">
        {others.map(e => <LeaderRow key={e.rank} entry={e}/>)}
      </div>
    </section>
  );
}

window.Leaderboard = Leaderboard;
