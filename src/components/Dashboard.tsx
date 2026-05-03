"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Nav } from "./nav";
import { MiniFoot } from "./footer";
import { Icon } from "./icons";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Purchase, UserBooking, CourseEnrollment, WishlistItem } from "@/app/dashboard/page";

interface DashConversation {
  id: number;
  subject: string;
  category: string;
  status: string;
  updated_at: string;
  latest_message: { body: string; sender_type: string; created_at: string } | null;
  unread_count: number;
  messages: { id: number; body: string; sender_type: string; sender_id: string | null; read_at: string | null; created_at: string; metadata?: Record<string, unknown> }[];
}

interface DashboardShellProps {
  user: User;
  purchases: Purchase[];
  bookings: UserBooking[];
  enrollments: CourseEnrollment[];
  wishlist: WishlistItem[];
  isAdmin?: boolean;
}

export function DashboardShell({ user, purchases, bookings, enrollments, wishlist, isAdmin }: DashboardShellProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const [practiceSummary, setPracticeSummary] = useState<{ streak: number; sessionsThisWeek: number; minutesThisWeek: number } | null>(null);
  const [convos, setConvos] = useState<DashConversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [expandedConvo, setExpandedConvo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  const fetchMessages = useCallback(() => {
    fetch("/api/messages")
      .then(r => r.json())
      .then(d => {
        if (d.conversations) setConvos(d.conversations);
        if (d.totalUnread !== undefined) setTotalUnread(d.totalUnread);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/practice?view=summary")
      .then((r) => r.json())
      .then((d) => { if (d.streak !== undefined) setPracticeSummary(d); })
      .catch(() => {});
    fetchMessages();
  }, [fetchMessages]);

  async function expandThread(id: number) {
    if (expandedConvo === id) { setExpandedConvo(null); return; }
    setExpandedConvo(id);
    setReplyText("");
    // Mark as read
    await fetch("/api/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: id }),
    });
    setConvos(prev => prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c));
    setTotalUnread(prev => {
      const c = convos.find(x => x.id === id);
      return Math.max(0, prev - (c?.unread_count || 0));
    });
  }

  async function sendReply(convoId: number) {
    if (!replyText.trim()) return;
    setReplySending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: convoId, body: replyText }),
    });
    if (res.ok) {
      setReplyText("");
      fetchMessages();
    }
    setReplySending(false);
  }

  async function handlePay(pay: { product_id: number; product_name: string; price: string; category: string }) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: pay.product_name,
        price: pay.price,
        productId: pay.product_id,
        category: pay.category,
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "you";
  const avatar = user.user_metadata?.avatar_url;
  const email = user.email;

  const now = new Date();
  const eventBookings = bookings.filter((b) => b.events);
  const upcoming = eventBookings.filter(
    (b) => b.status === "confirmed" && new Date(b.events.start_at) >= now
  );
  const past = eventBookings.filter(
    (b) => b.status !== "confirmed" || new Date(b.events.start_at) < now
  );

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === "gbp" ? "£" : currency.toUpperCase() + " ";
    return `${symbol}${(amount / 100).toFixed(2)}`;
  };

  return (
    <>
      <Nav />
      <section className="dash-main">
        <div className="dash-inner">

          {/* Header */}
          <div className="dash-header">
            <div className="dash-header-left">
              {avatar && (
                <img src={avatar} alt="" className="dash-avatar" referrerPolicy="no-referrer" />
              )}
              <div>
                <h1 className="dash-h1">Welcome, {name}.</h1>
                <p className="dash-email">{email}</p>
              </div>
            </div>
            <div className="dash-header-actions">
              {isAdmin && (
                <Link href="/admin" className="btn btn-teal btn-sm">
                  Admin <Icon name="arrow-right" size={12} />
                </Link>
              )}
              <button className="dash-signout-btn" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="dash-stats">
            <Link href="/practice" className="dash-stat">
              <div className="dash-stat-icon"><Icon name="flame" size={18} /></div>
              <div className="dash-stat-value">
                {practiceSummary?.streak || 0}
              </div>
              <div className="dash-stat-label">day streak</div>
            </Link>
            <Link href="#bookings" className="dash-stat">
              <div className="dash-stat-icon"><Icon name="calendar" size={18} /></div>
              <div className="dash-stat-value">{upcoming.length}</div>
              <div className="dash-stat-label">upcoming</div>
            </Link>
            <a href="#courses" className="dash-stat" onClick={e => { e.preventDefault(); document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" }); }}>
              <div className="dash-stat-icon"><Icon name="book" size={18} /></div>
              <div className="dash-stat-value">{enrollments.length}</div>
              <div className="dash-stat-label">courses</div>
            </a>
            <a href="#messages" className="dash-stat" onClick={e => { e.preventDefault(); document.getElementById("messages")?.scrollIntoView({ behavior: "smooth" }); }}>
              <div className="dash-stat-icon"><Icon name="mail" size={18} /></div>
              <div className="dash-stat-value">{totalUnread}</div>
              <div className="dash-stat-label">unread</div>
            </a>
          </div>

          {/* Messages inbox */}
          {convos.length > 0 && (
            <div className="dash-section" id="messages">
              <h2 className="dash-section-title"><Icon name="mail" size={16} /> Messages</h2>
              <div className="dash-msg-list">
                {convos.map(c => {
                  const catIcon = c.category.startsWith("contact") ? "mail" : c.category === "order" ? "check" : c.category === "booking" ? "calendar" : "spark";
                  return (
                    <div key={c.id} className="dash-msg-item">
                      <div className={"dash-msg-row" + (c.unread_count > 0 ? " unread" : "")} onClick={() => expandThread(c.id)}>
                        <div className="dash-msg-icon"><Icon name={catIcon as "mail" | "check" | "calendar" | "spark"} size={16} /></div>
                        <div className="dash-msg-info">
                          <div className="dash-msg-subject">{c.subject}</div>
                          <div className="dash-msg-preview">
                            {c.latest_message ? c.latest_message.body.slice(0, 100) : ""}
                          </div>
                        </div>
                        <div className="dash-msg-right">
                          <span className="dash-msg-time">
                            {new Date(c.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                          {c.unread_count > 0 && <span className="dash-msg-unread-dot" />}
                        </div>
                      </div>
                      {expandedConvo === c.id && (
                        <div className="dash-msg-thread">
                          {c.messages.map(m => (
                            <div key={m.id} className={"dash-msg-bubble " + m.sender_type}>
                              <div className="dash-msg-bubble-label">
                                {m.sender_type === "user" ? "You" : m.sender_type === "system" ? "System" : "Nine2Rise"}
                              </div>
                              <div className="dash-msg-bubble-body">{m.body}</div>
                              {m.metadata?.pay ? (
                                <button
                                  className="btn btn-teal btn-sm dash-msg-pay-btn"
                                  onClick={() => handlePay(m.metadata!.pay as { product_id: number; product_name: string; price: string; category: string })}
                                >
                                  Pay {(m.metadata!.pay as { price: string }).price}
                                </button>
                              ) : null}
                              <div className="dash-msg-bubble-time">
                                {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} {new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          ))}
                          <div className="dash-msg-reply">
                            <textarea
                              rows={2}
                              placeholder="Reply..."
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) sendReply(c.id); }}
                            />
                            <button className="btn btn-dark btn-sm" onClick={() => sendReply(c.id)} disabled={replySending || !replyText.trim()}>
                              {replySending ? "..." : "Send"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two-column layout */}
          <div className="dash-columns">

            {/* Left column -- main content */}
            <div className="dash-col-main">

              {/* Upcoming bookings */}
              <div className="dash-section" id="bookings">
                <h2 className="dash-section-title">Upcoming</h2>
                {upcoming.length > 0 ? (
                  <div className="dash-booking-list">
                    {upcoming.map((b) => (
                      <div key={b.id} className="dash-booking-row">
                        <div className="dash-booking-icon"><Icon name="calendar" size={16} /></div>
                        <div className="dash-booking-info">
                          <div className="dash-booking-title">{b.events.title}</div>
                          <div className="dash-booking-meta">
                            {new Date(b.events.start_at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                            {" · "}
                            {new Date(b.events.start_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            {b.events.location && ` · ${b.events.location}`}
                          </div>
                        </div>
                        <div className="dash-booking-badge dash-booking-confirmed">Confirmed</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dash-empty">
                    No upcoming bookings.{" "}
                    <Link href="/shop">Browse the shop</Link>
                  </div>
                )}
              </div>

              {/* Courses */}
              {enrollments.length > 0 && (
                <div className="dash-section" id="courses">
                  <h2 className="dash-section-title">Your courses</h2>
                  <div className="dash-course-list">
                    {enrollments.map((course) => {
                      const pct = course.total_lessons > 0 ? Math.round((course.completed_lessons / course.total_lessons) * 100) : 0;
                      return (
                        <Link key={course.product_id} href={`/courses/${course.product_id}`} className="dash-course-row">
                          <div className="dash-course-info">
                            <div className="dash-course-name">{course.product_name}</div>
                            <div className="dash-course-progress">
                              <div className="dash-course-bar">
                                <div className="dash-course-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="dash-course-pct">
                                {pct === 100 ? "Complete" : `${course.completed_lessons}/${course.total_lessons} · ${pct}%`}
                              </span>
                            </div>
                          </div>
                          <Icon name="arrow-right" size={14} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="dash-links">
                <Link href="/practice" className="dash-link-card">
                  <Icon name="flame" size={18} />
                  <span>Practice log</span>
                  <Icon name="arrow-right" size={12} />
                </Link>
                <Link href="/shop" className="dash-link-card">
                  <Icon name="search" size={18} />
                  <span>Browse shop</span>
                  <Icon name="arrow-right" size={12} />
                </Link>
                <Link href="/account" className="dash-link-card">
                  <Icon name="user" size={18} />
                  <span>Account settings</span>
                  <Icon name="arrow-right" size={12} />
                </Link>
              </div>

              {/* Past bookings */}
              {past.length > 0 && (
                <details className="dash-section dash-past-details">
                  <summary className="dash-section-title dash-summary">
                    Past bookings ({past.length})
                  </summary>
                  <div className="dash-booking-list">
                    {past.map((b) => (
                      <div key={b.id} className="dash-booking-row dash-booking-past-row">
                        <div className="dash-booking-icon"><Icon name="check" size={16} /></div>
                        <div className="dash-booking-info">
                          <div className="dash-booking-title">{b.events.title}</div>
                          <div className="dash-booking-meta">
                            {new Date(b.events.start_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            {b.events.location && ` · ${b.events.location}`}
                          </div>
                        </div>
                        <div className={"dash-booking-badge dash-booking-" + b.status}>{b.status}</div>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Purchase history */}
              {purchases.length > 0 && (
                <details className="dash-section dash-past-details">
                  <summary className="dash-section-title dash-summary">
                    Purchase history ({purchases.length})
                  </summary>
                  <div className="dash-purchase-list">
                    {purchases.map((p) => (
                      <div key={p.id} className="dash-purchase-row">
                        <div className="dash-purchase-name">{p.product_name}</div>
                        <div className="dash-purchase-amount">{formatAmount(p.amount, p.currency)}</div>
                        <div className="dash-purchase-date">
                          {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            {/* Right column -- wishlist */}
            <div className="dash-col-side">
              <h2 className="dash-section-title">
                <Icon name="heart" size={16} /> Saved
              </h2>
              {wishlist.length > 0 ? (
                <div className="dash-wishlist-list">
                  {wishlist.map((item) => (
                    <Link key={item.id} href="/shop" className="dash-wishlist-item">
                      <div
                        className="dash-wishlist-thumb"
                        style={{ background: item.image_url ? undefined : (item.swatch || "#ccc") }}
                      >
                        {item.image_url && <img src={item.image_url} alt="" />}
                      </div>
                      <div className="dash-wishlist-info">
                        <div className="dash-wishlist-brand">{item.brand}</div>
                        <div className="dash-wishlist-name">{item.name}</div>
                        <div className="dash-wishlist-price">{item.price}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="dash-empty">
                  Tap the <Icon name="heart" size={12} /> on any product to save it here.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
      <MiniFoot />
    </>
  );
}
