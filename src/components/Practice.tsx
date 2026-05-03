"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "./icons";
import Link from "next/link";

const TYPES = [
  { value: "meditation", label: "Meditation" },
  { value: "journaling", label: "Journaling" },
  { value: "breathwork", label: "Breathwork" },
  { value: "reflection", label: "Reflection" },
  { value: "movement", label: "Movement" },
  { value: "partner", label: "Partner exercise" },
];

const TYPE_LABELS: Record<string, string> = Object.fromEntries(TYPES.map((t) => [t.value, t.label]));

interface Session {
  id: number;
  type: string;
  duration_minutes: number;
  note: string | null;
  practiced_at: string;
  created_at: string;
}

interface Favourite {
  id: number;
  product_id: number;
  products: { id: number; name: string; brand: string; category: string };
}

interface Stats {
  totalSessions: number;
  totalMinutes: number;
  sessionsThisWeek: number;
  minutesThisWeek: number;
  sessionsThisMonth: number;
  minutesThisMonth: number;
  streak: number;
  longestStreak: number;
  typeCounts: Record<string, number>;
}

export function PracticeShell() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [showLog, setShowLog] = useState(false);
  const [logType, setLogType] = useState("meditation");
  const [logDuration, setLogDuration] = useState("10");
  const [logNote, setLogNote] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [logSaving, setLogSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/practice");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
      if (data.favourites) setFavourites(data.favourites);
      if (data.stats) setStats(data.stats);
    } catch {
      // tables may not exist yet
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const logSession = async () => {
    if (!logDuration) return;
    setLogSaving(true);
    try {
      await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log",
          type: logType,
          duration_minutes: parseInt(logDuration) || 10,
          note: logNote || null,
          practiced_at: logDate,
        }),
      });
      setShowLog(false);
      setLogNote("");
      setLogDuration("10");
      setLogDate(new Date().toISOString().split("T")[0]);
      fetchData();
    } catch {
      alert("Failed to log session");
    } finally {
      setLogSaving(false);
    }
  };

  const deleteSession = async (id: number) => {
    await fetch("/api/practice", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const removeFavourite = async (productId: number) => {
    await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "favourite", product_id: productId }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <>
        <section className="prac-main">
          <div className="prac-inner"><p style={{ textAlign: "center", color: "var(--ink-3)", padding: "48px 0" }}>Loading...</p></div>
        </section>
      </>
    );
  }

  const topType = stats?.typeCounts
    ? Object.entries(stats.typeCounts).sort((a, b) => b[1] - a[1])[0]
    : null;

  const weekDots: { date: string; active: boolean }[] = [];
  const practicedDates = new Set(sessions.map((s) => s.practiced_at));
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const str = d.toISOString().split("T")[0];
    weekDots.push({ date: str, active: practicedDates.has(str) });
  }

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <section className="prac-main">
        <div className="prac-inner">
          <Link href="/dashboard" className="prac-back">
            <span className="prac-back-arrow"><Icon name="arrow-right" size={14} /></span> Back to dashboard
          </Link>

          <h1 className="prac-h1">Your practice</h1>
          <p className="prac-sub">Build your practice, one session at a time.</p>

          <div className="prac-streak-card">
            <div className="prac-streak-top">
              <div className="prac-streak-flame">
                <Icon name="flame" size={28} />
                <span className="prac-streak-num">{stats?.streak || 0}</span>
              </div>
              <div className="prac-streak-label">day streak</div>
              {stats && stats.longestStreak > 0 && (
                <div className="prac-streak-best">Best: {stats.longestStreak} days</div>
              )}
            </div>
            <div className="prac-week">
              {weekDots.map((d) => (
                <div key={d.date} className="prac-week-day">
                  <div className={"prac-week-dot" + (d.active ? " prac-week-dot-active" : "")} />
                  <span className="prac-week-label">{DAY_NAMES[new Date(d.date).getDay()]}</span>
                </div>
              ))}
            </div>
          </div>

          {!showLog && (
            <button className="prac-log-btn" onClick={() => setShowLog(true)}>
              <Icon name="spark" size={16} /> Log a session
            </button>
          )}

          {showLog && (
            <div className="prac-log-form">
              <h3 className="prac-log-title">Log a session</h3>
              <div className="prac-log-grid">
                <label className="prac-log-label">
                  <span>Type</span>
                  <select value={logType} onChange={(e) => setLogType(e.target.value)}>
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </label>
                <label className="prac-log-label">
                  <span>Duration</span>
                  <div className="prac-duration-row">
                    {["5", "10", "15", "20", "30"].map((v) => (
                      <button
                        key={v}
                        className={"prac-dur-chip" + (logDuration === v ? " prac-dur-active" : "")}
                        onClick={() => setLogDuration(v)}
                        type="button"
                      >
                        {v}m
                      </button>
                    ))}
                    <input
                      type="number"
                      className="prac-dur-custom"
                      value={logDuration}
                      onChange={(e) => setLogDuration(e.target.value)}
                      min="1"
                      max="300"
                    />
                  </div>
                </label>
                <label className="prac-log-label">
                  <span>Date</span>
                  <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
                </label>
                <label className="prac-log-label prac-log-full">
                  <span>Note (optional)</span>
                  <input
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="What did you work on?"
                  />
                </label>
              </div>
              <div className="prac-log-actions">
                <button className="prac-btn prac-btn-primary" onClick={logSession} disabled={logSaving}>
                  {logSaving ? "Saving..." : "Log session"}
                </button>
                <button className="prac-btn" onClick={() => setShowLog(false)}>Cancel</button>
              </div>
            </div>
          )}

          {stats && stats.totalSessions > 0 && (
            <div className="prac-stats">
              <div className="prac-stat">
                <div className="prac-stat-value">{stats.totalSessions}</div>
                <div className="prac-stat-label">Total sessions</div>
              </div>
              <div className="prac-stat">
                <div className="prac-stat-value">{formatMinutes(stats.totalMinutes)}</div>
                <div className="prac-stat-label">Total time</div>
              </div>
              <div className="prac-stat">
                <div className="prac-stat-value">{stats.sessionsThisWeek}</div>
                <div className="prac-stat-label">This week</div>
              </div>
              <div className="prac-stat">
                <div className="prac-stat-value">{stats.sessionsThisMonth}</div>
                <div className="prac-stat-label">This month</div>
              </div>
              {topType && (
                <div className="prac-stat">
                  <div className="prac-stat-value">{TYPE_LABELS[topType[0]] || topType[0]}</div>
                  <div className="prac-stat-label">Most practiced</div>
                </div>
              )}
            </div>
          )}

          {favourites.length > 0 && (
            <div className="prac-section">
              <h2 className="prac-h2">Favourites</h2>
              <div className="prac-fav-list">
                {favourites.map((f) => (
                  <div key={f.id} className="prac-fav-row">
                    <div className="prac-fav-info">
                      <div className="prac-fav-name">{f.products.name}</div>
                      <div className="prac-fav-brand">{f.products.brand}</div>
                    </div>
                    <Link href={f.products.category === "course" ? `/courses/${f.products.id}` : "/shop"} className="prac-fav-go">
                      <Icon name="arrow-right" size={14} />
                    </Link>
                    <button className="prac-fav-remove" onClick={() => removeFavourite(f.product_id)}>
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="prac-section">
            <h2 className="prac-h2">Recent sessions</h2>
            {sessions.length === 0 ? (
              <p className="prac-empty">No sessions logged yet. Start building your practice!</p>
            ) : (
              <div className="prac-history">
                {sessions.map((s) => (
                  <div key={s.id} className="prac-session-row">
                    <div className="prac-session-type">
                      <span className={"prac-type-dot prac-type-" + s.type} />
                      {TYPE_LABELS[s.type] || s.type}
                    </div>
                    <div className="prac-session-dur">{s.duration_minutes} min</div>
                    <div className="prac-session-date">
                      {new Date(s.practiced_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </div>
                    {s.note && <div className="prac-session-note">{s.note}</div>}
                    <button className="prac-session-del" onClick={() => deleteSession(s.id)}>
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h ${r}m` : `${h}h`;
}
