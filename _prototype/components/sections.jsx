/* global React, Icon */

function SplitSection({ setPage }) {
  return (
    <section className="split">
      <div className="split-head">
        <div>
          <div className="section-eyebrow">How to get signed up</div>
          <h2 className="section-h2">Start where <em>you</em> are.</h2>
        </div>
        <p className="section-lede">
          Nine2Rise lives in the space between the cubicle and the cushion. Come as a person. Bring your team later if you want.
        </p>
      </div>
      <div className="split-cards">
        <div className="split-card individual" onClick={() => setPage("individual")}>
          <div className="chip" style={{background:'rgba(255,255,255,0.16)', color:'#fff'}}>For you</div>
          <h3><em>I'm here</em> for myself.</h3>
          <p>Ten minutes before the 9am. A long exhale after the kids are asleep. A practice that doesn't ask you to become anyone new.</p>
          <div className="spacer" />
          <div className="card-foot">
            <div className="foot-list">
              <span>· Anxiety</span><span>· Sleep</span><span>· Back</span><span>· Burnout</span>
            </div>
            <div className="arrow"><Icon name="arrow-up-right" size={18} /></div>
          </div>
          <svg className="bg-deco" width="220" height="220" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" stroke="#fff" fill="none" strokeWidth="0.3"/>
            <circle cx="20" cy="20" r="14" stroke="#fff" fill="none" strokeWidth="0.3"/>
            <circle cx="20" cy="20" r="10" stroke="#fff" fill="none" strokeWidth="0.3"/>
          </svg>
        </div>
        <div className="split-card corporate" onClick={() => setPage("corporate")}>
          <div className="chip">For teams</div>
          <h3>We bring <em>calm</em> to your company.</h3>
          <p>Live weekly flows, in‑office workshops, and a private app for your people. No "wellness Slack channel" required.</p>
          <div className="spacer" />
          <div className="card-foot">
            <div className="foot-list" style={{color:'var(--ink-3)'}}>
              <span>From £6/employee/mo</span>
            </div>
            <div className="arrow"><Icon name="arrow-up-right" size={18}/></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Struggles({ setPage }) {
  const items = [
    { icon: "brain", label: "Anxious mornings", tag: "Guided by <strong>Ketut</strong>" },
    { icon: "moon", label: "Wired at 11 pm", tag: "<strong>Yin</strong> & breath" },
    { icon: "flame", label: "Lower‑back ache", tag: "<strong>8 min</strong> desk flow" },
    { icon: "wave", label: "Screen fatigue", tag: "Eyes + <strong>nervous system</strong>" },
    { icon: "heart", label: "Low‑energy afternoons", tag: "<strong>Pranayama</strong>" },
    { icon: "anchor", label: "Decision fatigue", tag: "<strong>Stillness</strong> practice" },
    { icon: "leaf", label: "Starting from scratch", tag: "<strong>Beginner</strong> path" },
    { icon: "spark", label: "Grief, quietly", tag: "Held by <strong>Ayu</strong>" },
  ];
  return (
    <section className="struggles">
      <div className="struggles-inner">
        <div className="split-head" style={{marginBottom: 0}}>
          <div>
            <div className="section-eyebrow">Services offered</div>
            <h2 className="section-h2">Find the class that <em>fits today.</em></h2>
          </div>
          <p className="section-lede">
            Pick whatever is true today. We'll meet it with a short, specific practice — either a live class at your office or co‑working space, or a guided session in the app. Most are under 12 minutes, though some go up to 90 minutes.
          </p>
        </div>
        <div className="struggles-modes">
          <span className="sm-chip sm-chip-live"><span className="sm-dot"></span> Live, in person · weekly at your workplace</span>
          <span className="sm-chip sm-chip-app"><span className="sm-dot"></span> In the app · guided recordings, breathwork & sound</span>
        </div>
        <div className="why-grid">
          <button type="button" className="why-col why-employee" onClick={() => setPage && setPage("individual")}
            style={{cursor: setPage ? 'pointer' : 'default', textAlign: 'left', font: 'inherit', color: 'inherit', border: 0, background: 'transparent', padding: 0}}>
            <div className="why-lbl">For employees <span aria-hidden="true" style={{opacity:0.55, marginLeft:6}}>→</span></div>
          </button>
          <button type="button" className="why-col why-employer" onClick={() => setPage && setPage("corporate")}
            style={{cursor: setPage ? 'pointer' : 'default', textAlign: 'left', font: 'inherit', color: 'inherit', border: 0, background: 'transparent', padding: 0}}>
            <div className="why-lbl">For employers <span aria-hidden="true" style={{opacity:0.55, marginLeft:6}}>→</span></div>
          </button>
        </div>
        <div className="struggles-grid">
          {items.map((s, i) => (
            <div key={i} className="struggle">
              <Icon name={s.icon} className="ico" size={28} />
              <div className="label">{s.label}</div>
              <div className="tag" dangerouslySetInnerHTML={{__html: s.tag}} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhonePreview() {
  return (
    <div className="phone">
      <div className="phone-notch"/>
      <div className="phone-screen">
        <div className="phone-statbar"><span>9:41</span><span>●●●</span></div>
        <div className="phone-body">
          <div className="phone-hello">good morning,</div>
          <div className="phone-name">Maya</div>
          <div className="phone-card">
            <div className="label">Today for you</div>
            <div className="title">Unclench the jaw, open the chest</div>
            <div className="meta"><span>12 min · Ketut</span><span>▶</span></div>
          </div>
          <div className="phone-tile">
            <div className="t-dot"/>
            <div>
              <div className="t-title">This week's timetable</div>
              <div>6 live classes available</div>
            </div>
            <div className="t-time">→</div>
          </div>
          <div className="phone-tile">
            <div className="t-dot" style={{background:'#E9B93D'}}/>
            <div>
              <div className="t-title">Wind‑down yin</div>
              <div>Before sleep</div>
            </div>
            <div className="t-time">18m</div>
          </div>
          <div className="phone-tile">
            <div className="t-dot"/>
            <div>
              <div className="t-title">Breath only</div>
              <div>For the meeting</div>
            </div>
            <div className="t-time">3m</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="how">
      <div className="how-grid">
        <div className="how-phone"><PhonePreview /></div>
        <div className="steps">
          <div className="step">
            <div className="step-num">i.</div>
            <div>
              <h3 className="step-title">Tell us what's loud today.</h3>
              <p className="step-body">Anxious? Achy? Wired? Three taps and we stop guessing. The app learns your weather, not just your goals.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">ii.</div>
            <div>
              <h3 className="step-title">Get one short practice.</h3>
              <p className="step-body">Under twelve minutes, filmed in global locations with teachers who actually know your name by week two.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">iii.</div>
            <div>
              <h3 className="step-title">Notice what shifts.</h3>
              <p className="step-body">Over weeks, you'll see the knots loosen — quietly, then all at once.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Practices() {
  return (
    <section className="practices">
      <div className="practices-inner">
        <div className="practice-rail">
          <div className="practice">
            <div className="p-kicker">Morning · Ubud series</div>
            <h4>Wake without <em>waking</em> the nerves.</h4>
            <p>Gentle sun salutes for people whose phones already had a panic attack before they did.</p>
            <div className="p-foot"><span className="min">12 min · Beginner</span><div className="p-arrow"><Icon name="arrow-up-right" size={14}/></div></div>
          </div>
          <div className="practice p-2">
            <div className="p-kicker">Midday · Desk reset</div>
            <h4>Undo the <em>keyboard body</em>.</h4>
            <p>Shoulders, neck, and the weird spot under the right shoulder blade. No mat, no shoes off.</p>
            <div className="p-foot"><span className="min">8 min · Any level</span><div className="p-arrow"><Icon name="arrow-up-right" size={14}/></div></div>
          </div>
          <div className="practice p-3">
            <div className="p-kicker">Evening · Yin</div>
            <h4>Put the day <em>down</em>.</h4>
            <p>Long holds, soft lights, slow breath. For nights when your brain won't stop drafting emails.</p>
            <div className="p-foot"><span className="min">22 min · All levels</span><div className="p-arrow"><Icon name="arrow-up-right" size={14}/></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section className="quote">
      <blockquote>
        I stopped trying to fix myself on a cushion in Bali. Ten minutes, at my kitchen table, before the inbox — that's what actually changed things.
      </blockquote>
      <cite><strong>Maya R.</strong> · product designer · practicing 14 months</cite>
    </section>
  );
}

function AppCTA({ onCTA }) {
  return (
    <section className="app-cta">
      <div className="app-cta-inner">
        <div>
          <div className="section-eyebrow" style={{color: 'var(--sun)'}}>The app</div>
          <h2>A small green room <em>in your pocket.</em></h2>
          <p>One practice a day. Teachers in Ubud. Learning that gets quieter the longer you use it. Free for seven days — no card, no catch.</p>
          <div className="store-row">
            <button className="store-btn" onClick={onCTA}>
              <Icon name="apple" size={26} />
              <span>
                <span className="s-mini">DOWNLOAD ON</span>
                <span className="s-name">App Store</span>
              </span>
            </button>
            <button className="store-btn" onClick={onCTA}>
              <Icon name="play-store" size={26} />
              <span>
                <span className="s-mini">GET IT ON</span>
                <span className="s-name">Google Play</span>
              </span>
            </button>
          </div>
        </div>
        <div className="app-cta-right">
          <PhonePreview />
        </div>
      </div>
    </section>
  );
}

window.SplitSection = SplitSection;
window.Struggles = Struggles;
window.HowItWorks = HowItWorks;
window.Practices = Practices;
window.QuoteSection = QuoteSection;
window.AppCTA = AppCTA;
window.PhonePreview = PhonePreview;
