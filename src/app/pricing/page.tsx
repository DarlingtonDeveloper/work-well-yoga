"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

const corporatePlans = [
  {
    name: "Starter",
    tagline: "One class per month",
    price: "From \u00a350",
    priceNum: 50,
    per: "per month",
    seats: "Up to 15 participants",
    blurb: "A single 60\u2011minute class a month. In\u2011office or Zoom. The quietest way to start.",
    features: [
      "1 live class per month",
      "Up to 15 participants",
      "Choice of 6 class formats",
      "In\u2011office or Zoom",
      "App access for all attendees",
    ],
    cta: "Book Starter",
  },
  {
    name: "Quarterly",
    tagline: "Most chosen",
    price: "From \u00a3100",
    priceNum: 100,
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
    price: "From \u00a3300",
    priceNum: 300,
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
    price: "\u00a3640",
    priceNum: 640,
    per: "per month",
    seats: "Free for your members",
    blurb: "We run one 60\u2011minute class a week at your space. Your members book through our app \u2014 no cost to them, no admin for you.",
    features: [
      "One 60\u2011min class each week",
      "We bring mats, props, teacher",
      "Members book in two taps",
      "Printed schedule for your lobby",
      "Cancel with 30 days\u2019 notice",
    ],
    cta: "Book a call",
  },
  {
    name: "Full programme",
    tagline: "Most co\u2011works choose this",
    price: "\u00a31,480",
    priceNum: 1480,
    per: "per month",
    seats: "Free for your members",
    blurb: "A proper weekly rhythm \u2014 morning yoga, lunchtime breath, Friday wind\u2011down. A genuine amenity your members feel.",
    features: [
      "2\u20113 classes per week",
      "Mix of yoga, breath & sound",
      "Co\u2011branded booking page",
      "Quarterly themed pop\u2011up",
      "Dedicated account manager",
    ],
    cta: "Book a call",
    featured: true,
  },
  {
    name: "One\u2011off",
    tagline: "Single event",
    price: "From \u00a3280",
    priceNum: 280,
    per: "per class",
    seats: "Up to 25 members",
    blurb: "A launch, a member evening, a Mental Health Week special. We\u2019ll run a single class \u2014 no subscription, no commitment.",
    features: [
      "60 or 75\u2011minute class",
      "Any format, any time",
      "Everything included",
      "Book as many as you like",
    ],
    cta: "Get a quote",
  },
];

async function handleSubscribe(planName: string, price: number) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "subscription",
      planName,
      items: [{ name: `Nine2Rise — ${planName}`, price }],
    }),
  });
  const { url } = await res.json();
  if (url) window.location.href = url;
}

