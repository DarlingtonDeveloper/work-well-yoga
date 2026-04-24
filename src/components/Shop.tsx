"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { FloatingContact, MiniFoot } from "@/components/footer";
import { Icon } from "@/components/icons";

export interface Product {
  id: number;
  category: string;
  kind: string;
  brand: string;
  name: string;
  price: string;
  meta: string;
  blurb: string;
  swatch: string;
  image_url: string | null;
  badge: string | null;
  sort_order: number;
  active: boolean;
}

interface ShopEvent {
  id: number;
  product_id: number;
  title: string;
  start_at: string;
  end_at: string | null;
  location: string | null;
  capacity: number;
  status: string;
  booking_count: number;
  waitlist_count: number;
}

const BOOKABLE_CATS = ["workshop", "intensive", "retreat"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function EventCalendar({
  product,
  events,
  onBook,
  onWaitlist,
  onClose,
  loading,
  joiningWaitlist,
  ctaLabel,
}: {
  product: Product;
  events: ShopEvent[];
  onBook: (product: Product, eventId: number) => void;
  onWaitlist: (eventId: number) => void;
  onClose: () => void;
  loading: number | null;
  joiningWaitlist: number | null;
  ctaLabel: string;
}) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const eventDates = useMemo(() => {
    const map = new Map<string, ShopEvent[]>();
    events.forEach((ev) => {
      const d = new Date(ev.start_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    });
    return map;
  }, [events]);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getEventsForDay = (day: number) => {
    const key = `${viewYear}-${viewMonth}-${day}`;
    return eventDates.get(key) || [];
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectedEvents = selectedDay
    ? getEventsForDay(selectedDay.getDate()).filter(
        (ev) => new Date(ev.start_at).getMonth() === selectedDay.getMonth() && new Date(ev.start_at).getFullYear() === selectedDay.getFullYear()
      )
    : [];

  return (
    <div className="ev-cal-overlay" onClick={onClose}>
      <div className="ev-cal-popup" onClick={(e) => e.stopPropagation()}>
        <button className="ev-cal-close" onClick={onClose}>
          <Icon name="x" size={18} />
        </button>

        <div className="ev-cal-header">
          <div className="ev-cal-product">
            <div className="ev-cal-brand">{product.brand}</div>
            <div className="ev-cal-name">{product.name}</div>
          </div>
          <div className="ev-cal-price">{product.price}</div>
        </div>

        <div className="ev-cal-nav">
          <button onClick={prevMonth} className="ev-cal-arrow">
            <Icon name="arrow-right" size={14} />
          </button>
          <span className="ev-cal-month">{MONTHS[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="ev-cal-arrow ev-cal-arrow-right">
            <Icon name="arrow-right" size={14} />
          </button>
        </div>

        <div className="ev-cal-grid">
          {DAYS.map((d) => (
            <div key={d} className="ev-cal-day-label">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="ev-cal-cell ev-cal-empty" />;
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            const cellDate = new Date(viewYear, viewMonth, day);
            const isPast = cellDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const isToday = sameDay(cellDate, now);
            const isSelected = selectedDay && sameDay(cellDate, selectedDay);
            const allFull = hasEvents && dayEvents.every((e) => e.status === "full" || e.booking_count >= e.capacity);

            return (
              <button
                key={i}
                className={
                  "ev-cal-cell" +
                  (hasEvents ? " ev-cal-has" : "") +
                  (allFull ? " ev-cal-full" : "") +
                  (isPast ? " ev-cal-past" : "") +
                  (isToday ? " ev-cal-today" : "") +
                  (isSelected ? " ev-cal-selected" : "")
                }
                disabled={!hasEvents || isPast}
                onClick={() => hasEvents && !isPast && setSelectedDay(cellDate)}
              >
                {day}
                {hasEvents && <span className="ev-cal-dot" />}
              </button>
            );
          })}
        </div>

        {selectedDay && selectedEvents.length > 0 && (
          <div className="ev-cal-detail">
            {selectedEvents.map((ev) => {
              const isFull = ev.status === "full" || ev.booking_count >= ev.capacity;
              const spotsLeft = ev.capacity - ev.booking_count;
              return (
                <div key={ev.id} className="ev-cal-event">
                  <div className="ev-cal-event-info">
                    <div className="ev-cal-event-title">{ev.title}</div>
                    <div className="ev-cal-event-time">
                      {new Date(ev.start_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      {ev.end_at && ` – ${new Date(ev.end_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
                    </div>
                    {ev.location && <div className="ev-cal-event-loc">{ev.location}</div>}
                    <div className="ev-cal-event-spots">
                      {isFull ? "Full — waitlist available" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} remaining`}
                    </div>
                  </div>
                  {isFull ? (
                    <button
                      className="ev-cal-btn ev-cal-btn-waitlist"
                      onClick={() => onWaitlist(ev.id)}
                      disabled={joiningWaitlist === ev.id}
                    >
                      {joiningWaitlist === ev.id ? "Joining..." : "Join waitlist"}
                    </button>
                  ) : (
                    <button
                      className="ev-cal-btn"
                      onClick={() => onBook(product, ev.id)}
                      disabled={loading === product.id}
                    >
                      {loading === product.id ? "Loading..." : ctaLabel}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {events.length === 0 && (
          <div className="ev-cal-empty-msg">
            No dates scheduled yet. Check back soon.
          </div>
        )}
      </div>
    </div>
  );
}

export function ShopClient({ products }: { products: Product[] }) {
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState<number | null>(null);
  const [events, setEvents] = useState<ShopEvent[]>([]);
  const [eventPicker, setEventPicker] = useState<number | null>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});
  }, []);

  const getProductEvents = (productId: number) =>
    events.filter((e) => e.product_id === productId && e.status !== "cancelled");

  const handleCheckout = async (product: Product, eventId?: number) => {
    setLoading(product.id);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${product.brand} — ${product.name}`,
          price: product.price,
          productId: product.id,
          category: product.category,
          eventId: eventId || undefined,
        }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
      setEventPicker(null);
    }
  };

  const handleJoinWaitlist = async (eventId: number) => {
    setJoiningWaitlist(eventId);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.ok) {
        alert(`You're on the waitlist (#${data.position}). We'll notify you when a spot opens up.`);
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setJoiningWaitlist(null);
    }
  };

  const categories = [
    { id: "all", label: "All" },
    { id: "course", label: "Courses" },
    { id: "workshop", label: "Workshops" },
    { id: "intensive", label: "Intensives" },
    { id: "retreat", label: "Retreats" },
    { id: "journal", label: "Journals" },
    { id: "kit", label: "Kit" },
  ];

  const filtered = cat === "all" ? products : products.filter((p) => p.category === cat);

  const ctaLabel = (catId: string): string => {
    switch (catId) {
      case "course": return "Enrol";
      case "workshop": return "Book a seat";
      case "intensive": return "Join";
      case "retreat": return "Book a spot";
      case "journal": return "Add to basket";
      default: return "Buy";
    }
  };

  return (
    <>
      <Nav />
      <section className="shop-hero shop-hero-bold">
        <div className="shop-hero-inner">
          <h1 className="shop-hero-h1">
            Classes, courses, <em>retreats.</em>
          </h1>
          <p className="shop-hero-sub">
            Workshops, intensives, retreats and the quiet things we keep on our shelf.
          </p>
        </div>
      </section>

      <section className="shop-filters-wrap">
        <div className="shop-filters">
          {categories.map((c) => (
            <button
              key={c.id}
              className={"sf-chip " + (cat === c.id ? "active" : "")}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="shop-grid-wrap">
        <div className="shop-grid">
          {filtered.map((p) => {
            const isAffiliate = p.category === "kit";
            const swatchIsGradient = typeof p.swatch === "string" && p.swatch.includes("gradient");
            return (
              <article key={p.id} className={"product product-" + p.category}>
                <div
                  className="product-img"
                  style={{ background: p.image_url ? undefined : p.swatch }}
                >
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="product-photo" />
                  )}
                  {p.badge && <div className="product-badge">{p.badge}</div>}
                  <div
                    className="product-ghost"
                    style={swatchIsGradient && !p.image_url ? { color: "rgba(255,255,255,0.9)" } : undefined}
                  >
                    {p.kind}
                  </div>
                  <button className="product-save" aria-label="Save">
                    <Icon name="heart" size={14} />
                  </button>
                </div>
                <div className="product-body">
                  <div className="product-brand">{p.brand}</div>
                  <div className="product-name">{p.name}</div>
                  <p className="product-blurb">{p.blurb}</p>
                  {p.meta && <div className="product-meta">{p.meta}</div>}
                  <div className="product-foot">
                    <div className="product-price">{p.price}</div>
                    {BOOKABLE_CATS.includes(p.category) ? (
                      <button
                        className="product-cta"
                        onClick={() => setEventPicker(p.id)}
                        disabled={loading === p.id}
                      >
                        {loading === p.id ? "Loading..." : "View dates"}{" "}
                        <Icon name="calendar" size={12} />
                      </button>
                    ) : (
                      <button
                        className="product-cta"
                        onClick={() => handleCheckout(p)}
                        disabled={loading === p.id}
                      >
                        {loading === p.id ? "Loading..." : ctaLabel(p.category)}{" "}
                        <Icon name="arrow-right" size={12} />
                      </button>
                    )}
                  </div>
                  {isAffiliate && (
                    <div className="product-note">
                      <span className="affil-dot" /> Affiliate link
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--ink-3)", padding: "48px 0" }}>
              No products found.
            </p>
          )}
        </div>
      </section>

      {eventPicker !== null && (() => {
        const product = products.find((p) => p.id === eventPicker);
        if (!product) return null;
        return (
          <EventCalendar
            product={product}
            events={getProductEvents(product.id)}
            onBook={handleCheckout}
            onWaitlist={handleJoinWaitlist}
            onClose={() => setEventPicker(null)}
            loading={loading}
            joiningWaitlist={joiningWaitlist}
            ctaLabel={ctaLabel(product.category)}
          />
        );
      })()}

      <MiniFoot />
      <FloatingContact />
    </>
  );
}
