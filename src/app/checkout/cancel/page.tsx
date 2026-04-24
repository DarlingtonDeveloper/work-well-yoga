"use client";

import Link from "next/link";

export default function CheckoutCancel() {
  return (
    <section className="login-page">
      <div className="login-card" style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 24, margin: "0 0 8px" }}>
          Checkout cancelled
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 14, margin: "0 0 28px" }}>
          No worries. Your cart is still here when you&apos;re ready.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/pricing" className="btn btn-sun btn-sm">
            Back to Pricing
          </Link>
          <Link href="/shop" className="btn btn-ghost btn-sm">
            Back to Shop
          </Link>
        </div>
      </div>
    </section>
  );
}