export default function PricingPage() {
  const [audience, setAudience] = useState<"corporate" | "cowork">("corporate");
  const plans = audience === "corporate" ? corporatePlans : coworkPlans;

  return (
    <>
      {/* Hero */}
      <section className="pricing-hero">
        <div className="pricing-hero-inner">
          <div className="eyebrow">Pricing</div>

          <div className="pricing-tabs pricing-tabs-2" role="tablist">
            <button
              role="tab"
              aria-selected={audience === "corporate"}
              className={audience === "corporate" ? "active" : ""}
              onClick={() => setAudience("corporate")}
            >
              Employers
            </button>
            <button
              role="tab"
              aria-selected={audience === "cowork"}
              className={audience === "cowork" ? "active" : ""}
              onClick={() => setAudience("cowork")}
            >
              Co&#x2011;working
            </button>
            <div className="tabs-indicator-2" data-pos={audience}></div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="pricing-panel">
        <div className="pricing-cards">
          {plans.map((p, i) => (
            <div key={i} className={"pcard " + ((p as { featured?: boolean }).featured ? "pcard-featured" : "")}>
              {(p as { featured?: boolean }).featured && <div className="pcard-ribbon">{p.tagline}</div>}
              <div className="pcard-head">
                <div className="pcard-name">{p.name}</div>
                {!(p as { featured?: boolean }).featured && <div className="pcard-tag">{p.tagline}</div>}
              </div>
              <div className="pcard-price">
                <span className="v">{p.price}</span>
                <span className="p">{p.per}</span>
              </div>
              <div className="pcard-seats">{p.seats}</div>
              <p className="pcard-blurb">{p.blurb}</p>
              <div className="pcard-divider" />
              <ul className="pcard-list">
                {p.features.map((f, j) => (
                  <li key={j}>
                    <span className="tick"><Icon name="check" size={12} /></span> {f}
                  </li>
                ))}
              </ul>
              {audience === "corporate" && (p as { priceNum?: number }).priceNum ? (
                <button
                  className={"btn btn-lg " + ((p as { featured?: boolean }).featured ? "btn-sun" : "btn-ghost")}
                  style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
                  onClick={() => handleSubscribe(p.name, (p as { priceNum: number }).priceNum)}
                >
                  {p.cta} <Icon name="arrow-right" size={14} />
                </button>
              ) : (
                <Link
                  href="/contact"
                  className={"btn btn-lg " + ((p as { featured?: boolean }).featured ? "btn-sun" : "btn-ghost")}
                  style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
                >
                  {p.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {audience === "corporate" && (
          <div className="corp-addon">
            <div>
              <div className="section-eyebrow" style={{ color: "var(--teal)" }}>One&#x2011;off</div>
              <h3>A single event? <em>That works too.</em></h3>
              <p>Team offsites, Mental Health Awareness Week, the all&#x2011;hands that needs a soft landing. One&#x2011;off classes start at <strong>&pound;280</strong>.</p>
            </div>
            <Link href="/contact" className="btn btn-sun btn-lg">Get a quote <Icon name="arrow-right" size={14} /></Link>
          </div>
        )}
      </section>

      {/* What's always included */}
      <section className="pricing-included-wrap">
        <div className="pricing-included">
          <div className="split-head" style={{ marginBottom: 32 }}>
            <div>
              <div className="section-eyebrow">Included on every plan</div>
              <h2 className="section-h2">No <em>add&#x2011;ons.</em> No surprises.</h2>
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
              <p>Book into any class at your employer&apos;s office or your co&#x2011;working space, in two taps.</p>
            </div>
            <div className="incl">
              <div className="incl-num">03</div>
              <h4>Anonymous by default</h4>
              <p>Nobody at work &mdash; HR, managers, your employer&apos;s insurer &mdash; ever sees what you watched.</p>
            </div>
            <div className="incl">
              <div className="incl-num">04</div>
              <h4>Vetted teachers</h4>
              <p>Every teacher is Ubud&#x2011;trained, insured, interviewed. One in nine applicants make it onto the roster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pricing-faq-wrap">
        <div className="split-head" style={{ marginBottom: 24 }}>
          <div>
            <div className="section-eyebrow">Frequently asked questions</div>
            <h2 className="section-h2">Short answers. <em>No fine print.</em></h2>
          </div>
          <p className="section-lede">The long version is in our terms. If yours isn&apos;t here, email <a href="mailto:hello@nine2rise.com">hello@nine2rise.com</a>.</p>
        </div>
        <div className="faq">
          <details open>
            <summary>Do employees pay anything directly?</summary>
            <p>No. Nine2Rise is a business&#x2011;to&#x2011;business subscription. Your employer, your insurer, or your co&#x2011;working space pays us &mdash; your employees get access at no personal cost.</p>
          </details>
          <details>
            <summary>What&apos;s the minimum contract length?</summary>
            <p>One month. Cancel with seven days&apos; notice, no questions. Most clients stay for 18+ months; a handful have cancelled. Both are fine.</p>
          </details>
          <details>
            <summary>What happens if nobody turns up to a class?</summary>
            <p>The teacher still gets paid. We still learn something. We&apos;ll send a quiet note suggesting a format or time change &mdash; these adjustments are included in the Quarterly plan&apos;s review call.</p>
          </details>
          <details>
            <summary>Do we need a dedicated room?</summary>
            <p>Ideally yes &mdash; a quiet meeting room with the chairs stacked to the side. We bring 15 mats, blocks, straps and a Bluetooth speaker. If you&apos;re tight on space we can run shorter seated sessions at desks.</p>
          </details>
          <details>
            <summary>Can employees claim Nine2Rise through their health insurance?</summary>
            <p>No &mdash; they can&apos;t claim it directly. Access is arranged through the employer or health insurer, not the individual. If you&apos;re covered, your insurance provider will let you know as part of your plan&apos;s benefits.</p>
          </details>
          <details>
            <summary>Can we try a single class before subscribing?</summary>
            <p>Yes. A one&#x2011;off class is &pound;280 all&#x2011;in, anywhere in London zones 1&ndash;3. Credit it against your first three months if you subscribe within 30 days.</p>
          </details>
        </div>
      </section>

      {/* Final CTA */}
      <section className="app-cta">
        <div className="app-cta-inner">
          <div>
            <div className="section-eyebrow" style={{ color: "var(--sun)" }}>The next step</div>
            <p>We&apos;ll ask five questions about your team or your members. You&apos;ll leave with a clear sense of fit &mdash; ours and yours.</p>
            <div className="store-row">
              <Link href="/contact" className="btn btn-sun btn-lg">Book an intro call <Icon name="arrow-right" size={14} /></Link>
              <Link href="/individual" className="btn btn-ghost btn-lg" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>See the app first &rarr;</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
