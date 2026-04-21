/* global React, Icon */
const { useState: useStateC } = React;

function Nav({ page, setPage }) {
  const items = [
    { id: "home", label: "Home" },
    { id: "pricing", label: "Pricing" },
    { id: "affiliate", label: "Shop" },
    { id: "contact", label: "Contact" },
  ];
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="logo" onClick={() => setPage("home")}>
          <div className="logo-mark" />
          <span>Work Well Yoga</span>
        </div>
        <div className="nav-links">
          {items.map(it => (
            <div key={it.id}
              className={"nav-link " + (page === it.id ? "active" : "")}
              onClick={() => setPage(it.id)}>
              {it.label}
            </div>
          ))}
        </div>
        <div className="nav-spacer" />
        <div className="nav-right">
          <div className="nav-login">Log in</div>
          <button className="btn btn-sun btn-sm" onClick={() => setPage("app")}>
            Get the app
          </button>
        </div>
      </div>
    </nav>
  );
}

function FloatingContact() {
  return (
    <div className="floating" role="complementary" aria-label="Contact">
      <a className="f-item" href="tel:+447803340153">
        <span className="f-ico"><Icon name="phone" size={14} /></span>
        <span>
          <span className="f-label">Call</span>
          <span className="f-value">07803 340153</span>
        </span>
      </a>
      <div className="divider" />
      <a className="f-item" href="mailto:hello@workwellyoga.com">
        <span className="f-ico sun"><Icon name="mail" size={14} /></span>
        <span>
          <span className="f-label">Write</span>
          <span className="f-value">hello@workwellyoga.com</span>
        </span>
      </a>
    </div>
  );
}

function MiniFoot() {
  return (
    <div className="mini-foot">
      <div className="f-logo">
        <div className="logo-mark" style={{ width: 22, height: 22 }} />
        <span>Work Well Yoga</span>
      </div>
      <div className="f-links">
        <a onClick={() => window.dispatchEvent(new CustomEvent('wwy-goto', {detail: 'pricing'}))} style={{cursor:'pointer'}}>Pricing</a>
        <a>Gallery</a>
        <a>Privacy</a>
        <a>Terms</a>
        <a>Studios</a>
        <a>Press</a>
        <a>Instagram</a>
      </div>
      <div style={{ fontSize: 12 }}>© 2026 Work Well Yoga · Made with care in London</div>
    </div>
  );
}

window.Nav = Nav;
window.FloatingContact = FloatingContact;
window.MiniFoot = MiniFoot;
