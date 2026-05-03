/* global React, Icon */
const { useState: useStateC } = React;

function ContactPage({ setPage }) {
  const [reason, setReason] = useStateC(() => {
    const r = window.__WW_INITIAL_REASON__;
    if (r) { delete window.__WW_INITIAL_REASON__; return r; }
    return "employer";
  });

  const reasons = [
    { id: "employer", label: "I want Nine2Rise at my workplace", eye: "Employer enquiry" },
    { id: "cowork", label: "I run a co‑working space", eye: "Co‑working partnership" },
    { id: "teacher", label: "I'd like to teach with you", eye: "Teacher application" },
    { id: "press", label: "Press, podcast or partnership", eye: "Press & collaborations" },
    { id: "member", label: "I'm a member with a question", eye: "Member support" },
    { id: "other", label: "Something else", eye: "General" },
  ];

  const active = reasons.find(r => r.id === reason);

  const fieldsFor = (id) => {
    if (id === "employer") return [
      { label: "Company name", required: true },
      { label: "Your role", required: true },
      { label: "Approximate headcount", type: "select", options: ["Under 20", "20–50", "50–150", "150–500", "500+"] },
      { label: "London office(s)", placeholder: "e.g. Shoreditch, remote‑first" },
      { label: "What's prompting this now?", type: "textarea", placeholder: "A recent engagement survey, a new leadership team, or just curiosity — all fine answers." },
    ];
    if (id === "cowork") return [
      { label: "Space name", required: true },
      { label: "Your role", required: true },
      { label: "Number of locations" },
      { label: "Approx. members across all sites", type: "select", options: ["Under 100", "100–300", "300–800", "800–2,000", "2,000+"] },
      { label: "What do you currently offer your members wellness‑wise?", type: "textarea" },
    ];
    if (id === "teacher") return [
      { label: "Your name", required: true },
      { label: "Where you currently teach", required: true, placeholder: "Studios, gyms, private clients" },
      { label: "Years teaching", type: "select", options: ["Under 2", "2–4", "5–7", "8–12", "12+"] },
      { label: "Primary formats", placeholder: "e.g. Vinyasa, yin, sound" },
      { label: "Link to a 2‑min teaching video", placeholder: "Unlisted YouTube, Vimeo, Google Drive", required: true },
      { label: "Training lineage", type: "textarea", placeholder: "Where you did your 200hr, anyone you studied with, courses since." },
    ];
    if (id === "press") return [
      { label: "Your name", required: true },
      { label: "Publication / podcast / org", required: true },
      { label: "Deadline, if any", placeholder: "We reply within 48hr in any case" },
      { label: "What you're working on", type: "textarea", required: true },
    ];
    if (id === "member") return [
      { label: "Your name", required: true },
      { label: "Email on your account", required: true },
      { label: "Your question", type: "textarea", required: true, placeholder: "Billing, a technical issue, a teacher you'd like to book privately — anything." },
    ];
    return [
      { label: "Your name", required: true },
      { label: "What's on your mind?", type: "textarea", required: true },
    ];
  };

  const fields = fieldsFor(reason);

  return (
    <>
      {/* Form + sidebar */}
      <section className="contact-main">
        <div className="contact-form-wrap">
          <div className="contact-tabs">
            <div className="contact-tabs-label">I'm writing because…</div>
            <div className="contact-tab-list">
              {reasons.map(r => (
                <button
                  key={r.id}
                  className={"contact-tab " + (reason === r.id ? "active" : "")}
                  onClick={() => setReason(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <form className="contact-form" onSubmit={e => { e.preventDefault(); alert("In the real build this submits — for now, email hello@nine2rise.com"); }}>
            <div className="cf-head">
              <div className="cf-eye">{active.eye}</div>
              <h2>Tell us a little.</h2>
            </div>

            {fields.map((f, i) => (
              <div key={i} className="cf-field">
                <label>
                  {f.label}
                  {f.required && <span className="cf-req">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea rows="4" placeholder={f.placeholder || ""} />
                ) : f.type === "select" ? (
                  <select defaultValue="">
                    <option value="" disabled>Choose one</option>
                    {f.options.map((o, j) => <option key={j}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" placeholder={f.placeholder || ""} />
                )}
              </div>
            ))}

            <div className="cf-field">
              <label>Your email <span className="cf-req">*</span></label>
              <input type="email" placeholder="you@yourcompany.com" />
            </div>

            <div className="cf-foot">
              <button type="submit" className="btn btn-dark btn-lg">Send message <Icon name="arrow-right" size={14}/></button>
              <div className="cf-reassure">
                <Icon name="check" size={14}/> We reply within 48 hours · Never shared · GDPR‑handled
              </div>
            </div>
          </form>
        </div>

        <aside className="contact-side">
          <div className="side-card">
            <div className="side-lbl">Faster routes</div>
            <div className="side-row">
              <div className="side-k">Call (weekdays 9–5)</div>
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
            <a className="side-social" href="#" onClick={e => e.preventDefault()}>
              <span className="ss-icon ss-ig"><Icon name="heart" size={16}/></span>
              <div>
                <div className="ss-name">@nine2rise</div>
                <div className="ss-meta">Instagram · weekly micro‑classes</div>
              </div>
              <Icon name="arrow-right" size={14}/>
            </a>
            <a className="side-social" href="#" onClick={e => e.preventDefault()}>
              <span className="ss-icon ss-li"><Icon name="check" size={16}/></span>
              <div>
                <div className="ss-name">Nine2Rise on LinkedIn</div>
                <div className="ss-meta">HR conversations · hiring</div>
              </div>
              <Icon name="arrow-right" size={14}/>
            </a>
            <a className="side-social" href="#" onClick={e => e.preventDefault()}>
              <span className="ss-icon ss-sp"><Icon name="play" size={16}/></span>
              <div>
                <div className="ss-name">Between the Breaths</div>
                <div className="ss-meta">Our podcast · fortnightly</div>
              </div>
              <Icon name="arrow-right" size={14}/>
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
            We'd love to hear from qualified yoga teachers, breathwork guides and meditation practitioners. Drop us a line and tell us about yourself.
          </p>
          <div className="teach-ctas" style={{justifyContent: 'center'}}>
            <button className="btn btn-sun btn-lg" onClick={() => { setReason("teacher"); setTimeout(() => document.querySelector('.contact-form-wrap')?.scrollIntoView({behavior:'smooth', block:'start'}), 50); }}>
              Get in touch <Icon name="arrow-right" size={14}/>
            </button>
          </div>
        </div>
      </section>

      {/* Response commitments */}
    </>
  );
}

window.ContactPage = ContactPage;
