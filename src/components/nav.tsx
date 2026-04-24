"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const items = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <div className="logo-mark" />
          <span>Work Well Yoga</span>
        </Link>
        <div className="nav-links">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={"nav-link " + (pathname === it.href ? "active" : "")}
            >
              {it.label}
            </Link>
          ))}
        </div>
        <div className="nav-spacer" />
        <div className="nav-right">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={"nav-login" + (pathname === "/dashboard" ? " active" : "")}
              >
                Dashboard
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-login">
                Log in
              </Link>
              <Link href="/download" className="btn btn-sun btn-sm">
                Get the app
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
