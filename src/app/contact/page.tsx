"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

const reasons = [
  { id: "employer", label: "I want Nine2Rise at my workplace", eye: "Employer enquiry" },
  { id: "cowork", label: "I run a co\u2011working space", eye: "Co\u2011working partnership" },
  { id: "teacher", label: "I\u2019d like to teach with you", eye: "Teacher application" },
  { id: "press", label: "Press, podcast or partnership", eye: "Press & collaborations" },
  { id: "member", label: "I\u2019m a member with a question", eye: "Member support" },
  { id: "other", label: "Something else", eye: "General" },
];

interface Field {
  label: string;
  required?: boolean;
  type?: "textarea" | "select";
  placeholder?: string;
  options?: string[];
}

function fieldsFor(id: string): Field[] {
  if (id === "employer") return [
    { label: "Company name", required: true },
    { label: "Your role", required: true },
    { label: "Approximate headcount", type: "select", options: ["Under 20", "20\u201350", "50\u2013150", "150\u2013500", "500+"] },
    { label: "London office(s)", placeholder: "e.g. Shoreditch, remote\u2011first" },
    { label: "What\u2019s prompting this now?", type: "textarea", placeholder: "A recent engagement survey, a new leadership team, or just curiosity \u2014 all fine answers." },
  ];
  if (id === "cowork") return [
    { label: "Space name", required: true },
    { label: "Your role", required: true },
    { label: "Number of locations" },
    { label: "Approx. members across all sites", type: "select", options: ["Under 100", "100\u2013300", "300\u2013800", "800\u20132,000", "2,000+"] },
    { label: "What do you currently offer your members wellness\u2011wise?", type: "textarea" },
  ];
  if (id === "teacher") return [
    { label: "Your name", required: true },
    { label: "Where you currently teach", required: true, placeholder: "Studios, gyms, private clients" },
    { label: "Years teaching", type: "select", options: ["Under 2", "2\u20134", "5\u20137", "8\u201312", "12+"] },
    { label: "Primary formats", placeholder: "e.g. Vinyasa, yin, sound" },
    { label: "Link to a 2\u2011min teaching video", placeholder: "Unlisted YouTube, Vimeo, Google Drive", required: true },
    { label: "Training lineage", type: "textarea", placeholder: "Where you did your 200hr, anyone you studied with, courses since." },
  ];
  if (id === "press") return [
    { label: "Your name", required: true },
    { label: "Publication / podcast / org", required: true },
    { label: "Deadline, if any", placeholder: "We reply within 48hr in any case" },
    { label: "What you\u2019re working on", type: "textarea", required: true },
  ];
  if (id === "member") return [
    { label: "Your name", required: true },
    { label: "Email on your account", required: true },
    { label: "Your question", type: "textarea", required: true, placeholder: "Billing, a technical issue, a teacher you\u2019d like to book privately \u2014 anything." },
  ];
  return [
    { label: "Your name", required: true },
    { label: "What\u2019s on your mind?", type: "textarea", required: true },
  ];
}

