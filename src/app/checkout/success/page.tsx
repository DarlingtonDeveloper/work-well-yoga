"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const confirmed = useRef(false);

  useEffect(() => {
    if (!sessionId || confirmed.current) return;
    confirmed.current = true;
    fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
  }, [sessionId]);

  return (
    <section className="login-page">
      <div className="login-card" style={{ textAlign: "center" }}>
        <div style={{ color: "var(--teal)", marginBottom: 16 }}>
          <Icon name="check" size={48} />
        </div>
        <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 24, margin: "0 0 8px" }}>
          Thank you
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 14, margin: "0 0 28px" }}>
          Your payment was successful. You&apos;ll receive a confirmation email shortly.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/dashboard" className="btn btn-sun btn-sm">
            Go to Dashboard
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
