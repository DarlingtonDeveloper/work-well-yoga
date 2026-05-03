"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";

const appFeatures = [
  { icon: "clock", t: "Live class timetable", d: "Every class your employer or co\u2011working space has booked this month \u2014 book your seat in two taps." },
  { icon: "play", t: "Recorded yoga classes", d: "A 120\u2011class library filmed in Ubud. Vinyasa, yin, restorative, desk flows. Downloadable for offline." },
  { icon: "brain", t: "Guided meditations", d: "Short and long. For anxious mornings, for the hour before sleep, for the twenty minutes between meetings." },
  { icon: "wave", t: "Guided breathwork", d: "Box breath, 4\u20117\u20118, physiological sigh, ocean breath. Timed, cued, no guesswork." },
  { icon: "moon", t: "Sound bowls & soundscapes", d: "Crystal bowls, binaural, rain on a tin roof. For focus, for sleep, for savasana at home." },
  { icon: "mail", t: "Wellbeing at work podcast", d: "Fortnightly, 25 minutes. Short essays on stress, posture, team rituals \u2014 from our teachers and guests." },
  { icon: "leaf", t: "Articles & reading", d: "A slow library of essays. Less doom\u2011scrolling, more \u2018something to read with your morning tea\u2019." },
  { icon: "heart", t: "Curated affiliate shop", d: "Mats, bolsters, books, candles \u2014 42 things we actually use. Honest commission disclosure on every item." },
];

export default function IndividualPage() {
  return (
    <>
      <section className="ind-hero">
        <div className="ind-hero-inner">
          <div className="eyebrow">For employees</div>
          <p>Nine2Rise is offered as a benefit \u2014 either directly by your employer, or through your private healthcare plan with Vitality, BUPA, AXA or Aetna. You get the full app, you attend the live classes your team books, and nobody at work sees what you practise or when.</p>
          <div className="ind-hero-ctas">
            <Link href="/download" className="btn btn-sun btn-lg">Get the app <Icon name="arrow-right" size={14} /></Link>
            <Link href="/pricing" className="btn btn-ghost btn-lg">See plans &rarr;</Link>
          </div>
        </div>
      </section>

      <section className="ind-features-wrap">
        <div className="ind-features">
          {appFeatures.map((f, i) => (
            <div key={i} className="ind-feat">
              <div className="if-icon"><Icon name={f.icon} size={22} /></div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="app-cta">
        <div className="app-cta-inner">
          <div>
            <div className="section-eyebrow" style={{ color: "var(--sun)" }}>Get started</div>
            <h2>If you already have access, <em>download the app.</em></h2>
            <p>If you don&apos;t, send us your employer&apos;s name and we&apos;ll reach out to them \u2014 quietly, no pressure, no mention of you.</p>
            <div className="store-row">
              <Link href="/download" className="btn btn-sun btn-lg">Download the app <Icon name="arrow-right" size={14} /></Link>
              <Link href="/contact" className="btn btn-ghost btn-lg" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>
                Nominate my employer &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
