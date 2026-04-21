/* global React, Icon */
const { useState, useEffect, useRef } = React;

// 4 in, 4 hold, 6 out — box breath variant, ~14s cycle
const BREATH = [
  { phase: "In",    dur: 4 },
  { phase: "Hold",  dur: 4 },
  { phase: "Out",   dur: 6 },
];

function useBreath(playing) {
  const [phase, setPhase] = useState("In");
  const [t, setT] = useState(0); // 0..1 within current phase
  useEffect(() => {
    if (!playing) return;
    let raf, start = performance.now(), idx = 0;
    const tick = (now) => {
      const elapsed = (now - start) / 1000;
      const step = BREATH[idx];
      if (elapsed >= step.dur) {
        start = now;
        idx = (idx + 1) % BREATH.length;
        setPhase(BREATH[idx].phase);
        setT(0);
      } else {
        setT(elapsed / step.dur);
      }
      raf = requestAnimationFrame(tick);
    };
    setPhase(BREATH[0].phase);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  return { phase, t };
}

function useBreathTone(playing, phase) {
  const ctxRef = useRef(null);
  const timersRef = useRef([]);
  const stopTimerRef = useRef(null);
  const onStopRef = useRef(null);

  // singing-bowl strike — struck mallet, long shimmering decay with beating partials
  const strike = (ctx, when, gain) => {
    // Bowl partials — inharmonic, slightly detuned to create the characteristic
    // "wobble" / beating pattern a real bronze bowl produces.
    // Fundamental ~220 Hz, with partials at 2.76×, 5.40×, 8.93× (typical for bowls).
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(gain);

    const partials = [
      { ratio: 1.000, level: 0.55, detune: -3, decay: 18 }, // fundamental, very long tail
      { ratio: 1.003, level: 0.45, detune:  4, decay: 17 }, // beating pair with fundamental
      { ratio: 2.760, level: 0.32, detune: -2, decay: 12 },
      { ratio: 2.765, level: 0.28, detune:  5, decay: 11 }, // beating pair
      { ratio: 5.400, level: 0.18, detune:  0, decay:  7 },
      { ratio: 8.930, level: 0.10, detune:  0, decay:  4 },
    ];
    const base = 220; // A3
    const oscs = [];
    partials.forEach(p => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = base * p.ratio;
      o.detune.value = p.detune;
      g.gain.value = 0;
      o.connect(g); g.connect(master);
      o.start(when);
      // very fast attack (mallet strike), slow decay
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(p.level, when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + p.decay);
      o.stop(when + p.decay + 0.1);
      oscs.push(o);
    });

    // mallet "thock" — short band-pass filtered noise burst
    const nBuf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const nData = nBuf.getChannelData(0);
    for (let i = 0; i < nData.length; i++) nData[i] = (Math.random() * 2 - 1) * (1 - i / nData.length);
    const nSrc = ctx.createBufferSource();
    nSrc.buffer = nBuf;
    const nFilt = ctx.createBiquadFilter();
    nFilt.type = "bandpass";
    nFilt.frequency.value = 1800;
    nFilt.Q.value = 2;
    const nGain = ctx.createGain();
    nGain.gain.value = 0;
    nGain.gain.setValueAtTime(0, when);
    nGain.gain.linearRampToValueAtTime(0.25, when + 0.005);
    nGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
    nSrc.connect(nFilt); nFilt.connect(nGain); nGain.connect(master);
    nSrc.start(when);
    nSrc.stop(when + 0.2);

    // overall envelope — gently swell-in (bowl resonance builds) then long release
    master.gain.setValueAtTime(0, when);
    master.gain.linearRampToValueAtTime(1, when + 0.15);
  };

  useEffect(() => {
    if (!playing) {
      // clear any pending strikes + stop timer
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
      if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
      if (ctxRef.current) {
        const ctx = ctxRef.current;
        // quick fade to avoid click
        try {
          const n = ctx.currentTime;
          // we don't keep master here; fade handled by context close after short delay
          setTimeout(() => { try { ctx.close(); } catch {} }, 200);
        } catch {}
        ctxRef.current = null;
      }
      return;
    }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    // subtle reverb-ish blur: short convolver from synthetic impulse
    const master = ctx.createGain();
    master.gain.value = 0.7;

    // simple feedback delay for spaciousness
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.28;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    delay.connect(fb); fb.connect(delay);
    delay.connect(wet);
    master.connect(delay);
    master.connect(ctx.destination);
    wet.connect(ctx.destination);

    ctxRef.current = ctx;

    // schedule strikes every ~12s across the 90s session
    const now = ctx.currentTime;
    const strikeTimes = [0.1, 12, 24, 36, 48, 60, 72, 84];
    strikeTimes.forEach(t => strike(ctx, now + t, master));

    // auto-stop at 90s
    stopTimerRef.current = setTimeout(() => {
      if (onStopRef.current) onStopRef.current();
    }, 90000);

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
      if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
      try { ctx.close(); } catch {}
    };
  }, [playing]);

  return { setOnStop: (cb) => { onStopRef.current = cb; } };
}

