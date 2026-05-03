/* global React, Icon */
const { useState: useStateIn } = React;

function IndividualPage({ setPage }) {
  // In‑app feature grid
  const appFeatures = [
    { icon: "clock", t: "Live class timetable", d: "Every class your employer or co‑working space has booked this month — book your seat in two taps." },
    { icon: "play", t: "Recorded yoga classes", d: "A 120‑class library filmed in Ubud. Vinyasa, yin, restorative, desk flows. Downloadable for offline." },
    { icon: "brain", t: "Guided meditations", d: "Short and long. For anxious mornings, for the hour before sleep, for the twenty minutes between meetings." },
    { icon: "wave", t: "Guided breathwork", d: "Box breath, 4‑7‑8, physiological sigh, ocean breath. Timed, cued, no guesswork." },
    { icon: "moon", t: "Sound bowls & soundscapes", d: "Crystal bowls, binaural, rain on a tin roof. For focus, for sleep, for savasana at home." },
    { icon: "mail", t: "Wellbeing at work podcast", d: "Fortnightly, 25 minutes. Short essays on stress, posture, team rituals — from our teachers and guests." },
    { icon: "leaf", t: "Articles & reading", d: "A slow library of essays. Less doom‑scrolling, more 'something to read with your morning tea'." },
    { icon: "heart", t: "Curated affiliate shop", d: "Mats, bolsters, books, candles — 42 things we actually use. Honest commission disclosure on every item." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="ind-hero">
        <div className="ind-hero-inner">
          <div className="eyebrow">For employees</div>
          <p>Nine2Rise is offered as a benefit — either directly by your employer, or through your private healthcare plan with Vitality, BUPA, AXA or Aetna. You get the full app, you attend the live classes your team books, and nobody at work sees what you practise or when.</p>
          <div className="ind-hero-ctas">
            <button className="btn btn-sun btn-lg" onClick={() => setPage("app")}>Get the app <Icon name="arrow-right" size={14}/></button>
            <button className="btn btn-ghost btn-lg" onClick={() => setPage("pricing")}>See plans →</button>
          </div>
        </div>
      </section>

      {/* In the app */}
      <section className="ind-features-wrap">
        <div className="ind-features">
          {appFeatures.map((f, i) => (
            <div key={i} className="ind-feat">
              <div className="if-icon"><Icon name={f.icon} size={22}/></div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy promise */}
      {/* CTA */}
      <section className="app-cta">
        <div className="app-cta-inner">
          <div>
            <div className="section-eyebrow" style={{color: 'var(--sun)'}}>Get started</div>
            <h2>If you already have access, <em>download the app.</em></h2>
            <p>If you don't, send us your employer's name and we'll reach out to them — quietly, no pressure, no mention of you.</p>
            <div className="store-row">
              <button className="btn btn-sun btn-lg" onClick={() => setPage("app")}>Download the app <Icon name="arrow-right" size={14}/></button>
              <button className="btn btn-ghost btn-lg" style={{borderColor: 'rgba(255,255,255,0.3)', color: '#fff'}} onClick={() => setPage("contact")}>
                Nominate my employer →
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
window.IndividualPage = IndividualPage;
