"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Nav } from "./nav";
import { MiniFoot } from "./footer";
import { Icon } from "./icons";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Purchase, UserBooking, CourseEnrollment } from "@/app/dashboard/page";

interface DashboardShellProps {
  user: User;
  purchases: Purchase[];
  bookings: UserBooking[];
  enrollments: CourseEnrollment[];
  isAdmin?: boolean;
}

export function DashboardShell({ user, purchases, bookings, enrollments, isAdmin }: DashboardShellProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const [practiceSummary, setPracticeSummary] = useState<{ streak: number; sessionsThisWeek: number; minutesThisWeek: number } | null>(null);

  useEffect(() => {
    fetch("/api/practice?view=summary")
      .then((r) => r.json())
      .then((d) => { if (d.streak !== undefined) setPracticeSummary(d); })
      .catch(() => {});
  }, []);

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "you";
  const avatar = user.user_metadata?.avatar_url;
  const email = user.email;

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === "gbp" ? "£" : currency.toUpperCase() + " ";
    return `${symbol}${(amount / 100).toFixed(2)}`;
  };

  return (
    <>
      <Nav />
      <section className="dash-main">
        <div className="dash-inner">
          <div className="dash-welcome">
            {avatar && (
              <img src={avatar} alt="" className="dash-avatar" referrerPolicy="no-referrer" />
            )}
            <div>
              <h1 className="dash-h1">Welcome, {name}.</h1>
              <p className="dash-email">{email}</p>
            </div>
          </div>

          {purchases.length > 0 && (
            <div className="dash-purchases">
              <h2 className="dash-section-title">Your purchases</h2>
              <div className="dash-purchase-list">
                {purchases.map((p) => (
                  <div key={p.id} className="dash-purchase-row">
                    <div className="dash-purchase-name">{p.product_name}</div>
                    <div className="dash-purchase-cat">{p.category}</div>
                    <div className="dash-purchase-amount">{formatAmount(p.amount, p.currency)}</div>
                    <div className="dash-purchase-date">
                      {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings section */}
          {(() => {
            const now = new Date();
            const upcoming = bookings.filter(
              (b) => b.status === "confirmed" && new Date(b.events.start_at) >= now
            );
            const past = bookings.filter(
              (b) => b.status !== "confirmed" || new Date(b.events.start_at) < now
            );

            return upcoming.length > 0 || past.length > 0 ? (
              <div className="dash-bookings">
                <h2 className="dash-section-title">Your bookings</h2>
                {upcoming.length > 0 && (
                  <div className="dash-booking-list">
                    {upcoming.map((b) => (
                      <div key={b.id} className="dash-booking-row">
                        <div className="dash-booking-icon"><Icon name="calendar" size={16} /></div>
                        <div className="dash-booking-info">
                          <div className="dash-booking-title">{b.events.title}</div>
                          <div className="dash-booking-meta">
                            {new Date(b.events.start_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            {" · "}
                            {new Date(b.events.start_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            {b.events.location && ` · ${b.events.location}`}
                          </div>
                        </div>
                        <div className="dash-booking-badge dash-booking-confirmed">Confirmed</div>
                      </div>
                    ))}
                    <p className="dash-booking-cancel">
                      Need to cancel? <a href="mailto:hello@workwellyoga.com">Email us</a>
                    </p>
                  </div>
                )}
                {past.length > 0 && (
                  <details className="dash-booking-past">
                    <summary>Past bookings ({past.length})</summary>
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
              </div>
            ) : (
              <div className="dash-bookings-empty">
                <div className="dash-card">
                  <div className="dash-card-icon"><Icon name="calendar" size={20} /></div>
                  <h3>Bookings</h3>
                  <p>No upcoming bookings. Browse workshops, cohorts and retreats in the shop.</p>
                  <Link href="/shop" className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>
                    Browse shop <Icon name="arrow-right" size={12} />
                  </Link>
                </div>
              </div>
            );
          })()}

          <div className="dash-grid">
            <Link href="/practice" className="dash-card dash-card-link">
              <div className="dash-card-icon"><Icon name="flame" size={20} /></div>
              <h3>Your practice</h3>
              {practiceSummary && practiceSummary.sessionsThisWeek > 0 ? (
                <div className="dash-practice-summary">
                  <div className="dash-practice-streak">
                    <Icon name="flame" size={14} />
                    <span>{practiceSummary.streak} day streak</span>
                  </div>
                  <div className="dash-practice-week">
                    {practiceSummary.sessionsThisWeek} session{practiceSummary.sessionsThisWeek !== 1 ? "s" : ""} this week
                  </div>
                </div>
              ) : (
                <p>Track your sessions, streaks and favourite classes as you build your practice.</p>
              )}
              <span className="dash-card-arrow"><Icon name="arrow-right" size={14} /></span>
            </Link>
            {enrollments.length > 0 ? (
              enrollments.map((course) => {
                const pct = course.total_lessons > 0 ? Math.round((course.completed_lessons / course.total_lessons) * 100) : 0;
                return (
                  <Link key={course.product_id} href={`/courses/${course.product_id}`} className="dash-card dash-card-link">
                    <div className="dash-card-icon"><Icon name="book" size={20} /></div>
                    <h3>{course.product_name}</h3>
                    <div className="dash-course-progress">
                      <div className="dash-course-bar">
                        <div className="dash-course-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="dash-course-pct">
                        {pct === 100 ? "Complete" : `${course.completed_lessons}/${course.total_lessons} lessons · ${pct}%`}
                      </span>
                    </div>
                    <span className="dash-card-arrow"><Icon name="arrow-right" size={14} /></span>
                  </Link>
                );
              })
            ) : (
              <div className="dash-card">
                <div className="dash-card-icon"><Icon name="book" size={20} /></div>
                <h3>Courses</h3>
                <p>Self-paced courses for the work beneath the work. Enrol to get started.</p>
                <Link href="/shop" className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>
                  Browse courses <Icon name="arrow-right" size={12} />
                </Link>
              </div>
            )}
            <Link href="/account" className="dash-card dash-card-link">
              <div className="dash-card-icon"><Icon name="user" size={20} /></div>
              <h3>Account</h3>
              <p>Update your details, manage your membership and notification preferences.</p>
              <span className="dash-card-arrow"><Icon name="arrow-right" size={14} /></span>
            </Link>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
            <button className="btn btn-outline btn-sm dash-signout" onClick={handleSignOut}>
              Sign out <Icon name="arrow-right" size={12} />
            </button>
            <Link href="/shop" className="btn btn-outline btn-sm">
              Browse shop <Icon name="arrow-right" size={12} />
            </Link>
            {isAdmin && (
              <Link href="/admin" className="btn btn-teal btn-sm">
                Admin <Icon name="arrow-right" size={12} />
              </Link>
            )}
          </div>
        </div>
      </section>
      <MiniFoot />
    </>
  );
}
