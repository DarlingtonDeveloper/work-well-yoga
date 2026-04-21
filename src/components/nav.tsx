"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
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
          <div className="nav-login">Log in</div>
          <Link href="/download" className="btn btn-sun btn-sm">
            Get the app
          </Link>
        </div>
      </div>
    </nav>
  );
}