export default function ContactPage() {
  const [reason, setReason] = useState("employer");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const active = reasons.find((r) => r.id === reason)!;
  const fields = fieldsFor(reason);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);

    const form = formRef.current!;
    const formFields: Record<string, string> = {};
    fields.forEach((f, i) => {
      const el = form.elements.namedItem(`field-${i}`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (el && el.value) formFields[f.label] = el.value;
    });
    const emailEl = form.elements.namedItem("email") as HTMLInputElement;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: reason,
          name: formFields["Your name"] || formFields["Company name"] || formFields["Space name"] || "",
          email: emailEl.value,
          fields: formFields,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <section className="contact-main">
        <div className="contact-form-wrap">
          <div className="contact-tabs">
            <div className="contact-tabs-label">I&apos;m writing because&hellip;</div>
            <div className="contact-tab-list">
              {reasons.map((r) => (
                <button
                  key={r.id}
                  className={"contact-tab " + (reason === r.id ? "active" : "")}
                  onClick={() => setReason(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {sent ? (
            <div className="contact-sent">
              <div className="contact-sent-icon"><Icon name="check" size={28} /></div>
              <h2>Message sent</h2>
              <p>We&apos;ll get back to you within 48 hours.</p>
              <button className="btn btn-dark" onClick={() => { setSent(false); setReason("employer"); }}>Send another</button>
            </div>
          ) : (
          <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
            <div className="cf-head">
              <div className="cf-eye">{active.eye}</div>
              <h2>Tell us a little.</h2>
            </div>

            {fields.map((f, i) => (
              <div key={`${reason}-${i}`} className="cf-field">
                <label>
                  {f.label}
                  {f.required && <span className="cf-req">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea name={`field-${i}`} rows={4} placeholder={f.placeholder || ""} required={f.required} />
                ) : f.type === "select" ? (
                  <select name={`field-${i}`} defaultValue="" required={f.required}>
                    <option value="" disabled>Choose one</option>
                    {f.options!.map((o, j) => <option key={j}>{o}</option>)}
                  </select>
                ) : (
                  <input name={`field-${i}`} type="text" placeholder={f.placeholder || ""} required={f.required} />
                )}
              </div>
            ))}

            <div className="cf-field">
              <label>Your email <span className="cf-req">*</span></label>
              <input name="email" type="email" placeholder="you@yourcompany.com" required />
            </div>

            {error && <div className="cf-error">{error}</div>}

            <div className="cf-foot">
              <button type="submit" className="btn btn-dark btn-lg" disabled={sending}>
                {sending ? "Sending\u2026" : "Send message"} {!sending && <Icon name="arrow-right" size={14} />}
              </button>
              <div className="cf-reassure">
                <Icon name="check" size={14} /> We reply within 48 hours &middot; Never shared &middot; GDPR&#x2011;handled
              </div>
            </div>
          </form>
          )}
        </div>

        <aside className="contact-side">
          <div className="side-card">
            <div className="side-lbl">Faster routes</div>
            <div className="side-row">
              <div className="side-k">Call (weekdays 9&ndash;5)</div>
              <div className="side-v"><a href="tel:+447803340153">07803 340153</a></div>
            </div>
            <div className="side-row">
              <div className="side-k">Email</div>
              <div className="side-v"><a href="mailto:hello@nine2rise.com">hello@nine2rise.com</a></div>
            </div>
            <div className="side-row">
              <div className="side-k">Teachers</div>
              <div className="side-v"><a href="mailto:teachers@nine2rise.com">teachers@nine2rise.com</a></div>
            </div>
            <div className="side-row">
              <div className="side-k">Press</div>
              <div className="side-v"><a href="mailto:press@nine2rise.com">press@nine2rise.com</a></div>
            </div>
          </div>

          <div className="side-card side-card-tint">
            <div className="side-lbl">Social</div>
            <a className="side-social" href="#" onClick={(e) => e.preventDefault()}>
              <span className="ss-icon ss-ig"><Icon name="heart" size={16} /></span>
              <div>
                <div className="ss-name">@nine2rise</div>
                <div className="ss-meta">Instagram &middot; weekly micro&#x2011;classes</div>
              </div>
              <Icon name="arrow-right" size={14} />
            </a>
            <a className="side-social" href="#" onClick={(e) => e.preventDefault()}>
              <span className="ss-icon ss-li"><Icon name="check" size={16} /></span>
              <div>
                <div className="ss-name">Nine2Rise on LinkedIn</div>
                <div className="ss-meta">HR conversations &middot; hiring</div>
              </div>
              <Icon name="arrow-right" size={14} />
            </a>
            <a className="side-social" href="#" onClick={(e) => e.preventDefault()}>
              <span className="ss-icon ss-sp"><Icon name="play" size={16} /></span>
              <div>
                <div className="ss-name">Between the Breaths</div>
                <div className="ss-meta">Our podcast &middot; fortnightly</div>
              </div>
              <Icon name="arrow-right" size={14} />
            </a>
          </div>
        </aside>
      </section>

      {/* Teach with us */}
      <section className="teach-wrap teach-wrap-simple" id="teach">
        <div className="teach-simple">
          <div className="eyebrow">Teach with us</div>
          <h2 className="section-h2">Looking to teach <em>with Nine2Rise?</em></h2>
          <p className="teach-lede">
            We&apos;d love to hear from qualified yoga teachers, breathwork guides and meditation practitioners. Drop us a line and tell us about yourself.
          </p>
          <div className="teach-ctas" style={{ justifyContent: "center" }}>
            <button className="btn btn-sun btn-lg" onClick={() => {
              setReason("teacher");
              setTimeout(() => document.querySelector(".contact-form-wrap")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
            }}>
              Get in touch <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
