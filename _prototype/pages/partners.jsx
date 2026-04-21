/* global React, Icon */

function PartnersPage({ setPage }) {
  const stats = [
    { v: "1 in 9", l: "applicants accepted" },
    { v: "£60–95", l: "per 60‑min class" },
    { v: "120+", l: "active teachers" },
    { v: "48hr", l: "avg. application response" },
  ];

  const qualities = [
    {
      n: "01",
      h: "Trained somewhere real",
      p: "A 200hr qualification from a Yoga Alliance or equivalent school. Ubud, Rishikesh, Mysore, an established London studio — we don't rank them, we just want the ground to be solid.",
    },
    {
      n: "02",
      h: "Three years teaching",
      p: "Beyond a course, beyond cover classes. You've had to calm a room of strangers on a Monday morning. You know how to teach someone who has never held a block.",
    },
    {
      n: "03",
      h: "Insured and safeguarded",
      p: "Current public liability cover and an up‑to‑date DBS check. If you're working toward these, we'll help — we won't gatekeep on paperwork alone.",
    },
    {
      n: "04",
      h: "Comfortable with corporate rooms",
      p: "Offices are odd places. Humming ceiling vents, a glass wall onto the sales floor, three people in suits, one in leggings. You need to meet the room as it is.",
    },
  ];

  const process = [
    {
      n: "01",
      h: "Application",
      p: "A short form — qualifications, where you teach now, a two‑minute video of you leading a warm‑up. No polished reel, just you speaking to a class.",
      t: "15 minutes",
    },
    {
      n: "02",
      h: "First conversation",
      p: "A 30‑minute call with Priya or Marcus. We'll ask about your lineage, your injuries, what you do when someone cries mid‑savasana.",
      t: "Week 1",
    },
    {
      n: "03",
      h: "Trial class",
      p: "You teach one of our existing classes — either an office group or a studio session with our team. We pay full rate. You can walk away after.",
      t: "Week 2–3",
    },
    {
      n: "04",
      h: "Onboarding",
      p: "A half‑day in person: how corporate rooms differ, our booking app, safeguarding refresh, and a coffee with the two other teachers on your patch.",
      t: "Week 4",
    },
  ];

  const formats = ["Hatha", "Vinyasa", "Yin", "Restorative", "Chair yoga", "Breathwork", "Sound", "Pregnancy"];

  return (
    <>
      {/* Hero */}
      <section className="partners-hero">
        <div className="partners-hero-inner">
          <div className="partners-hero-copy">
            <div className="eyebrow">Teach with Work Well Yoga</div>
            <h1>Pay that <em>respects</em><br/>your training.</h1>
            <p className="lede">We pay teachers £60–95 per sixty‑minute class, travel on top. We schedule three weeks in advance. We cancel with 48 hours' notice or full pay. This page is about how, and who we look for.</p>

            <div className="partners-hero-stats">
              {stats.map((s, i) => (
                <div key={i} className="ph-stat">
                  <strong>{s.v}</strong>
                  <small>{s.l}</small>
                </div>
              ))}
            </div>

            <div className="store-row" style={{marginTop: 32}}>
              <button className="btn btn-sun btn-lg" onClick={() => setPage("contact")}>Apply to teach <Icon name="arrow-right" size={14}/></button>
              <a className="btn btn-ghost btn-lg" href="#how-we-pay">How we pay →</a>
            </div>
          </div>
          <div className="partners-hero-frame">
            <div className="ph-card ph-card-1">
              <div className="ph-card-head">
                <span className="ph-dot" style={{background: 'var(--teal)'}}></span>
                This week
              </div>
              <div className="ph-row">
                <div>
                  <div className="ph-time">Tue 12:30</div>
                  <div className="ph-place">Monzo · Shoreditch</div>
                </div>
                <div className="ph-fee">£75</div>
              </div>
              <div className="ph-row">
                <div>
                  <div className="ph-time">Wed 08:00</div>
                  <div className="ph-place">Huckletree · Soho</div>
                </div>
                <div className="ph-fee">£80</div>
              </div>
              <div className="ph-row">
                <div>
                  <div className="ph-time">Thu 17:30</div>
                  <div className="ph-place">Kings Cross studio</div>
                </div>
                <div className="ph-fee">£95</div>
              </div>
              <div className="ph-foot">
                <span>3 classes</span>
                <strong>£250</strong>
              </div>
            </div>
            <div className="ph-card ph-card-2">
              <div className="ph-q">"I've taught in offices for four years. Work Well Yoga was the first agency that paid my invoice the same week I sent it."</div>
              <div className="ph-attrib">— Amara, teacher since Jan 2024</div>
            </div>
          </div>
        </div>
      </section>

      {/* What we look for */}
      <section className="partners-look-wrap" id="who">
        <div className="split-head">
          <div>
            <div className="section-eyebrow">Who we take on</div>
            <h2 className="section-h2">We'd rather <em>turn you down</em> than set you up to fail.</h2>
          </div>
          <p className="section-lede">We accept around one in nine applicants. These are the four things that matter; nothing else is a dealbreaker.</p>
        </div>
        <div className="look-grid">
          {qualities.map((q, i) => (
            <div key={i} className="look-card">
              <div className="look-n">{q.n}</div>
              <h3>{q.h}</h3>
              <p>{q.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formats */}
      <section className="partners-formats-wrap">
        <div className="partners-formats">
          <div className="eyebrow">What you can teach</div>
          <h2 className="section-h2">Eight formats. <em>Pick two or three.</em></h2>
          <p className="section-lede">We match teachers to formats they already teach — not styles they'd like to try. If your heart is in yin, we don't need you to fake vinyasa.</p>
          <div className="format-chips">
            {formats.map((f, i) => (
              <span key={i} className="format-chip">{f}</span>
            ))}
          </div>
          <p className="format-note">Teach something that isn't here — Kundalini, Ashtanga, ecstatic dance, Qi gong? Tell us on the form. Half our current roster said the same thing.</p>
        </div>
      </section>

      {/* Process */}
      <section className="partners-process-wrap">
        <div className="split-head">
          <div>
            <div className="section-eyebrow">The process</div>
            <h2 className="section-h2">Four weeks, <em>four steps.</em></h2>
          </div>
          <p className="section-lede">No ghosting, no multi‑round interviews. If you're right, you'll know within a month. If you're not, you'll know within a week.</p>
        </div>
        <div className="process-list">
          {process.map((s, i) => (
            <div key={i} className="process-row">
              <div className="process-n">{s.n}</div>
              <div className="process-body">
                <div className="process-head">
                  <h3>{s.h}</h3>
                  <span className="process-t">{s.t}</span>
                </div>
                <p>{s.p}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How we pay */}
      <section className="partners-pay-wrap" id="how-we-pay">
        <div className="partners-pay">
          <div className="pay-left">
            <div className="eyebrow">How we pay</div>
            <h2 className="section-h2">The boring bit, <em>in plain English.</em></h2>
          </div>
          <div className="pay-right">
            <div className="pay-row">
              <div className="pay-k">Rate per 60‑min class</div>
              <div className="pay-v">£60 <span className="pay-to">→ £95</span></div>
              <div className="pay-note">Based on location, format, and time held with us. Reviewed every 12 months.</div>
            </div>
            <div className="pay-row">
              <div className="pay-k">Travel</div>
              <div className="pay-v">TfL cost + £8</div>
              <div className="pay-note">Paid on top. If you drive, 45p per mile. Reimbursed monthly with invoices.</div>
            </div>
            <div className="pay-row">
              <div className="pay-k">Cancellation policy</div>
              <div className="pay-v">Full pay</div>
              <div className="pay-note">If the client cancels with less than 48 hours' notice, you're still paid. Every time.</div>
            </div>
            <div className="pay-row">
              <div className="pay-k">Payment terms</div>
              <div className="pay-v">7 days</div>
              <div className="pay-note">You invoice weekly through our portal. We pay within seven days, not thirty.</div>
            </div>
            <div className="pay-row">
              <div className="pay-k">Equipment</div>
              <div className="pay-v">Provided</div>
              <div className="pay-note">Mats, blocks, straps, bolsters, speaker — all delivered to the client's office by us.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher voices */}
      <section className="partners-voices-wrap">
        <div className="split-head" style={{marginBottom: 48}}>
          <div>
            <div className="section-eyebrow">Teacher voices</div>
            <h2 className="section-h2">From the roster.</h2>
          </div>
          <p className="section-lede">We asked three teachers what they'd tell a friend thinking of applying. Edited for length, not tone.</p>
        </div>
        <div className="voices-grid">
          <figure className="voice">
            <blockquote>The booking system is the thing that actually surprised me. I can see three weeks ahead, swap a class with another teacher if my mum's in town, and there's a Slack channel where someone always picks up a cover.</blockquote>
            <figcaption>
              <div className="voice-name">Nadia O.</div>
              <div className="voice-meta">Vinyasa, sound · 2 years with WW</div>
            </figcaption>
          </figure>
          <figure className="voice">
            <blockquote>I was running my own WhatsApp list of seven companies and it was eating my Sundays. Handing that over and just showing up to teach has given me my weekend back. The pay is better too.</blockquote>
            <figcaption>
              <div className="voice-name">Dev M.</div>
              <div className="voice-meta">Hatha, restorative · 18 months with WW</div>
            </figcaption>
          </figure>
          <figure className="voice">
            <blockquote>They turned me down first time. Told me what to work on — a specific thing about pacing in a fifty‑minute class. I came back nine months later and they said yes. That felt respectful.</blockquote>
            <figcaption>
              <div className="voice-name">Kit A.</div>
              <div className="voice-meta">Chair yoga, breathwork · 1 year with WW</div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* FAQ */}
      <section className="partners-faq-wrap">
        <div className="split-head" style={{marginBottom: 24}}>
          <div>
            <div className="section-eyebrow">Small questions</div>
            <h2 className="section-h2">Before you apply.</h2>
          </div>
          <p className="section-lede">We get asked these most often. Email <a href="mailto:teachers@workwellyoga.com">teachers@workwellyoga.com</a> for anything else.</p>
        </div>
        <div className="faq">
          <details open>
            <summary>Do I need to be self‑employed?</summary>
            <p>Yes — we work with teachers as sole traders or limited companies. If you're between a studio job and going freelance, we're a good next step but we can't be your only client on day one.</p>
          </details>
          <details>
            <summary>Can I still teach at my own studio?</summary>
            <p>Completely. Most of our teachers have 2–4 other regular gigs. We just ask that you don't poach clients directly — if they want to see you privately, we pass the booking through our platform.</p>
          </details>
          <details>
            <summary>What if my training was in India/Bali and isn't Yoga Alliance accredited?</summary>
            <p>We look at the school, the lineage, and how long the training was — not the acronym. Many of our best teachers have non‑YA certs. Send us your certificate and we'll tell you within a week.</p>
          </details>
          <details>
            <summary>Is there a minimum commitment?</summary>
            <p>Two classes a week, on average. We can't justify the onboarding for less. If you want something more flexible, our cover pool might suit.</p>
          </details>
          <details>
            <summary>What about teachers outside London?</summary>
            <p>We currently operate in London zones 1–4 and are expanding to Manchester and Brighton in Q3 2026. Add yourself to the waitlist on the form and we'll be in touch when we're hiring in your city.</p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="app-cta">
        <div className="app-cta-inner">
          <div>
            <div className="section-eyebrow" style={{color: 'var(--sun)'}}>Ready?</div>
            <h2>Send us <em>a video.</em></h2>
            <p>Two minutes of you teaching. Not polished, not lit. Just you speaking to a class, the way you actually do.</p>
            <div className="store-row">
              <button className="btn btn-sun btn-lg" onClick={() => setPage("contact")}>Start your application <Icon name="arrow-right" size={14}/></button>
              <a className="btn btn-ghost btn-lg" style={{borderColor: 'rgba(255,255,255,0.3)', color: '#fff'}} href="mailto:teachers@workwellyoga.com">teachers@workwellyoga.com</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

window.PartnersPage = PartnersPage;
