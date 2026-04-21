"use client";

import Link from "next/link";
import { Icon } from "./icons";

export function FloatingContact() {
  return (
    <div className="floating" role="complementary" aria-label="Contact">
      <a className="f-item" href="tel:+447803340153">
        <span className="f-ico">
          <Icon name="phone" size={14} />
        </span>
        <span>
          <span className="f-label">Call</span>
          <span className="f-value">07803 340153</span>
        </span>
      </a>
      <div className="divider" />
      <a className="f-item" href="mailto:hello@workwellyoga.com">
        <span className="f-ico sun">
          <Icon name="mail" size={14} />
        </span>
        <span>
          <span className="f-label">Write</span>
          <span className="f-value">hello@workwellyoga.com</span>
        </span>
      </a>
    </div>
  );
}

export function MiniFoot() {
  return (
    <div className="mini-foot">
      <div className="f-logo">
        <div className="logo-mark" style={{ width: 22, height: 22 }} />
        <span>Work Well Yoga</span>
      </div>
      <div className="f-links">
        <Link href="/pricing">Pricing</Link>
        <a>Gallery</a>
        <a>Privacy</a>
        <a>Terms</a>
        <a>Studios</a>
        <a>Press</a>
        <a>Instagram</a>
      </div>
      <div style={{ fontSize: 12 }}>
        &copy; 2026 Work Well Yoga &middot; Made with care in London
      </div>
    </div>
  );
}
