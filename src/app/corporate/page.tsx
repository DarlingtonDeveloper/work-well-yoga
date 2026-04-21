"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

export default function CorporatePage() {
  const [selected, setSelected] = useState("quarterly");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      tagline: "One class a month",
      price: "From \u00a350",
      per: "per month",
      seats: "Up to 15 participants",
      desc: "A single 60\u2011minute wellness class delivered in your office or on Zoom. Yoga, guided meditation, breathwork or a sound bath \u2014 you choose the month before.",
      features: [
        "1 class per month",
        "Up to 15 participants",
        "In\u2011office or Zoom",
        "Choice of 6 class formats",
        "Teacher brings mats & props",
      ],
      cta: "Book Starter",
    },
    {
      id: "quarterly",
      name: "Quarterly",
      tagline: "Our most popular",
      price: "From \u00a3100",
      per: "per month",
      seats: "Up to 15 participants",
      desc: "Four classes a month \u2014 weekly rhythm. A dedicated teacher who learns your team\u2019s preferences, rotating formats so nobody gets bored.",
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
      price: "From \u00a3300",
      per: "per month",
      seats: "Up to 30 participants",
      desc: "Four classes a month for larger teams. Same dedicated teacher, double the seats \u2014 ideal for companies running two classes a fortnight across departments.",
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
    { icon: "brain", name: "Guided Meditation", blurb: "Sitting or lying down. For teams that don\u2019t want a mat." },
    { icon: "wave", name: "Breathwork", blurb: "Physiological sigh, box breath, 4\u20117\u20118. Deep reset." },
    { icon: "moon", name: "Sound Bath", blurb: "Crystal bowls. Dim the lights, close the meeting room door." },
    { icon: "flame", name: "Desk Mobility", blurb: "30 minutes at the desk. No changing clothes, no mats." },
    { icon: "heart", name: "Restorative Yin", blurb: "End of week, end of quarter. Long holds, bolsters in." },
  ];

  const howSteps = [
    { n: "01", t: "Intro call", d: "20 minutes. We learn about your office, your team\u2019s schedule, the mix of people on your payroll." },
    { n: "02", t: "Choose your plan", d: "Starter, Quarterly, or Full team. You can switch any month with seven days\u2019 notice." },
    { n: "03", t: "We match a teacher", d: "From a roster of 14 practitioners \u2014 each vetted on both teaching and the skill of not being weird in an office." },
    { n: "04", t: "First class, week one", d: "We bring everything. You provide a quiet room and a list of who\u2019s attending. We handle reminders." },
  ];

  return (
    <>
      {/* 1. Hero */}
      <section className="corp-hero">
        <div className="corp-hero-inner">
          <div className="eyebrow">For companies</div>
          <h1>Fewer sick days.<br />Less burnout.<br />Happier teams.</h1>
          <p className="corp-hero-sub">
            Work Well Yoga brings a dedicated yoga teacher to your office \u2014 or your Zoom \u2014 every week.
            No studio memberships. No scheduling faff. Just a class your team actually looks forward to.
          </p>
          <div className="corp-hero-ctas">
            <Link href="/contact" className="btn btn-sun btn-lg">
              Book an intro call <Icon name="arrow-right" size={14} />
            </Link>
            <Link href="/individual" className="btn btn-ghost btn-lg">
              For employees &rarr;
            </Link>
          </div>
          <div className="corp-stats">
            <div className="corp-stat">
              <span className="corp-stat-n">14</span>
              <span className="corp-stat-l">teachers on our roster</span>
            </div>
            <div className="corp-stat">
              <span className="corp-stat-n">3 yrs</span>
              <span className="corp-stat-l">average client relationship</span>
            </div>
            <div className="corp-stat">
              <span className="corp-stat-n">91%</span>
              <span className="corp-stat-l">of classes attended voluntarily</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The quiet problem */}
      <section className="corp-problem">
        <div className="corp-problem-inner">
          <div className="section-eyebrow">The quiet problem</div>
          <h2>Your team is stressed. Nobody&apos;s saying it out loud.</h2>
          <p className="corp-problem-intro">
            Presenteeism costs UK employers \u00a328.9bn a year. Most of it isn&apos;t people calling in sick \u2014
            it&apos;s people sitting at their desks, running on empty, making worse decisions and resenting
            the job a little more each quarter.
          </p>
          <div className="corp-barriers">
            <div className="corp-barrier">
              <div className="corp-barrier-q">&ldquo;We tried a gym benefit. Nobody used it.&rdquo;</div>
              <div className="corp-barrier-a">
                <span className="corp-barrier-label">Our answer</span>
                <p>
                  A gym requires someone to want to go. A class that happens in the building, at lunchtime,
                  every Tuesday, removes the decision entirely. Attendance averages 78% after the first month.
                </p>
              </div>
            </div>
            <div className="corp-barrier">
              <div className="corp-barrier-q">&ldquo;We&apos;re not that kind of company.&rdquo;</div>
              <div className="corp-barrier-a">
                <span className="corp-barrier-label">Our answer</span>
                <p>
                  We&apos;ve run classes for construction firms, law offices, and a 12\u2011person fintech with no
                  natural light. The format adapts. Nobody has to be &lsquo;a yoga person&rsquo;.
                </p>
              </div>
            </div>
            <div className="corp-barrier">
              <div className="corp-barrier-q">&ldquo;We don&apos;t have the budget.&rdquo;</div>
              <div className="corp-barrier-a">
                <span className="corp-barrier-label">Our answer</span>
                <p>
                  One class a month starts at &pound;50. Most private healthcare plans cover it in full.
                  We&apos;ll send you the insurer codes so your finance team can sign it off today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Plans */}
      <section className="corp-plans">
        <div className="corp-plans-inner">
          <div className="section-eyebrow">Pricing</div>
          <h2>Simple plans. No annual lock\u2011in.</h2>
          <p className="corp-plans-sub">
            Switch or cancel with seven days&apos; notice. We&apos;d rather keep you because you love it.
          </p>
          <div className="corp-plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`corp-plan${plan.featured ? " corp-plan--featured" : ""}${selected === plan.id ? " corp-plan--selected" : ""}`}
                onClick={() => setSelected(plan.id)}
              >
                {plan.featured && <div className="corp-plan-badge">Most popular</div>}
                <div className="corp-plan-name">{plan.name}</div>
                <div className="corp-plan-tagline">{plan.tagline}</div>
                <div className="corp-plan-price">
                  <span className="corp-plan-price-n">{plan.price}</span>
                  <span className="corp-plan-price-per">{plan.per}</span>
                </div>
                <div className="corp-plan-seats">{plan.seats}</div>
                <p className="corp-plan-desc">{plan.desc}</p>
                <ul className="corp-plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>
                      <Icon name="check" size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`btn btn-lg${plan.featured ? " btn-sun" : " btn-outline"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {plan.cta} <Icon name="arrow-right" size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. One-off events add-on */}
      <section className="corp-addon">
        <div className="corp-addon-inner">
          <div className="section-eyebrow">Add\u2011on</div>
          <h2>One\u2011off events & away days.</h2>
          <p>
            Team away day, end\u2011of\u2011quarter celebration, wellbeing week. We run bespoke half\u2011day and
            full\u2011day wellness experiences for groups of up to 60. Sound baths, yoga, breathwork,
            and a closing meditation \u2014 or any combination you want.
          </p>
          <div className="corp-addon-ctas">
            <Link href="/contact" className="btn btn-sun btn-lg">
              Enquire about an event <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          <div className="corp-addon-formats">
            {formats.map((f, i) => (
              <div key={i} className="corp-format">
                <div className="corp-format-icon">
                  <Icon name={f.icon} size={20} />
                </div>
                <div className="corp-format-body">
                  <div className="corp-format-name">{f.name}</div>
                  <div className="corp-format-blurb">{f.blurb}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Co-working */}
      <section className="corp-cowork">
        <div className="corp-cowork-inner">
          <div className="section-eyebrow">Co\u2011working spaces</div>
          <h2>Run a workspace? Let&apos;s talk.</h2>
          <p>
            We partner with co\u2011working spaces, serviced office buildings, and innovation hubs to offer
            weekly classes as a resident benefit. Your members get a class. You get a reason to renew.
            We handle everything from booking to billing.
          </p>
          <div className="corp-cowork-points">
            <div className="corp-cowork-point">
              <Icon name="check" size={16} />
              <span>White\u2011labelled to your brand if preferred</span>
            </div>
            <div className="corp-cowork-point">
              <Icon name="check" size={16} />
              <span>Per\u2011member pricing available for large buildings</span>
            </div>
            <div className="corp-cowork-point">
              <Icon name="check" size={16} />
              <span>We manage teacher scheduling, subs & reminders</span>
            </div>
          </div>
          <Link href="/contact" className="btn btn-sun btn-lg">
            Talk to us about your space <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </section>

      {/* 6. How it works */}
      <section className="corp-how">
        <div className="corp-how-inner">
          <div className="section-eyebrow">How it works</div>
          <h2>Four steps. Three weeks.</h2>
          <p className="corp-how-sub">
            From first email to first class, most companies are up and running within three weeks.
          </p>
          <div className="corp-how-steps">
            {howSteps.map((s, i) => (
              <div key={i} className="corp-how-step">
                <div className="corp-how-n">{s.n}</div>
                <div className="corp-how-body">
                  <div className="corp-how-title">{s.t}</div>
                  <div className="corp-how-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="corp-how-cta">
            <Link href="/contact" className="btn btn-sun btn-lg">
              Start with an intro call <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Insurance */}
      <section className="corp-insurance">
        <div className="corp-insurance-inner">
          <div className="section-eyebrow">Healthcare</div>
          <h2>Through your company, or your healthcare plan.</h2>
          <p>
            Work Well Yoga is recognised by Vitality, BUPA, AXA Health, and Aetna as an eligible
            wellbeing benefit. Most Quarterly and Full team plans are covered in full under corporate
            healthcare policies. We&apos;ll send your HR team everything they need to claim.
          </p>
          <div className="corp-insurance-logos">
            <span className="corp-insurer">Vitality</span>
            <span className="corp-insurer">BUPA</span>
            <span className="corp-insurer">AXA Health</span>
            <span className="corp-insurer">Aetna</span>
          </div>
          <p className="corp-insurance-note">
            Not sure if you&apos;re covered? Send us your policy number and we&apos;ll check for you \u2014
            no commitment needed.
          </p>
          <div className="corp-insurance-ctas">
            <Link href="/contact" className="btn btn-sun btn-lg">
              Check my cover <Icon name="arrow-right" size={14} />
            </Link>
            <Link href="/individual" className="btn btn-ghost btn-lg">
              For individual employees &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
