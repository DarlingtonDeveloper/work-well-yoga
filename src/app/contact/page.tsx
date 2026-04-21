"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

const reasons = [
  { id: "employer", label: "I want Work Well Yoga at my workplace", eye: "Employer enquiry" },
  { id: "cowork", label: "I run a co‑working space", eye: "Co‑working partnership" },
  { id: "teacher", label: "I'd like to teach with you", eye: "Teacher application" },
  { id: "press", label: "Press, podcast or partnership", eye: "Press & collaborations" },
  { id: "member", label: "I'm a member with a question", eye: "Member support" },
  { id: "other", label: "Something else", eye: "General" },
];

function fieldsFor(reason: string) {
  switch (reason) {
    case "employer":
      return (
        <>
          <div className="cf-field">
            <label>Company name <span className="cf-req">*</span></label>
            <input type="text" name="company_name" required placeholder="e.g. Acme Ltd" />
          </div>
          <div className="cf-field">
            <label>Your role <span className="cf-req">*</span></label>
            <input type="text" name="role" required placeholder="e.g. Head of People" />
          </div>
          <div className="cf-field">
            <label>Approximate headcount</label>
            <select name="headcount">
              <option value="">Select…</option>
              <option value="under-20">Under 20</option>
              <option value="20-50">20–50</option>
              <option value="50-150">50–150</option>
              <option value="150-500">150–500</option>
              <option value="500+">500+</option>
            </select>
          </div>
          <div className="cf-field">
            <label>London office(s)</label>
            <input type="text" name="offices" placeholder="e.g. Shoreditch, Liverpool Street" />
          </div>
          <div className="cf-field">
            <label>What&rsquo;s prompting this now?</label>
            <textarea name="prompt" rows={4} placeholder="Tell us a little about what you have in mind…" />
          </div>
        </>
      );
    case "cowork":
      return (
        <>
          <div className="cf-field">
            <label>Space name <span className="cf-req">*</span></label>
            <input type="text" name="space_name" required placeholder="e.g. The Hangar Collective" />
          </div>
          <div className="cf-field">
            <label>Your role <span className="cf-req">*</span></label>
            <input type="text" name="role" required placeholder="e.g. Community Manager" />
          </div>
          <div className="cf-field">
            <label>Number of locations</label>
            <input type="text" name="locations" placeholder="e.g. 3" />
          </div>
          <div className="cf-field">
            <label>Approx. members</label>
            <select name="members">
              <option value="">Select…</option>
              <option value="under-50">Under 50</option>
              <option value="50-150">50–150</option>
              <option value="150-500">150–500</option>
              <option value="500-1000">500–1,000</option>
              <option value="1000+">1,000+</option>
            </select>
          </div>
          <div className="cf-field">
            <label>What do you currently offer wellness-wise?</label>
            <textarea name="wellness" rows={4} placeholder="e.g. monthly massage, meditation app subscription…" />
          </div>
        </>
      );
    case "teacher":
      return (
        <>
          <div className="cf-field">
            <label>Your name <span className="cf-req">*</span></label>
            <input type="text" name="name" required placeholder="Full name" />
          </div>
          <div className="cf-field">
            <label>Where you currently teach <span className="cf-req">*</span></label>
            <input type="text" name="current_studio" required placeholder="e.g. Studio X, corporate clients, online" />
          </div>
          <div className="cf-field">
            <label>Years teaching</label>
            <select name="years_teaching">
              <option value="">Select…</option>
              <option value="under-1">Under 1 year</option>
              <option value="1-3">1–3 years</option>
              <option value="3-5">3–5 years</option>
              <option value="5-10">5–10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
          <div className="cf-field">
            <label>Primary formats</label>
            <input type="text" name="formats" placeholder="e.g. Vinyasa, Yin, Breathwork" />
          </div>
          <div className="cf-field">
            <label>Link to 2-min video <span className="cf-req">*</span></label>
            <input type="url" name="video_link" required placeholder="https://…" />
          </div>
          <div className="cf-field">
            <label>Training lineage</label>
            <textarea name="lineage" rows={4} placeholder="Schools, teachers, certifications…" />
          </div>
        </>
      );
    case "press":
      return (
        <>
          <div className="cf-field">
            <label>Your name <span className="cf-req">*</span></label>
            <input type="text" name="name" required placeholder="Full name" />
          </div>
          <div className="cf-field">
            <label>Publication / podcast / org <span className="cf-req">*</span></label>
            <input type="text" name="publication" required placeholder="e.g. Condé Nast Traveller" />
          </div>
          <div className="cf-field">
            <label>Deadline</label>
            <input type="date" name="deadline" />
          </div>
          <div className="cf-field">
            <label>What you&rsquo;re working on <span className="cf-req">*</span></label>
            <textarea name="brief" rows={4} required placeholder="Give us a brief overview of the piece or feature…" />
          </div>
        </>
      );
    case "member":
      return (
        <>
          <div className="cf-field">
            <label>Your name <span className="cf-req">*</span></label>
            <input type="text" name="name" required placeholder="Full name" />
          </div>
          <div className="cf-field">
            <label>Email on your account <span className="cf-req">*</span></label>
            <input type="email" name="account_email" required placeholder="the address you signed up with" />
          </div>
          <div className="cf-field">
            <label>Your question <span className="cf-req">*</span></label>
            <textarea name="question" rows={5} required placeholder="How can we help?" />
          </div>
        </>
      );
    case "other":
    default:
      return (
        <>
          <div className="cf-field">
            <label>Your name <span className="cf-req">*</span></label>
            <input type="text" name="name" required placeholder="Full name" />
          </div>
          <div className="cf-field">
            <label>What&rsquo;s on your mind? <span className="cf-req">*</span></label>
            <textarea name="message" rows={6} required placeholder="Tell us anything…" />
          </div>
        </>
      );
  }
}

