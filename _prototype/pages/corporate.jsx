/* global React, Icon */
const { useState: useStateCo } = React;

function CorporatePage({ setPage }) {
  const [selected, setSelected] = useStateCo("quarterly");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      tagline: "One class a month",
      price: "From £50",
      per: "per month",
      seats: "Up to 15 participants",
      desc: "A single 60‑minute wellness class delivered in your office or on Zoom. Yoga, guided meditation, breathwork or a sound bath — you choose the month before.",
      features: [
        "1 class per month",
        "Up to 15 participants",
        "In‑office or Zoom",
        "Choice of 6 class formats",
        "Teacher brings mats & props",
      ],
      cta: "Book Starter",
    },
    {
      id: "quarterly",
      name: "Quarterly",
      tagline: "Our most popular",
      price: "From £100",
      per: "per month",
      seats: "Up to 15 participants",
      desc: "Four classes a month — weekly rhythm. A dedicated teacher who learns your team's preferences, rotating formats so nobody gets bored.",
      features: [
        "4 classes per month",
        "Up to 15 participants",
        "Dedicated teacher",
        "Rotating class formats",
        "Quarterly review call",
        "Aggregate engagement report",
      ],
      cta: "Book Quarterly",
      featured: true,
    },
    {
      id: "enterprise",
      name: "Full team",
      tagline: "Scale it up",
      price: "From £300",
      per: "per month",
      seats: "Up to 30 participants",
      desc: "Four classes a month for larger teams. Same dedicated teacher, double the seats — ideal for companies running two classes a fortnight across departments.",
      features: [
        "4 classes per month",
        "Up to 30 participants",
        "Dedicated teacher",
        "Split into 2 sessions if preferred",
        "Priority scheduling",
        "Bespoke themed series",
      ],
      cta: "Book Full team",
    },
  ];

  const formats = [
    { icon: "sun", name: "Morning Yoga", blurb: "60 minutes. Gentle flow, sets the tone for the week." },
    { icon: "brain", name: "Guided Meditation", blurb: "Sitting or lying down. For teams that don't want a mat." },
    { icon: "wave", name: "Breathwork", blurb: "Physiological sigh, box breath, 4‑7‑8. Deep reset." },
    { icon: "moon", name: "Sound Bath", blurb: "Crystal bowls. Dim the lights, close the meeting room door." },
    { icon: "flame", name: "Desk Mobility", blurb: "30 minutes at the desk. No changing clothes, no mats." },
    { icon: "heart", name: "Restorative Yin", blurb: "End of week, end of quarter. Long holds, bolsters in." },
  ];

  const howSteps = [
    { n: "01", t: "Intro call", d: "20 minutes. We learn about your office, your team's schedule, the mix of people on your payroll." },
    { n: "02", t: "Choose your plan", d: "Starter, Quarterly, or Full team. You can switch any month with seven days' notice." },
    { n: "03", t: "We match a teacher", d: "From a roster of 14 practitioners — each vetted on both teaching and the skill of not being weird in an office." },
    { n: "04", t: "First class, week one", d: "We bring everything. You provide a quiet room and a list of who's attending. We handle reminders." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="corp-hero">
        <div className="corp-hero-inner">
          <div className="eyebrow">For employers</div>
          <h1>Fewer sick days.<br/>Less <em>burnout.</em><br/>Happier teams.</h1>
          <p className="corp-hero-sub">
            Stress‑related absence costs UK businesses an estimated £28bn a year. Nine2Rise is a wellness partner that brings movement, breathwork, meditation and recovery practices into your office or co‑working space — plus an app your team actually opens — so people recover faster, stay longer, and show up better.
          </p>
          <div className="corp-hero-ctas">
            <button className="btn btn-sun btn-lg" onClick={() => setPage("contact")}>Book a 20‑min intro <Icon name="arrow-right" size={14}/></button>
            <button className="btn btn-ghost btn-lg" onClick={() => setPage("individual")}>Or see the app →</button>
          </div>
          <div className="corp-hero-meta">
            <div><strong>From £99</strong><small>per month</small></div>
            <div><strong>Weekly</strong><small>live in‑person classes</small></div>
            <div><strong>Cancel</strong><small>any time, end of cycle</small></div>
            <div><strong>On‑site or app</strong><small>your team picks</small></div>
          </div>
        </div>
      </section>

      {/* The problem framing */}
      <section className="corp-problem">
        <div className="corp-problem-inner">
          <div className="split-head" style={{marginBottom: 40}}>
            <div>
              <div className="section-eyebrow">The quiet problem</div>
              <h2 className="section-h2">Most wellness benefits<br/>sit <em>quietly unused.</em></h2>
            </div>
            <p className="section-lede">The numbers from the HSE and Deloitte are consistent: most employees never open a typical corporate wellness perk. People don't want a points system. They want a teacher, in the room, on a Tuesday.</p>
          </div>
          <div className="barriers-grid">

            <div className="barrier">
              <div className="barrier-head">
                <div className="barrier-num">01</div>
                <div className="barrier-tag">The barrier</div>
                <h3>People don't open the app.</h3>
                <p>Most corporate wellness tools hover around 7–12% monthly active use. The ROI dies there.</p>
              </div>
              <div className="barrier-arrow">
                <svg width="44" height="24" viewBox="0 0 44 24" fill="none"><path d="M2 12h38m0 0l-8-8m8 8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="barrier-answer">
                <div className="barrier-tag barrier-tag-good">Our answer</div>
                <h4>Start with a human. The app earns the habit.</h4>
                <p>A teacher turns up at your office every week. People come because they like <em>her</em> — then open the app on a bad Tuesday because they already know her voice.</p>
                <div className="barrier-chip">Live class → app engagement → compounding habit</div>
              </div>
            </div>

            <div className="barrier">
              <div className="barrier-head">
                <div className="barrier-num">02</div>
                <div className="barrier-tag">The barrier</div>
                <h3>Office schedules are chaos.</h3>
                <p>Meetings move, people travel, half the team is hybrid. A wellness class that needs everyone in the same room on the same day just… doesn't happen.</p>
              </div>
              <div className="barrier-arrow">
                <svg width="44" height="24" viewBox="0 0 44 24" fill="none"><path d="M2 12h38m0 0l-8-8m8 8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="barrier-answer">
                <div className="barrier-tag barrier-tag-good">Our answer</div>
                <h4>In‑office, Zoom, or on the app — same teacher.</h4>
                <p>The weekly class runs live in your office <em>and</em> streams on Zoom for hybrid teammates. Anyone who misses it opens the app and finds the same teacher's on‑demand library waiting.</p>
                <div className="barrier-chip">In‑person · Zoom · on‑demand</div>
              </div>
            </div>

            <div className="barrier">
              <div className="barrier-head">
                <div className="barrier-num">03</div>
                <div className="barrier-tag">The barrier</div>
                <h3>Finance won't sign a 12‑month contract for a perk no one uses.</h3>
                <p>Annual deals lock in spend before you know if it works. Procurement hates it. Boards hate it.</p>
              </div>
              <div className="barrier-arrow">
                <svg width="44" height="24" viewBox="0 0 44 24" fill="none"><path d="M2 12h38m0 0l-8-8m8 8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="barrier-answer">
                <div className="barrier-tag barrier-tag-good">Our answer</div>
                <h4>Month‑to‑month. Cancel any time.</h4>
                <p>From £99/month. Transparent per‑class pricing, no setup fees, no minimum team size. Scale down if budgets move, pause for quiet periods, step back up when hiring picks up.</p>
                <div className="barrier-chip">From £99/mo · no setup · cancel end of cycle</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing plans */}
      <section className="corp-plans">
        <div className="split-head">
          <div>
            <div className="section-eyebrow">Subscriptions</div>
            <h2 className="section-h2">Three packages. <em>Month to month.</em></h2>
          </div>
          <p className="section-lede">No annual contracts. No "minimum of ten seats." Your first class is in three days from today's call.</p>
        </div>

        <div className="corp-plan-grid">
          {plans.map(p => (
            <div key={p.id}
                 className={"corp-plan " + (p.featured ? "featured " : "") + (selected === p.id ? "selected" : "")}
                 onClick={() => setSelected(p.id)}>
              {p.featured && <div className="corp-plan-ribbon">Most chosen</div>}
              <div className="cp-head">
                <div className="cp-name">{p.name}</div>
                <div className="cp-tag">{p.tagline}</div>
              </div>
              <div className="cp-price">
                <span className="v">{p.price}</span>
                <span className="p">{p.per}</span>
              </div>
              <div className="cp-seats">{p.seats}</div>
              <p className="cp-desc">{p.desc}</p>
              <div className="cp-divider"/>
              <ul className="cp-list">
                {p.features.map((f, i) => <li key={i}><span className="tick"><Icon name="check" size={12}/></span> {f}</li>)}
              </ul>
              <button
                className={"btn btn-lg " + (p.featured ? "btn-sun" : "btn-ghost")}
                onClick={(e) => { e.stopPropagation(); setPage("contact"); }}
                style={{width: '100%', justifyContent: 'center', marginTop: 'auto'}}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="corp-addon">
          <div>
            <div className="section-eyebrow" style={{color: 'var(--teal)'}}>Members only</div>
            <h3>Just a single event? That works too.</h3>
            <p>Already a Nine2Rise member? Book a one‑off for your team offsite, quarterly all‑hands, or Mental Health Awareness Week. One‑off classes start at <strong>£280</strong>.</p>
          </div>
          <button className="btn btn-sun btn-lg" onClick={() => setPage("contact")}>Get a quote <Icon name="arrow-right" size={14}/></button>
        </div>
      </section>

      {/* Co‑working offices */}
      <section className="corp-cowork-wrap">
        <div className="corp-cowork corp-cowork-simple">
          <div className="cw-left">
            <div className="section-eyebrow" style={{color: 'var(--sun)'}}>Co‑working offices</div>
            <h2 className="section-h2">Run a workspace? <em>Let's talk.</em></h2>
            <p>We partner with co‑working spaces to run a weekly resident class. Get in touch and we'll walk you through how it works.</p>
            <button className="btn btn-sun" onClick={() => setPage("contact")}>Enquire <Icon name="arrow-right" size={14}/></button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="corp-how">
        <div className="split-head" style={{marginBottom: 40}}>
          <div>
            <div className="section-eyebrow">How it works</div>
            <h2 className="section-h2">Four steps. <em>Three weeks.</em></h2>
          </div>
        </div>
        <div className="corp-how-grid">
          {howSteps.map((s, i) => (
            <div key={i} className="corp-how-step">
              <div className="cs-num">{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Insurance / healthcare partner */}
      <section className="corp-insurance-wrap">
        <div className="corp-insurance">
          <div>
            <div className="section-eyebrow" style={{color: 'var(--sun)'}}>Two ways in</div>
            <h2 className="section-h2">Through your company, or <em>your healthcare plan.</em></h2>
            <p>There are two ways employees access Nine2Rise. <strong>One:</strong> your company signs up directly — every employee gets included. <strong>Two:</strong> it's offered as a claimable wellness benefit through private healthcare partners like AXA, Vitality and BUPA — employees claim through their existing plan.</p>
            <button className="btn btn-sun" onClick={() => setPage("contact")}>Check eligibility <Icon name="arrow-right" size={14}/></button>
          </div>
          <div className="insurance-logos">
            <div className="ins-chip">Vitality</div>
            <div className="ins-chip">BUPA</div>
            <div className="ins-chip">AXA Health</div>
            <div className="ins-chip">Aetna</div>
            <div className="ins-chip">Cigna</div>
            <div className="ins-chip">+ 4 more</div>
          </div>
        </div>
      </section>

      {/* CTA */}
    </>
  );
}
window.CorporatePage = CorporatePage;
