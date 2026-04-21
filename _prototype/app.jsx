/* global React, ReactDOM, Nav, FloatingContact, MiniFoot, HomePage, IndividualPage, CorporatePage, AppPage, PricingPage, AffiliatePage, PartnersPage, ContactPage */
const { useState, useEffect } = React;

function App() {
  const [page, setPage] = useState(() => {
    try { return localStorage.getItem("wwy_page") || "home"; } catch { return "home"; }
  });
  const [tweaks, setTweaks] = useState(() => ({ ...window.__TWEAKS__ }));
  const [editMode, setEditMode] = useState(false);

  useEffect(() => { try { localStorage.setItem("wwy_page", page); } catch {} }, [page]);
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  // Legacy 'partners' route redirects to Contact with teacher reason preselected.
  useEffect(() => {
    if (page === "partners") {
      window.__WW_INITIAL_REASON__ = "teacher";
      setPage("contact");
      // scroll to teach section once contact mounts
      setTimeout(() => document.getElementById("teach")?.scrollIntoView({behavior: "smooth", block: "start"}), 120);
    }
  }, [page]);

  // External navigation events (from hero links, footer, etc)
  useEffect(() => {
    const onGoto = (e) => { if (e.detail) setPage(e.detail); };
    window.addEventListener('wwy-goto', onGoto);
    return () => window.removeEventListener('wwy-goto', onGoto);
  }, []);

  // Accent balance → set CSS variable influencing accent usage
  useEffect(() => {
    const b = Number(tweaks.accentBalance) || 50; // 0 = all yellow, 100 = all teal
    document.documentElement.style.setProperty('--accent-balance', b);
    // Recolor some accent zones by swapping brand roles
    const t = b / 100;
    // blend for "primary" button bg
    // Keep teal as primary but shift some accent areas based on balance
    // Use a single blended accent for hero eyebrow dots and struggle ::before
    // Simplest: when b<50, tilt more things yellow; when b>50, tilt more teal.
    document.body.dataset.accent = b < 40 ? "sun" : b > 70 ? "teal" : "balanced";
  }, [tweaks.accentBalance]);

  // Tweaks host protocol
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setEditMode(true);
      if (d.type === "__deactivate_edit_mode") setEditMode(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const updateTweak = (key, val) => {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [key]: val } }, "*");
  };

  return (
    <div data-screen-label={`Work Well · ${page}`}>
      <Nav page={page} setPage={setPage} />
      {page === "home" && <HomePage tweaks={tweaks} setPage={setPage} />}
      {page === "individual" && <IndividualPage setPage={setPage} />}
      {page === "corporate" && <CorporatePage setPage={setPage} />}
      {page === "pricing" && <PricingPage setPage={setPage} />}
      {page === "affiliate" && <AffiliatePage setPage={setPage} />}
      {page === "partners" && <PartnersPage setPage={setPage} />}
      {page === "contact" && <ContactPage setPage={setPage} />}
      {page === "app" && <AppPage />}
      <MiniFoot />
      <FloatingContact />
      {editMode && <TweaksPanel tweaks={tweaks} update={updateTweak} />}
    </div>
  );
}

function TweaksPanel({ tweaks, update }) {
  const variants = [
    { id: "sun", label: "Sun" },
    { id: "split", label: "Split" },
    { id: "editorial", label: "Editorial" },
  ];
  const ctas = ["Download the app", "Start 7 days free", "Take the stress check", "Book a class"];
  const headlines = [
    "Find your pause.",
    "Come back to your body.",
    "Breathe, then begin.",
    "Less noise. More you.",
    "Your Tuesday, exhaled.",
  ];
  return (
    <div className="tweaks-panel">
      <div className="tp-head">
        <h4>Tweaks</h4>
        <span style={{fontSize: 11, color: 'var(--ink-3)'}}>live</span>
      </div>
      <div className="tp-body">
        <div className="tweak">
          <label>Hero variant</label>
          <div className="chip-row">
            {variants.map(v => (
              <button key={v.id}
                className={tweaks.heroVariant === v.id ? "active" : ""}
                onClick={() => update("heroVariant", v.id)}>{v.label}</button>
            ))}
          </div>
        </div>
        <div className="tweak">
          <label>Headline</label>
          <input type="text" value={tweaks.heroHeadline} onChange={e => update("heroHeadline", e.target.value)} />
          <div className="chip-row">
            {headlines.map(h => (
              <button key={h} className={tweaks.heroHeadline === h ? "active" : ""} onClick={() => update("heroHeadline", h)}>{h}</button>
            ))}
          </div>
        </div>
        <div className="tweak">
          <label>Sub‑headline</label>
          <textarea value={tweaks.heroSub} onChange={e => update("heroSub", e.target.value)} />
        </div>
        <div className="tweak">
          <label>Primary CTA</label>
          <div className="chip-row">
            {ctas.map(c => (
              <button key={c} className={tweaks.ctaLabel === c ? "active" : ""} onClick={() => update("ctaLabel", c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="tweak">
          <label>Accent balance — yellow ⇄ teal</label>
          <div className="slider-row">
            <input type="range" min="0" max="100" value={tweaks.accentBalance}
              onChange={e => update("accentBalance", Number(e.target.value))} />
            <span className="val">{tweaks.accentBalance}</span>
          </div>
          <div style={{fontSize: 11, color: 'var(--ink-3)'}}>
            {tweaks.accentBalance < 40 ? "Sun‑forward" : tweaks.accentBalance > 70 ? "Teal‑forward" : "Balanced"}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
