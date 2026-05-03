"use client";

import Link from "next/link";
import { Icon } from "./icons";

export function SplitSection() {
  return (
    <section className="split">
      <div className="split-head">
        <div>
          <div className="section-eyebrow">How to get signed up</div>
          <h2 className="section-h2">
            Start where <em>you</em> are.
          </h2>
        </div>
        <p className="section-lede">
          Nine2Rise lives in the space between the cubicle and the cushion. Come as a person.
          Bring your team later if you want.
        </p>
      </div>
      <div className="split-cards">
        <Link href="/individual" className="split-card individual">
          <div className="chip" style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}>
            For you
          </div>
          <h3>
            <em>I&apos;m here</em> for myself.
          </h3>
          <p>
            Ten minutes before the 9am. A long exhale after the kids are asleep. A practice that
            doesn&apos;t ask you to become anyone new.
          </p>
          <div className="spacer" />
          <div className="card-foot">
            <div className="foot-list">
              <span>&middot; Anxiety</span>
              <span>&middot; Sleep</span>
              <span>&middot; Back</span>
              <span>&middot; Burnout</span>
            </div>
            <div className="arrow">
              <Icon name="arrow-up-right" size={18} />
            </div>
          </div>
          <svg className="bg-deco" width="220" height="220" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" stroke="#fff" fill="none" strokeWidth="0.3" />
            <circle cx="20" cy="20" r="14" stroke="#fff" fill="none" strokeWidth="0.3" />
            <circle cx="20" cy="20" r="10" stroke="#fff" fill="none" strokeWidth="0.3" />
          </svg>
        </Link>
        <Link href="/corporate" className="split-card corporate">
          <div className="chip">For teams</div>
          <h3>
            We bring <em>calm</em> to your company.
          </h3>
          <p>
            Live weekly flows, in&#x2011;office workshops, and a private app for your people. No
            &ldquo;wellness Slack channel&rdquo; required.
          </p>
          <div className="spacer" />
          <div className="card-foot">
            <div className="foot-list" style={{ color: "var(--ink-3)" }}>
              <span>From &pound;6/employee/mo</span>
            </div>
            <div className="arrow">
              <Icon name="arrow-up-right" size={18} />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

export function Struggles() {
  const items = [
    { icon: "brain", label: "Anxious mornings", tag: "Guided by <strong>Ketut</strong>" },
    { icon: "moon", label: "Wired at 11 pm", tag: "<strong>Yin</strong> & breath" },
    { icon: "flame", label: "Lower\u2011back ache", tag: "<strong>8 min</strong> desk flow" },
    { icon: "wave", label: "Screen fatigue", tag: "Eyes + <strong>nervous system</strong>" },
    { icon: "heart", label: "Low\u2011energy afternoons", tag: "<strong>Pranayama</strong>" },
    { icon: "anchor", label: "Decision fatigue", tag: "<strong>Stillness</strong> practice" },
    { icon: "leaf", label: "Starting from scratch", tag: "<strong>Beginner</strong> path" },
    { icon: "spark", label: "Grief, quietly", tag: "Held by <strong>Ayu</strong>" },
  ];
  return (
    <section className="struggles">
      <div className="struggles-inner">
        <div className="split-head" style={{ marginBottom: 0 }}>
          <div>
            <div className="section-eyebrow">Services offered</div>
            <h2 className="section-h2">
              Find the class that <em>fits today.</em>
            </h2>
          </div>
          <p className="section-lede">
            Pick whatever is true today. We&apos;ll meet it with a short, specific practice &mdash;
            either a live class at your office or co&#x2011;working space, or a guided session in the
            app. Most are under 12 minutes, though some go up to 90 minutes.
          </p>
        </div>
        <div className="struggles-modes">
          <span className="sm-chip sm-chip-live">
            <span className="sm-dot"></span> Live, in person &middot; weekly at your workplace
          </span>
          <span className="sm-chip sm-chip-app">
            <span className="sm-dot"></span> In the app &middot; guided recordings, breathwork &amp;
            sound
          </span>
        </div>
        <div className="why-grid">
          <Link href="/individual" className="why-col why-employee">
            <div className="why-lbl">
              For employees{" "}
              <span aria-hidden="true" style={{ opacity: 0.55, marginLeft: 6 }}>
                &rarr;
              </span>
            </div>
          </Link>
          <Link href="/corporate" className="why-col why-employee">
            <div className="why-lbl">
              For employers{" "}
              <span aria-hidden="true" style={{ opacity: 0.55, marginLeft: 6 }}>
                &rarr;
              </span>
            </div>
          </Link>
        </div>
        <div className="struggles-grid">
          {items.map((s, i) => (
            <div key={i} className="struggle">
              <Icon name={s.icon} className="ico" size={28} />
              <div className="label">{s.label}</div>
              <div className="tag" dangerouslySetInnerHTML={{ __html: s.tag }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PhonePreview() {
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="phone-statbar">
          <span>9:41</span>
          <span>&bull;&bull;&bull;</span>
        </div>
        <div className="phone-body">
          <div className="phone-hello">good morning,</div>
          <div className="phone-name">Maya</div>
          <div className="phone-card">
            <div className="label">Today for you</div>
            <div className="title">Unclench the jaw, open the chest</div>
            <div className="meta">
              <span>12 min &middot; Ketut</span>
              <span>&#9654;</span>
            </div>
          </div>
          <div className="phone-tile">
            <div className="t-dot" />
            <div>
              <div className="t-title">This week&apos;s timetable</div>
              <div>6 live classes available</div>
            </div>
            <div className="t-time">&rarr;</div>
          </div>
          <div className="phone-tile">
            <div className="t-dot" style={{ background: "#E9B93D" }} />
            <div>
              <div className="t-title">Wind&#x2011;down yin</div>
              <div>Before sleep</div>
            </div>
            <div className="t-time">18m</div>
          </div>
          <div className="phone-tile">
            <div className="t-dot" />
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

export function HowItWorks() {
  return (
    <section className="how">
      <div className="how-grid">
        <div className="how-phone">
          <PhonePreview />
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">i.</div>
            <div>
              <h3 className="step-title">Tell us what&apos;s loud today.</h3>
              <p className="step-body">
                Anxious? Achy? Wired? Three taps and we stop guessing. The app learns your weather,
                not just your goals.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">ii.</div>
            <div>
              <h3 className="step-title">Get one short practice.</h3>
              <p className="step-body">
                Under twelve minutes, filmed in global locations with teachers who actually know your
                name by week two.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">iii.</div>
            <div>
              <h3 className="step-title">Notice what shifts.</h3>
              <p className="step-body">
                Over weeks, you&apos;ll see the knots loosen &mdash; quietly, then all at once.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AppCTA() {
  return (
    <section className="app-cta">
      <div className="app-cta-inner">
        <div>
          <div className="section-eyebrow" style={{ color: "var(--sun)" }}>
            The app
          </div>
          <h2>
            A small green room <em>in your pocket.</em>
          </h2>
          <p>
            One practice a day. Teachers in Ubud. Learning that gets quieter the longer you use it.
            Free for seven days &mdash; no card, no catch.
          </p>
          <div className="store-row">
            <Link href="/download" className="store-btn">
              <Icon name="apple" size={26} />
              <span>
                <span className="s-mini">DOWNLOAD ON</span>
                <span className="s-name">App Store</span>
              </span>
            </Link>
            <Link href="/download" className="store-btn">
              <Icon name="play-store" size={26} />
              <span>
                <span className="s-mini">GET IT ON</span>
                <span className="s-name">Google Play</span>
              </span>
            </Link>
          </div>
        </div>
        <div className="app-cta-right">
          <PhonePreview />
        </div>
      </div>
    </section>
  );
}
