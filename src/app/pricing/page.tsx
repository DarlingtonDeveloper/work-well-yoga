"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

type Audience = "corporate" | "cowork";

const corporatePlans = [
  {
    name: "Starter",
    tagline: "One class per month",
    price: "From £50",
    per: "per month",
    seats: "Up to 15 participants",
    blurb:
      "One live class a month, delivered to your team wherever they are. Low commitment, zero faff. Perfect for trying us out or keeping a small team ticking over.",
    features: [
      "1 live class per month",
      "Up to 15 participants per class",
      "Full app access for all participants",
      "120-class on-demand library",
      "Guided meditations & breathwork",
      "Scheduling & booking handled for you",
      "Vetted, insured teacher",
      "Anonymous attendance — no HR data shared",
    ],
    cta: "Book Starter",
    featured: false,
  },
  {
    name: "Quarterly",
    tagline: "Most chosen",
    price: "From £100",
    per: "per month",
    seats: "Up to 15 participants",
    blurb:
      "Weekly classes across a quarter — enough regularity to build a real practice. This is what most teams start with and stick with. Billed per quarter for simplicity.",
    features: [
      "1 live class per week (4–5/mo)",
      "Up to 15 participants per class",
      "Full app access for all participants",
      "120-class on-demand library",
      "Guided meditations & breathwork",
      "Scheduling & booking handled for you",
      "Vetted, insured teacher",
      "Anonymous attendance — no HR data shared",
      "Quarterly wellbeing report for HR",
      "Priority teacher matching",
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
    blurb:
      "For larger teams or organisations that want more. Two classes a week, up to thirty seats, a dedicated teacher who learns your team. As close to an in-house programme as you get without the overhead.",
    features: [
      "2 live classes per week (8–10/mo)",
      "Up to 30 participants per class",
      "Full app access for all participants",
      "120-class on-demand library",
      "Guided meditations & breathwork",
      "Scheduling & booking handled for you",
      "Dedicated vetted, insured teacher",
      "Anonymous attendance — no HR data shared",
      "Monthly wellbeing report for HR",
      "Priority teacher matching",
      "Custom class themes on request",
    ],
    cta: "Book Full team",
    featured: false,
  },
];

const coworkPlans = [
  {
    name: "Weekly class",
    tagline: "One class a week",
    price: "£640",
    per: "per month",
    seats: "Free for your members",
    blurb:
      "One live yoga class a week, bookable by your members through the Work Well app. A tangible perk that brings people back to your space. No admin for you — just a recurring class on the calendar.",
    features: [
      "4–5 live classes per month",
      "Up to 25 members per class",
      "Free app access for all your members",
      "120-class on-demand library included",
      "Guided meditations & breathwork",
      "Booking & scheduling fully managed",
      "Vetted, insured teacher",
      "Listed on the Work Well co-work map",
    ],
    cta: "Book a call",
    featured: false,
  },
  {
    name: "Full programme",
    tagline: "Most co-works choose this",
    price: "£1,480",
    per: "per month",
    seats: "Free for your members",
    blurb:
      "Three classes a week plus a monthly workshop — yoga, meditation, or breathwork. A proper wellness offering that sets your space apart. Members get everything in the app as part of their membership.",
    features: [
      "3 live classes per week (12–15/mo)",
      "Monthly workshop (yoga, meditation, or breathwork)",
      "Up to 25 members per class",
      "Free app access for all your members",
      "120-class on-demand library included",
      "Guided meditations & breathwork",
      "Booking & scheduling fully managed",
      "Dedicated vetted, insured teacher",
      "Listed on the Work Well co-work map",
      "Co-branded welcome email for new members",
      "Monthly attendance summary",
    ],
    cta: "Book a call",
    featured: true,
  },
  {
    name: "One-off",
    tagline: "Single event",
    price: "From £280",
    per: "per class",
    seats: "Up to 25 members",
    blurb:
      "A single class for a special occasion — a new-member welcome, an end-of-quarter wind-down, a community morning. No commitment, no subscription. Just a great class.",
    features: [
      "One live class",
      "Up to 25 participants",
      "Choice of yoga, meditation, or breathwork",
      "Vetted, insured teacher",
      "Booking & logistics handled",
      "Optional: add a 30-min Q&A with the teacher",
    ],
    cta: "Get a quote",
    featured: false,
  },
];

const includedItems = [
  {
    icon: "play",
    title: "Full app library",
    desc: "Every participant gets access to 120+ on-demand classes — vinyasa, yin, restorative, desk flows — plus guided meditations, breathwork, and sound sessions.",
  },
  {
    icon: "clock",
    title: "Live bookings",
    desc: "Classes are added to the Work Well app timetable. Participants book their own seat in two taps. You never need to manage a sign-up sheet.",
  },
  {
    icon: "anchor",
    title: "Anonymous by default",
    desc: "Attendance data is aggregated and never tied to named individuals. HR gets a headcount, not a list of who came to the Wednesday lunchtime session.",
  },
  {
    icon: "spark",
    title: "Vetted teachers",
    desc: "Every teacher is Yoga Alliance accredited, DBS checked, and fully insured. We interview them, shadow their classes, and only list teachers we'd send our own families to.",
  },
];

const faqs = [
  {
    q: "How does the live class work technically?",
    a: "Classes run over a dedicated video link sent through the Work Well app. Participants join from their desk, home, or anywhere with a wi-fi connection. No extra software required — the link opens in any browser. We recommend at least a 2m × 2m clear space, but most desk flows work in a standard office chair.",
  },
  {
    q: "What if our team can't all make the same time?",
    a: "We schedule classes in collaboration with you — mornings, lunchtimes, or end-of-day. If you have a distributed or shift-based team, we can set up two sessions of the same class. All participants also have full access to the on-demand library, so anyone who misses the live class can catch a recorded one any time.",
  },
  {
    q: "Do you offer in-person classes?",
    a: "Not as a standard plan — our model is built around remote-first delivery. That said, if you're looking for an in-person session as a one-off event (for a team day or offsite, for instance), get in touch and we'll see what we can arrange.",
  },
  {
    q: "Can we change our plan later?",
    a: "Yes. Plans run on a rolling basis after any minimum term. You can upgrade, downgrade, or pause with 30 days' notice. We'd rather keep you on a plan that works than lock you into something that doesn't.",
  },
  {
    q: "Is there a minimum contract length?",
    a: "The Quarterly plan is billed per quarter — so three months minimum. The Starter and Full team plans roll monthly after an initial two-month period. One-off sessions have no ongoing commitment.",
  },
  {
    q: "What do you mean by 'anonymous by default'?",
    a: "We don't collect individual attendance records linked to employee names or IDs. The booking system knows a seat is taken — it doesn't know whose seat it is. Aggregated participation numbers (e.g. '11 people attended this month') are shared with the HR contact for reporting purposes only.",
  },
];

export default function PricingPage() {
  const [audience, setAudience] = useState<Audience>("corporate");

  return (
    <>
      {/* Hero + tabs */}
      <section className="pricing-hero">
        <div className="pricing-hero-inner">
          <div className="section-eyebrow">Pricing</div>
          <h1 className="section-h2">
            Straightforward plans.<br />
            <em>No per-seat spreadsheets.</em>
          </h1>
          <p className="section-lede">
            Pick a plan, book a teacher, and your team is doing yoga next week.
            Every plan includes the full app — live classes, on-demand library, meditations, and breathwork.
          </p>

          {/* Tabs */}
          <div className="pricing-tabs pricing-tabs-2">
            <button
              className={audience === "corporate" ? "active" : ""}
              onClick={() => setAudience("corporate")}
            >
              Employers
            </button>
            <button
              className={audience === "cowork" ? "active" : ""}
              onClick={() => setAudience("cowork")}
            >
              Co-working spaces
            </button>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pricing-panel">
        <div className="pricing-cards">
          {(audience === "corporate" ? corporatePlans : coworkPlans).map((plan) => (
            <div
              key={plan.name}
              className={`pcard${plan.featured ? " pcard-featured" : ""}`}
            >
              {plan.featured && (
                <div className="pcard-ribbon">Most chosen</div>
              )}
              <div className="pcard-head">
                <div className="pcard-name">{plan.name}</div>
                <div className="pcard-tag">{plan.tagline}</div>
                <div className="pcard-price">
                  {plan.price}
                  <span className="pcard-per"> / {plan.per}</span>
                </div>
                <div className="pcard-seats">{plan.seats}</div>
              </div>
              <p className="pcard-blurb">{plan.blurb}</p>
              <hr className="pcard-divider" />
              <ul className="pcard-list">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <Icon name="check" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={`btn btn-lg${plan.featured ? " btn-sun" : " btn-outline"}`}
              >
                {plan.cta} <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Corp add-on: one-off events */}
      {audience === "corporate" && (
        <section className="corp-addon">
          <div className="split-head">
            <div>
              <div className="section-eyebrow">Add-on</div>
              <h2 className="section-h2">One-off events</h2>
            </div>
            <p className="section-lede">
              Need something for a team day, away-day, or end-of-year celebration?
              A single class or workshop — yoga, meditation, or breathwork — can be booked
              as a standalone event with no ongoing commitment. From&nbsp;£280 for up to
              25 participants.
            </p>
          </div>
          <div style={{ marginTop: "2rem" }}>
            <Link href="/contact" className="btn btn-sun btn-lg">
              Enquire about an event <Icon name="arrow-right" size={14} />
            </Link>
            <Link href="/corporate" className="btn btn-ghost btn-lg" style={{ marginLeft: "1rem" }}>
              More about corporate &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* Included on every plan */}
      <section className="pricing-included-wrap">
        <div className="pricing-included">
          <div className="section-eyebrow">What&apos;s included</div>
          <h2 className="section-h2">
            Included on <em>every plan</em>
          </h2>
          <div className="included-grid">
            {includedItems.map((item, i) => (
              <div key={i} className="incl">
                <div className="incl-icon">
                  <Icon name={item.icon} size={22} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pricing-faq-wrap">
        <div className="faq">
          <div className="section-eyebrow">Questions</div>
          <h2 className="section-h2">Frequently asked</h2>
          <div className="faq-list">
            {faqs.map((item, i) => (
              <details key={i}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p style={{ marginTop: "2.5rem" }}>
            Something else on your mind?{" "}
            <Link href="/contact">Get in touch</Link> — we reply the same day.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="app-cta">
        <div className="app-cta-inner">
          <div>
            <div className="section-eyebrow" style={{ color: "var(--sun)" }}>
              Get started
            </div>
            <h2>
              Ready to bring yoga <em>to your team?</em>
            </h2>
            <p>
              Most plans are up and running within a week. Tell us a bit about your team
              and we&apos;ll match you with the right teacher and schedule.
            </p>
            <div className="store-row">
              <Link href="/contact" className="btn btn-sun btn-lg">
                Book a call <Icon name="arrow-right" size={14} />
              </Link>
              <Link
                href="/individual"
                className="btn btn-ghost btn-lg"
                style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
              >
                I&apos;m an individual &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