function HeroSun({ headline, sub, cta, onCTA, onPricing }) {
  const words = headline.split(" ");
  const last = words.pop();
  const first = words.join(" ");

  const [playing, setPlaying] = useState(false);
  const { phase, t } = useBreath(playing);
  const bowl = useBreathTone(playing, phase);
  useEffect(() => { bowl.setOnStop(() => setPlaying(false)); });

  // Breath scale: inhale 0.92→1.08, hold 1.08, exhale 1.08→0.92
  let scale = 1;
  if (playing) {
    if (phase === "In") scale = 0.92 + 0.16 * t;
    else if (phase === "Hold") scale = 1.08;
    else scale = 1.08 - 0.16 * t;
  }

  return (
    <section className="hero hero-sun">
      <div className="hero-wrap">
        <button className="hero-eyebrow" onClick={onCTA} style={{cursor: 'pointer', border: 0, font: 'inherit'}}>Start your session now</button>
        <div className="sun-stage" data-playing={playing}>
          <div className="sun-ring" />
          <div className="sun-ring r2" />
          <button
            className={"sun-disc sun-disc-btn " + (playing ? "playing" : "")}
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? "Pause guided breath" : "Begin guided breath"}
            style={{transform: `scale(${scale})`, transition: 'transform 0.15s linear'}}>
            <span className="sun-disc-icon">
              {playing
                ? <svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor"><path d="M7 4.5v15L21 12z"/></svg>
                : <svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor"><rect x="6" y="4" width="4.5" height="16" rx="1.2"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.2"/></svg>}
            </span>
          </button>
          <div className="breath-overlay" style={{opacity: playing ? 1 : 0}}>
            <div className="breath-phase">{phase === 'In' ? 'breathe in' : phase === 'Out' ? 'breathe out' : 'hold'}</div>
            <div className="breath-count">{Math.max(1, Math.ceil((BREATH.find(b => b.phase === phase).dur) * (1 - t)))}</div>
          </div>
          <div className="sun-hint">{playing ? "Pause" : "Breathe with me"}</div>
          <div className="sun-leaves">
            <svg width="60" height="60" style={{top: '8%', left: '4%', transform: 'rotate(-20deg)'}} viewBox="0 0 40 40">
              <path d="M5 35 Q 20 5 35 35" stroke="#088395" fill="none" strokeWidth="1"/>
              <path d="M10 30 Q 20 12 30 30" stroke="#088395" fill="none" strokeWidth="1"/>
            </svg>
            <svg width="70" height="70" style={{bottom: '4%', right: '2%', transform: 'rotate(140deg)'}} viewBox="0 0 40 40">
              <path d="M5 35 Q 20 5 35 35" stroke="#088395" fill="none" strokeWidth="1"/>
              <path d="M10 30 Q 20 12 30 30" stroke="#088395" fill="none" strokeWidth="1"/>
            </svg>
          </div>
        </div>
        <h1 className="hero-h1">{first} <em>{last}</em></h1>
        <div className="hero-cta">
          <button className="btn btn-primary btn-lg" onClick={onCTA}>
            {cta} <Icon name="arrow-right" size={16} />
          </button>
          <button className="btn btn-ghost btn-lg">
            <Icon name="play" size={12} /> Watch a 90‑sec practice
          </button>
        </div>
        <div className="hero-meta">
          <strong>4.9 ★</strong>
          <span className="dot" />
          <a className="hero-meta-link" onClick={() => window.dispatchEvent(new CustomEvent('wwy-goto', {detail: 'corporate'}))} style={{cursor:'pointer'}}>Corporate subscriptions</a>
          <span className="dot" />
          <a className="hero-meta-link" href="#insurance" onClick={(e) => e.preventDefault()}>Access through health insurance →</a>
        </div>
      </div>
    </section>
  );
}

function HeroSplit({ headline, sub, cta, onCTA }) {
  const words = headline.split(" ");
  const last = words.pop();
  const first = words.join(" ");
  return (
    <section className="hero">
      <div className="hero-wrap">
        <div className="hero-split">
          <div>
            <div className="hero-eyebrow">Individual‑first wellness</div>
            <h1 className="hero-h1" style={{margin: '18px 0 18px', maxWidth: '14ch'}}>{first} <em>{last}</em></h1>
            <p className="hero-sub" style={{margin: '0 0 28px'}}>{sub}</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={onCTA}>{cta} <Icon name="arrow-right" size={16}/></button>
              <button className="btn btn-ghost btn-lg"><Icon name="play" size={12}/> Watch a taster</button>
            </div>
            <div className="hero-meta" style={{justifyContent: 'flex-start'}}>
              <strong>4.9 ★</strong><span className="dot"/><span>12,400 practitioners</span>
            </div>
          </div>
          <div className="hero-photo">
            <div className="hero-photo-caption">— Ubud, 6:14 am</div>
            <div className="hero-photo-label">Photo · Morning flow</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroEditorial({ headline, sub, cta, onCTA }) {
  const parts = headline.split(" ");
  const a = parts.slice(0, Math.ceil(parts.length/2)).join(" ");
  const b = parts.slice(Math.ceil(parts.length/2)).join(" ");
  return (
    <section className="hero hero-editorial">
      <div className="hero-wrap" style={{paddingTop: 32}}>
        <div className="hero-eyebrow">Est. in the rice terraces, practiced at your desk</div>
        <div className="stack" style={{marginTop: 24}}>
          <h1 className="h-giant">
            <span className="a">{a}</span><br/>
            <span className="b">{b}</span>
          </h1>
          <div>
            <div className="e-photo">
              <div className="hero-photo-caption">— Penestanan, dawn</div>
              <div className="hero-photo-label">Photo · Sun salute</div>
            </div>
            <p className="e-sub" style={{marginTop: 24}}>{sub}</p>
            <div className="e-row">
              <button className="btn btn-primary btn-lg" onClick={onCTA}>{cta} <Icon name="arrow-right" size={16}/></button>
              <button className="btn btn-ghost btn-lg"><Icon name="play" size={12}/> Take the 2‑min stress check</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.HeroSun = HeroSun;
window.HeroSplit = HeroSplit;
window.HeroEditorial = HeroEditorial;
