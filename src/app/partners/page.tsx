"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";

export default function PartnersPage() {
  return (
    <>
      {/* ============================================================
          1. HERO
      ============================================================ */}
      <section className="partners-hero">
        <div className="partners-hero-inner">
          <div className="partners-hero-copy">
            <div className="eyebrow">Teach with us</div>
            <h1>
              Pay that <em>respects your training.</em>
            </h1>
            <p className="lede">
              We work with a small number of exceptional teachers — corporate
              clients, proper pay, and a team that won&apos;t waste your time.
              If that sounds right, read on.
            </p>

            <div className="partners-hero-stats">
              <div className="ph-stat">
                <strong>1 in 9</strong>
                <small>applicants offered a trial class</small>
              </div>
              <div className="ph-stat">
                <strong>£60–95</strong>
                <small>per class, depending on client</small>
              </div>
              <div className="ph-stat">
                <strong>120+</strong>
                <small>teachers in our network</small>
              </div>
              <div className="ph-stat">
                <strong>48 hr</strong>
                <small>response to every application</small>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 36 }}>
              <Link href="/contact" className="btn btn-sun btn-lg">
                Apply now <Icon name="arrow-right" size={14} />
              </Link>
              <a href="#partners-process" className="btn btn-ghost btn-lg">
                How it works &rarr;
              </a>
            </div>
          </div>

          {/* Right-hand visual: schedule card + quote card */}
          <div className="partners-hero-frame">
            <div className="ph-card ph-card-1">
              <div className="ph-card-head">
                <span className="ph-dot" style={{ background: "var(--teal)" }} />
                This week&apos;s schedule
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
                  <div className="ph-place">Huckletree · Oxford Circus</div>
                </div>
                <div className="ph-fee">£80</div>
              </div>

              <div className="ph-row">
                <div>
                  <div className="ph-time">Thu 17:30</div>
                  <div className="ph-place">Kings Cross · Google Campus</div>
                </div>
                <div className="ph-fee">£95</div>
              </div>

              <div className="ph-foot">
                <span>3 classes this week</span>
                <strong>£250</strong>
              </div>
            </div>

            <div className="ph-card ph-card-2">
              <p className="ph-q">
                &ldquo;I teach three mornings a week and earn more than I did
                doing six classes at a studio. The clients actually show up.&rdquo;
              </p>
              <div className="ph-attrib">Amara · Vinyasa &amp; yin · 2 years</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. WHAT WE LOOK FOR
      ============================================================ */}
      <section className="partners-look-wrap">
        <div className="section-eyebrow">What we look for</div>
        <h2 className="section-h2" style={{ marginTop: 14 }}>
          We&apos;d rather turn you down than{" "}
          <em>set you up to fail.</em>
        </h2>
        <p className="section-lede" style={{ marginTop: 14, marginBottom: 0 }}>
          Our clients are paying for consistency and quality. These four things
          aren&apos;t negotiable — everything else we can work with.
        </p>

        <div className="look-grid">
          <div className="look-card">
            <div className="look-n">i.</div>
            <h3>Trained somewhere real</h3>
            <p>
              200-hour minimum from a recognised school. We don&apos;t mind where
              — Mysore, Bali, London, online — as long as the hours were genuine
              and you can talk about what you learned.
            </p>
          </div>

          <div className="look-card">
            <div className="look-n">ii.</div>
            <h3>Three years of teaching</h3>
            <p>
              Not three years since you qualified — three years of regularly
              standing in front of rooms. Corporate clients are busy, stressed,
              and not always gracious. Experience helps.
            </p>
          </div>

          <div className="look-card">
            <div className="look-n">iii.</div>
            <h3>Insured and safeguarded</h3>
            <p>
              Current public liability insurance and up-to-date safeguarding
              training. We&apos;ll check both. If yours has lapsed we can point
              you toward renewal, but you&apos;ll need them in place before your
              trial class.
            </p>
          </div>

          <div className="look-card">
            <div className="look-n">iv.</div>
            <h3>Comfortable with corporate rooms</h3>
            <p>
              A boardroom cleared of chairs at 8am is not a yoga studio.
              If you can hold the energy of a room full of people who&apos;d
              rather be somewhere else, you&apos;ll do fine here.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. FORMATS
      ============================================================ */}
      <section className="partners-formats-wrap">
        <div className="partners-formats">
          <div className="eyebrow">Class formats</div>
          <h2>
            Eight formats.{" "}
            <em>Pick two or three.</em>
          </h2>
          <p className="section-lede">
            We don&apos;t expect you to teach everything. Most of our teachers
            cover two or three formats well. Depth beats breadth every time.
          </p>

          <div className="format-chips">
            <span className="format-chip">Hatha</span>
            <span className="format-chip">Vinyasa</span>
            <span className="format-chip">Yin</span>
            <span className="format-chip">Restorative</span>
            <span className="format-chip">Chair yoga</span>
            <span className="format-chip">Breathwork</span>
            <span className="format-chip">Sound</span>
            <span className="format-chip">Pregnancy</span>
          </div>

          <p className="format-note">
            Chair yoga and breathwork are in highest demand right now — if those
            are in your repertoire, mention them prominently in your application.
          </p>
        </div>
      </section>

      {/* ============================================================
          4. PROCESS
      ============================================================ */}
      <section className="partners-process-wrap" id="partners-process">
        <div className="section-eyebrow">The process</div>
        <h2 className="section-h2" style={{ marginTop: 14 }}>
          Four weeks, <em>four steps.</em>
        </h2>
        <p className="section-lede" style={{ marginTop: 14 }}>
          We keep it short. If we&apos;re not a good fit, we&apos;ll tell you
          honestly and quickly.
        </p>

        <div className="process-list">
          <div className="process-row">
            <div className="process-n">01</div>
            <div className="process-body">
              <div className="process-head">
                <h3>Application</h3>
                <span className="process-t">15 minutes</span>
              </div>
              <p>
                A short form: your training, your formats, a link to a recent
                class or short video. No essay. No lengthy portfolio. We read
                every one and reply within 48 hours.
              </p>
            </div>
          </div>

          <div className="process-row">
            <div className="process-n">02</div>
            <div className="process-body">
              <div className="process-head">
                <h3>First conversation</h3>
                <span className="process-t">Week 1</span>
              </div>
              <p>
                A 20-minute call — not an interview, more of a two-way
                conversation. We&apos;ll tell you about our clients, schedules,
                and pay. You&apos;ll tell us what you want from the partnership.
                If it makes sense we book the trial.
              </p>
            </div>
          </div>

          <div className="process-row">
            <div className="process-n">03</div>
            <div className="process-body">
              <div className="process-head">
                <h3>Trial class</h3>
                <span className="process-t">Week 2–3</span>
              </div>
              <p>
                You teach a real class at a real client site. We don&apos;t observe
                over your shoulder — we collect anonymous feedback from attendees.
                You get paid at full rate regardless of outcome.
              </p>
            </div>
          </div>

          <div className="process-row">
            <div className="process-n">04</div>
            <div className="process-body">
              <div className="process-head">
                <h3>Onboarding</h3>
                <span className="process-t">Week 4</span>
              </div>
              <p>
                If the feedback is strong and you&apos;d like to continue, we
                agree your schedule, set up invoicing, and introduce you to your
                client contacts. From here you&apos;re in the network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. PAY
      ============================================================ */}
      <section className="partners-pay-wrap">
        <div className="partners-pay">
          <div className="pay-left">
            <div className="eyebrow">Pay &amp; terms</div>
            <h2 className="section-h2">
              The boring bit, in <em>plain English.</em>
            </h2>
            <p style={{ marginTop: 16, fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: "38ch" }}>
              No hidden deductions. No platform fees. No nonsense about
              &ldquo;exposure&rdquo;.
            </p>
          </div>

          <div className="pay-right">
            <div className="pay-row">
              <div className="pay-k">Rate per class</div>
              <div className="pay-v">
                £60 <span className="pay-to">→</span> £95
              </div>
              <div className="pay-note">
                Rate is set by client size and class length. You&apos;ll know the
                rate before you confirm any booking.
              </div>
            </div>

            <div className="pay-row">
              <div className="pay-k">Travel</div>
              <div className="pay-v">TfL + £8</div>
              <div className="pay-note">
                We reimburse your actual TfL fare plus a fixed £8 for your time.
                No receipts needed for zones 1–4.
              </div>
            </div>

            <div className="pay-row">
              <div className="pay-k">Late cancellation</div>
              <div className="pay-v">Full pay</div>
              <div className="pay-note">
                If a client cancels within 48 hours you receive your full class
                fee. We absorb that cost, not you.
              </div>
            </div>

            <div className="pay-row">
              <div className="pay-k">Payment</div>
              <div className="pay-v">7 days</div>
              <div className="pay-note">
                Invoice us after each class, paid within 7 days. No 30-day waits,
                no chasing. If it&apos;s late, message us directly.
              </div>
            </div>

            <div className="pay-row">
              <div className="pay-k">Equipment</div>
              <div className="pay-v">Provided</div>
              <div className="pay-note">
                Mats, blocks, and straps are kept on-site at every client
                location. You bring yourself.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. TEACHER VOICES
      ============================================================ */}
      <section className="partners-voices-wrap">
        <div className="section-eyebrow">From the network</div>
        <h2 className="section-h2" style={{ marginTop: 14, marginBottom: 48 }}>
          In their <em>own words.</em>
        </h2>

        <div className="voices-grid">
          <figure className="voice">
            <blockquote>
              &ldquo;I was nervous about corporate clients — I thought they&apos;d
              be distracted or dismissive. It&apos;s the opposite. These people
              are desperate for a pause in their day. They show up properly.&rdquo;
            </blockquote>
            <figcaption>
              <div className="voice-name">Nadia O.</div>
              <div className="voice-meta">Vinyasa, sound &middot; 2 years in the network</div>
            </figcaption>
          </figure>

          <figure className="voice">
            <blockquote>
              &ldquo;The admin is genuinely zero. I teach, I invoice, I get paid
              in a week. After years of chasing studios for money, this felt
              almost too good to be true.&rdquo;
            </blockquote>
            <figcaption>
              <div className="voice-name">Dev M.</div>
              <div className="voice-meta">Hatha, restorative &middot; 18 months in the network</div>
            </figcaption>
          </figure>

          <figure className="voice">
            <blockquote>
              &ldquo;Chair yoga for a team of 60 at a law firm every Thursday
              morning. A year ago I&apos;d never have imagined that being my
              favourite class of the week.&rdquo;
            </blockquote>
            <figcaption>
              <div className="voice-name">Kit A.</div>
              <div className="voice-meta">Chair yoga, breathwork &middot; 1 year in the network</div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ============================================================
          7. FAQ
      ============================================================ */}
      <section className="partners-faq-wrap">
        <div className="section-eyebrow">Questions</div>
        <h2 className="section-h2" style={{ marginTop: 14, marginBottom: 8 }}>
          Things people <em>usually ask.</em>
        </h2>

        <div className="faq">
          <details>
            <summary>Am I employed or self-employed?</summary>
            <p>
              Self-employed. You invoice us after each class. We don&apos;t deduct
              tax — that&apos;s your responsibility as a sole trader or limited
              company. If you need help setting up as self-employed, HMRC&apos;s
              guidance is a good starting point.
            </p>
          </details>

          <details>
            <summary>Can I teach at other studios or platforms while working with you?</summary>
            <p>
              Yes, absolutely. We have no exclusivity clause. Several of our
              teachers have their own studios, teach retreats, or work with other
              platforms. We ask only that you honour your confirmed bookings with us
              and give us reasonable notice if your availability changes.
            </p>
          </details>

          <details>
            <summary>My training isn&apos;t Yoga Alliance-registered. Does that matter?</summary>
            <p>
              Not necessarily. YA registration is one signal of quality, not the
              only one. If your 200-hour training was with a recognised school —
              even if it predates YA or isn&apos;t affiliated — we&apos;ll consider
              it. Describe your training in your application and we&apos;ll assess
              it on its own merits.
            </p>
          </details>

          <details>
            <summary>Is there a minimum number of classes I have to commit to?</summary>
            <p>
              No formal minimum. Most teachers in the network teach one to three
              classes a week, but some do more, some do fewer. We do ask that you
              maintain consistency with the clients you&apos;re allocated — switching
              and cancelling erodes the relationship we&apos;ve built with them.
            </p>
          </details>

          <details>
            <summary>I&apos;m based outside London. Do you work with teachers elsewhere?</summary>
            <p>
              Our current client base is London-centric, so almost all of our
              classes are in London. We&apos;re gradually expanding to Manchester,
              Bristol, and Edinburgh — if you&apos;re based there, apply anyway and
              tell us your city. We&apos;ll add you to the waitlist for when we
              launch in your area.
            </p>
          </details>
        </div>
      </section>

      {/* ============================================================
          8. FINAL CTA
      ============================================================ */}
      <section className="app-cta">
        <div className="app-cta-inner">
          <div>
            <div className="section-eyebrow" style={{ color: "var(--sun)" }}>
              Ready to apply
            </div>
            <h2>
              Send us a <em>video.</em>
            </h2>
            <p>
              Two minutes of you teaching — doesn&apos;t have to be polished,
              just real. Add it to your application and we&apos;ll come back to
              you within 48 hours. No audition, no fee, no nonsense.
            </p>
            <div className="store-row">
              <Link href="/contact" className="btn btn-sun btn-lg">
                Apply now <Icon name="arrow-right" size={14} />
              </Link>
              <a
                href="mailto:teachers@nine2rise.com"
                className="btn btn-ghost btn-lg"
                style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
              >
                Email us directly &rarr;
              </a>
            </div>
          </div>
          <div className="app-cta-right">
            {/* Decorative: teacher stats visual */}
            <div
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "32px 28px",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sun)", marginBottom: 4 }}>
                Network at a glance
              </div>
              {[
                { k: "Active teachers", v: "120+" },
                { k: "Client sites", v: "43" },
                { k: "Avg. classes/week", v: "2.4" },
                { k: "Teacher retention", v: "91%" },
              ].map((r) => (
                <div
                  key={r.k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    paddingBottom: 16,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{r.k}</span>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 26, letterSpacing: "-0.02em", color: "#fff" }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
