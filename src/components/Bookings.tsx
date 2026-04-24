"use client";

import { Nav } from "./nav";
import { MiniFoot } from "./footer";
import Link from "next/link";
import { Icon } from "./icons";

export function BookingsShell() {
  return (
    <>
      <Nav />
      <section className="dash-main">
        <div className="dash-inner">
          <h1 className="dash-h1">Bookings</h1>
          <p style={{ color: "var(--ink-3)", margin: "8px 0 32px" }}>
            Find and book upcoming classes, workshops and retreats.
          </p>
          <div className="dash-card" style={{ textAlign: "center", padding: "48px 32px" }}>
            <div className="dash-card-status" style={{ marginBottom: 12 }}>Coming soon</div>
            <p style={{ color: "var(--ink-3)", fontSize: 14, margin: 0 }}>
              Class scheduling is on its way. In the meantime, browse the shop or get in touch.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
              <Link href="/shop" className="btn btn-dark btn-sm">
                Browse shop <Icon name="arrow-right" size={12} />
              </Link>
              <Link href="/contact" className="btn btn-outline btn-sm">
                Get in touch <Icon name="arrow-right" size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <MiniFoot />
    </>
  );
}