export default function ContactPage() {
  const [reason, setReason] = useState("employer");

  const activeReason = reasons.find((r) => r.id === reason)!;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("Thanks for getting in touch — we'll be back with you shortly.");
  }

  function scrollToFormAndSetTeacher() {
    setReason("teacher");
    const el = document.getElementById("contact-form-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <main className="contact-main">
      {/* ── Two-column layout ─────────────────────────────── */}
      <div className="contact-columns">

        {/* Left — form */}
        <div className="contact-form-wrap" id="contact-form-anchor">
          {/* Reason tabs */}
          <nav className="contact-tabs" aria-label="Contact reason">
            <ul className="contact-tab-list" role="tablist">
              {reasons.map((r) => (
                <li key={r.id} role="presentation">
                  <button
                    role="tab"
                    aria-selected={reason === r.id}
                    className={`contact-tab${reason === r.id ? " contact-tab--active" : ""}`}
                    onClick={() => setReason(r.id)}
                    type="button"
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Dynamic form */}
          <form
            className="contact-form"
            onSubmit={handleSubmit}
            aria-labelledby="cf-heading"
          >
            <div className="cf-head">
              <p className="cf-eye">{activeReason.eye}</p>
              <h1 id="cf-heading">Get in touch</h1>
            </div>

            {fieldsFor(reason)}

            {/* Always-present email field */}
            <div className="cf-field">
              <label>Your email <span className="cf-req">*</span></label>
              <input type="email" name="email" required placeholder="you@example.com" />
            </div>

            <div className="cf-foot">
              <button type="submit" className="btn-dark">
                Send message
                <Icon name="arrow-right" size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Right — side panel */}
        <aside className="contact-side">
          {/* Contact info card */}
          <div className="side-card">
            <p className="side-lbl">Contact</p>

            <div className="side-row">
              <Icon name="phone" size={16} />
              <a href="tel:+442012345678">+44 (0)20 1234 5678</a>
            </div>

            <div className="side-row">
              <Icon name="mail" size={16} />
              <div>
                <p className="side-sublbl">General</p>
                <a href="mailto:hello@workwellyoga.co.uk">hello@workwellyoga.co.uk</a>
              </div>
            </div>

            <div className="side-row">
              <Icon name="mail" size={16} />
              <div>
                <p className="side-sublbl">Teachers</p>
                <a href="mailto:teach@workwellyoga.co.uk">teach@workwellyoga.co.uk</a>
              </div>
            </div>

            <div className="side-row">
              <Icon name="mail" size={16} />
              <div>
                <p className="side-sublbl">Press</p>
                <a href="mailto:press@workwellyoga.co.uk">press@workwellyoga.co.uk</a>
              </div>
            </div>
          </div>

          {/* Social links card */}
          <div className="side-card side-card-tint">
            <p className="side-lbl">Find us</p>

            <div className="side-social">
              <Link
                href="https://instagram.com/workwell.yoga"
                target="_blank"
                rel="noopener noreferrer"
                className="ss-icon ss-ig"
                aria-label="Instagram @workwell.yoga"
              >
                {/* Instagram SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
                <span>@workwell.yoga</span>
              </Link>

              <Link
                href="https://linkedin.com/company/work-well-yoga"
                target="_blank"
                rel="noopener noreferrer"
                className="ss-icon ss-li"
                aria-label="LinkedIn"
              >
                {/* LinkedIn SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span>LinkedIn</span>
              </Link>

              <Link
                href="https://podcasts.apple.com/workwellyoga"
                target="_blank"
                rel="noopener noreferrer"
                className="ss-icon ss-sp"
                aria-label="Podcast: Between the Breaths"
              >
                {/* Podcast / headphones SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
                <span>Between the Breaths</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Teach with us ─────────────────────────────────── */}
      <section className="teach-wrap teach-wrap-simple">
        <div className="teach-inner">
          <div className="teach-copy">
            <p className="cf-eye">Join the team</p>
            <h2>Teach with us</h2>
            <p>
              We work with independent yoga and breathwork teachers who bring real expertise to
              the workplace. If that sounds like you, we&rsquo;d love to hear from you.
            </p>
          </div>
          <div className="teach-cta">
            <button
              type="button"
              className="btn-dark"
              onClick={scrollToFormAndSetTeacher}
            >
              Apply to teach
              <Icon name="arrow-right" size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
