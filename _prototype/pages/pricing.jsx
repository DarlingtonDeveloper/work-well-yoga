/* global React, Icon */
const { useState: useStateP } = React;

function PricingPage({ setPage }) {
  const [audience, setAudience] = useStateP("corporate"); // corporate | cowork | healthcare

  // Corporate tiers — matching corporate page
  const corporatePlans = [
    {
      name: "Starter",
      tagline: "One class per month",
      price: "From £50",
      per: "per month",
      seats: "Up to 15 participants",
      blurb: "A single 60‑minute class a month. In‑office or Zoom. The quietest way to start.",
      features: [
        "1 live class per month",
        "Up to 15 participants",
        "Choice of 6 class formats",
        "In‑office or Zoom",
        "App access for all attendees",
      ],
      cta: "Book Starter",
    },
    {
      name: "Quarterly",
      tagline: "Most chosen",
      price: "From £100",
      per: "per month",
      seats: "Up to 15 participants",
      blurb: "Four classes a month, same teacher, a weekly rhythm that teams actually settle into.",
      features: [
        "4 live classes per month",
        "Up to 15 participants",
        "Dedicated teacher",
        "Rotating formats",
        "App access, all employees",
        "Quarterly review call",
      ],
      cta: "Book Quarterly",
      featured: true,
    },
    {
      name: "Full team",
      tagline: "Up to 30 seats",
      price: "From £300",
      per: "per month",
      seats: "Up to 30 participants",
      blurb: "Four classes a month, double the capacity. For teams wanting a deeper practice.",
      features: [
        "4 live classes per month",
        "Up to 30 participants",
        "Dedicated teacher",
        "Priority scheduling",
        "Bespoke themed series",
        "App access, all employees",
      ],
      cta: "Book Full team",
    },
  ];

  const coworkPlans = [
    {
      name: "Weekly class",
      tagline: "One class a week",
      price: "£640",
      per: "per month",
      seats: "Free for your members",
      blurb: "We run one 60‑minute class a week at your space. Your members book through our app — no cost to them, no admin for you.",
      features: [
        "One 60‑min class each week",
        "We bring mats, props, teacher",
        "Members book in two taps",
        "Printed schedule for your lobby",
        "Cancel with 30 days' notice",
      ],
      cta: "Book a call",
    },
    {
      name: "Full programme",
      tagline: "Most co‑works choose this",
      price: "£1,480",
      per: "per month",
      seats: "Free for your members",
      blurb: "A proper weekly rhythm — morning yoga, lunchtime breath, Friday wind‑down. A genuine amenity your members feel.",
      features: [
        "2–3 classes per week",
        "Mix of yoga, breath & sound",
        "Co‑branded booking page",
        "Quarterly themed pop‑up",
        "Dedicated account manager",
      ],
      cta: "Book a call",
      featured: true,
    },
    {
      name: "One‑off",
      tagline: "Single event",
      price: "From £280",
      per: "per class",
      seats: "Up to 25 members",
      blurb: "A launch, a member evening, a Mental Health Week special. We'll run a single class — no subscription, no commitment.",
      features: [
        "60 or 75‑minute class",
        "Any format, any time",
        "Everything included",
        "Book as many as you like",
      ],
      cta: "Get a quote",
    },
  ];

  const healthcarePlans = [
    {
      name: "Vitality",
      tagline: "Tier 1 partner",
      badge: "Most members covered",
      blurb: "Nine2Rise is a claimable wellness benefit. Members earn points for every class attended, with six months of app access fully reimbursable.",
      covered: ["6 months app access", "Unlimited live class bookings", "Vitality points per class"],
      notcovered: ["1:1 teacher sessions", "Workshop attendance"],
    },
    {
      name: "BUPA",
      tagline: "Tier 1 partner",
      blurb: "BUPA members with a corporate plan can claim Nine2Rise as a preventive wellbeing benefit. Check your wellbeing benefits section.",
      covered: ["3 months app access", "Booking into partner co‑working classes"],
      notcovered: ["In‑office classes (unless employer covers)"],
    },
    {
      name: "AXA Health & Aetna",
      tagline: "Tier 2 partners",
      blurb: "Coverage varies by plan and employer. Most AXA corporate plans include 3 months; Aetna International plans vary.",
      covered: ["Variable — check your plan", "Our team can check for you"],
      notcovered: ["Dependent on specific policy"],
    },
  ];

  const plans = audience === "corporate" ? corporatePlans : coworkPlans;
  const isSubscription = true;

  return (
    <>
      {/* Hero */}
      <section className="pricing-hero">
        <div className="pricing-hero-inner">
          <div className="eyebrow">Pricing</div>

          <div className="pricing-tabs pricing-tabs-2" role="tablist">
            <button role="tab" aria-selected={audience === "corporate"}
              className={audience === "corporate" ? "active" : ""}
              onClick={() => setAudience("corporate")}>Employers</button>
            <button role="tab" aria-selected={audience === "cowork"}
              className={audience === "cowork" ? "active" : ""}
              onClick={() => setAudience("cowork")}>Co‑working</button>
            <div className="tabs-indicator-2" data-pos={audience}></div>
          </div>
        </div>
      </section>

      {/* Cards panel */}
      <section className="pricing-panel">
        {isSubscription ? (
          <div className="pricing-cards">
            {plans.map((p, i) => (
              <div key={i} className={"pcard " + (p.featured ? "pcard-featured" : "")}>
                {p.featured && <div className="pcard-ribbon">{p.tagline}</div>}
                <div className="pcard-head">
                  <div className="pcard-name">{p.name}</div>
                  {!p.featured && <div className="pcard-tag">{p.tagline}</div>}
                </div>
                <div className="pcard-price">
                  <span className="v">{p.price}</span>
                  <span className="p">{p.per}</span>
                </div>
                <div className="pcard-seats">{p.seats}</div>
                <p className="pcard-blurb">{p.blurb}</p>
                <div className="pcard-divider" />
                <ul className="pcard-list">
                  {p.features.map((f, j) => <li key={j}><span className="tick"><Icon name="check" size={12}/></span> {f}</li>)}
                </ul>
                <button
                  className={"btn btn-lg " + (p.featured ? "btn-sun" : "btn-ghost")}
                  onClick={() => setPage(audience === "corporate" ? "corporate" : audience === "cowork" ? "contact" : "individual")}
                  style={{width: '100%', justifyContent: 'center', marginTop: 'auto'}}>
                  {audience === "corporate" ? "Learn more →" : p.cta}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="pricing-cards">
            {plans.map((p, i) => (
              <div key={i} className="pcard pcard-hc">
                {p.badge && <div className="pcard-ribbon">{p.badge}</div>}
                <div className="pcard-head">
                  <div className="pcard-name">{p.name}</div>
                  <div className="pcard-tag">{p.tagline}</div>
                </div>
                <p className="pcard-blurb">{p.blurb}</p>
                <div className="pcard-divider" />
                <div className="hc-lists">
                  <div>
                    <div className="hc-lbl hc-ok">Covered</div>
                    <ul className="pcard-list">
                      {p.covered.map((f, j) => <li key={j}><span className="tick"><Icon name="check" size={12}/></span> {f}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="hc-lbl hc-no">Not covered</div>
                    <ul className="pcard-list">
                      {p.notcovered.map((f, j) => <li key={j}><span className="tick tick-no"><Icon name="x" size={12}/></span> {f}</li>)}
                    </ul>
                  </div>
                </div>
                <button
                  className="btn btn-lg btn-ghost"
                  onClick={() => setPage("contact")}
                  style={{width: '100%', justifyContent: 'center', marginTop: 'auto'}}>
                  Check my coverage
                </button>
              </div>
            ))}
          </div>
        )}

        {audience === "corporate" && (
          <div className="corp-addon">
            <div>
              <div className="section-eyebrow" style={{color: 'var(--teal)'}}>One‑off</div>
              <h3>A single event? <em>That works too.</em></h3>
              <p>Team offsites, Mental Health Awareness Week, the all‑hands that needs a soft landing. One‑off classes start at <strong>£280</strong>.</p>
            </div>
            <button className="btn btn-sun btn-lg" onClick={() => setPage("contact")}>Get a quote <Icon name="arrow-right" size={14}/></button>
          </div>
        )}
      </section>

      {/* What's always included */}
      <section className="pricing-included-wrap">
        <div className="pricing-included">
          <div className="split-head" style={{marginBottom: 32}}>
            <div>
              <div className="section-eyebrow">Included on every plan</div>
              <h2 className="section-h2">No <em>add‑ons.</em> No surprises.</h2>
            </div>
            <p className="section-lede">Whichever door your members come through, this is what they get.</p>
          </div>
          <div className="included-grid">
            <div className="incl">
              <div className="incl-num">01</div>
              <h4>The full app library</h4>
              <p>120+ recorded classes, guided meditations, breathwork, sound bowls, podcast, articles.</p>
            </div>
            <div className="incl">
              <div className="incl-num">02</div>
              <h4>Live class bookings</h4>
              <p>Book into any class at your employer's office or your co‑working space, in two taps.</p>
            </div>
            <div className="incl">
              <div className="incl-num">03</div>
              <h4>Anonymous by default</h4>
              <p>Nobody at work — HR, managers, your employer's insurer — ever sees what you watched.</p>
            </div>
            <div className="incl">
              <div className="incl-num">04</div>
              <h4>Vetted teachers</h4>
              <p>Every teacher is Ubud‑trained, insured, interviewed. One in nine applicants make it onto the roster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pricing-faq-wrap">
        <div className="split-head" style={{marginBottom: 24}}>
          <div>
            <div className="section-eyebrow">Frequently asked questions</div>
            <h2 className="section-h2">Short answers. <em>No fine print.</em></h2>
          </div>
          <p className="section-lede">The long version is in our terms. If yours isn't here, email <a href="mailto:hello@nine2rise.com">hello@nine2rise.com</a>.</p>
        </div>
        <div className="faq">
          <details open>
            <summary>Do employees pay anything directly?</summary>
            <p>No. Nine2Rise is a business‑to‑business subscription. Your employer, your insurer, or your co‑working space pays us — your employees get access at no personal cost.</p>
          </details>
          <details>
            <summary>What's the minimum contract length?</summary>
            <p>One month. Cancel with seven days' notice, no questions. Most clients stay for 18+ months; a handful have cancelled. Both are fine.</p>
          </details>
          <details>
            <summary>What happens if nobody turns up to a class?</summary>
            <p>The teacher still gets paid. We still learn something. We'll send a quiet note suggesting a format or time change — these adjustments are included in the Quarterly plan's review call.</p>
          </details>
          <details>
            <summary>Do we need a dedicated room?</summary>
            <p>Ideally yes — a quiet meeting room with the chairs stacked to the side. We bring 15 mats, blocks, straps and a Bluetooth speaker. If you're tight on space we can run shorter seated sessions at desks.</p>
          </details>
          <details>
            <summary>Can employees claim Nine2Rise through their health insurance?</summary>
            <p>No — they can't claim it directly. Access is arranged through the employer or health insurer, not the individual. If you're covered, your insurance provider will let you know as part of your plan's benefits.</p>
          </details>
          <details>
            <summary>Can we try a single class before subscribing?</summary>
            <p>Yes. A one‑off class is £280 all‑in, anywhere in London zones 1–3. Credit it against your first three months if you subscribe within 30 days.</p>
          </details>
        </div>
      </section>

      {/* Final CTA */}
      <section className="app-cta">
        <div className="app-cta-inner">
          <div>
            <div className="section-eyebrow" style={{color: 'var(--sun)'}}>The next step</div>
            <p>We'll ask five questions about your team or your members. You'll leave with a clear sense of fit — ours and yours.</p>
            <div className="store-row">
              <button className="btn btn-sun btn-lg" onClick={() => setPage("contact")}>Book an intro call <Icon name="arrow-right" size={14}/></button>
              <button className="btn btn-ghost btn-lg" style={{borderColor: 'rgba(255,255,255,0.3)', color: '#fff'}} onClick={() => setPage("individual")}>See the app first →</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

window.PricingPage = PricingPage;
