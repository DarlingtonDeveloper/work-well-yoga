"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  swatch: string | null;
  image_url: string | null;
  sort_order: number;
}

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
  coming_soon: boolean;
  preorder_enabled: boolean;
  preorder_deposit: string | null;
  release_date: string | null;
  preorder_list_id: number | null;
  booking_mode: string | null;
  recurrence_anchor: string | null;
  recurrence_interval_months: number | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

interface Category {
  id: string;
  label: string;
}

interface CatMeta {
  eye: string;
  title: React.ReactNode;
  sub: string;
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

/* ---------- Calendar popup ---------- */

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

  // Build calendar grid (Monday-start)
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7; // 0=Mon
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

/* ---------- Product detail popup ---------- */

function ProductPopup({
  product,
  selectedVariantId,
  onSelectVariant,
  wishlisted,
  onToggleWishlist,
  onCheckout,
  onViewDates,
  onDatePicker,
  onRequestCal,
  onNotifyMe,
  notified,
  loading,
  ctaLabel,
  onClose,
  owned,
}: {
  product: Product;
  selectedVariantId: number | undefined;
  onSelectVariant: (productId: number, variantId: number) => void;
  wishlisted: boolean;
  onToggleWishlist: (productId: number) => void;
  onCheckout: (product: Product, eventId?: number) => void;
  onViewDates: (productId: number) => void;
  onDatePicker: (productId: number) => void;
  onRequestCal: (productId: number) => void;
  onNotifyMe: (productId: number) => void;
  notified: boolean;
  loading: number | null;
  ctaLabel: string;
  onClose: () => void;
  owned?: boolean;
}) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const selectedVariant = product.product_variants?.find(
    (v) => v.id === selectedVariantId
  );
  const heroImage = activeImage || selectedVariant?.image_url || product.image_url;

  // All available images: primary + gallery
  const gallery = useMemo(() => {
    const imgs: { url: string; label: string }[] = [];
    if (product.image_url) imgs.push({ url: product.image_url, label: product.name });
    if (product.product_images) {
      for (const img of product.product_images) {
        if (!imgs.some((i) => i.url === img.image_url)) {
          imgs.push({ url: img.image_url, label: `${product.name} ${imgs.length + 1}` });
        }
      }
    }
    // Add variant images that aren't already in gallery
    if (product.product_variants) {
      for (const v of product.product_variants) {
        if (v.image_url && !imgs.some((i) => i.url === v.image_url)) {
          imgs.push({ url: v.image_url, label: v.name });
        }
      }
    }
    return imgs;
  }, [product]);

  // Reset active image when variant changes
  useEffect(() => {
    setActiveImage(null);
  }, [selectedVariantId]);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isBookable = BOOKABLE_CATS.includes(product.category) && !product.booking_mode;
  const isAffiliate = product.category === "kit";
  const swatchIsGradient = typeof product.swatch === "string" && product.swatch.includes("gradient");

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className="pp-popup" onClick={(e) => e.stopPropagation()}>
        <button className="pp-close" onClick={onClose}>
          <Icon name="x" size={18} />
        </button>

        <div className="pp-layout">
          {/* Left — image gallery */}
          <div className="pp-gallery">
            <div
              className="pp-hero-img"
              style={{ background: heroImage ? undefined : product.swatch }}
            >
              {heroImage ? (
                <img src={heroImage} alt={product.name} className="pp-hero-photo" />
              ) : (
                <div
                  className="pp-hero-ghost"
                  style={swatchIsGradient ? { color: "rgba(255,255,255,0.9)" } : undefined}
                >
                  {product.kind}
                </div>
              )}
              {(product.coming_soon || product.badge) && (
                <div className={"pp-badge" + (product.coming_soon ? " product-badge-soon" : "")}>
                  {product.coming_soon ? "Coming soon" : product.badge}
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="pp-thumbs">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    className={"pp-thumb" + (heroImage === img.url ? " active" : "")}
                    onClick={() => setActiveImage(img.url)}
                  >
                    <img src={img.url} alt={img.label} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — product info */}
          <div className="pp-info">
            <div className="pp-eye">{product.kind}</div>
            <div className="pp-brand">{product.brand}</div>
            <h2 className="pp-name">{product.name}</h2>

            {product.product_variants && product.product_variants.length > 0 && (
              <div className="pp-variants">
                {product.product_variants.map((v) => (
                  <button
                    key={v.id}
                    className={"product-variant-btn" + (selectedVariantId === v.id ? " active" : "")}
                    onClick={() => onSelectVariant(product.id, v.id)}
                  >
                    <span className="product-variant-swatch" style={{ background: v.swatch || "#ccc" }} />
                    <span className="product-variant-name">{v.name}</span>
                  </button>
                ))}
              </div>
            )}

            <p className="pp-blurb">{product.blurb}</p>
            {product.meta && <div className="pp-meta">{product.meta}</div>}

            {product.coming_soon && product.release_date && (
              <div className="product-release">
                <Icon name="calendar" size={12} />
                {" "}Expected {new Date(product.release_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </div>
            )}

            {product.category === "course" && (
              <div className="product-course-info">
                <div className="product-course-opt">
                  <Icon name="check" size={12} />
                  <span><strong>{product.price}</strong> one-off · stream in the app</span>
                </div>
                <div className="product-course-opt product-course-opt-sub">
                  <Icon name="check" size={12} />
                  <span><strong>Free</strong> with membership · all courses included</span>
                </div>
              </div>
            )}

            <div className="pp-price-row">
              <div className="pp-price">
                {product.category !== "course" && product.price}
                {product.coming_soon && product.preorder_enabled && product.preorder_deposit && (
                  <span className="product-deposit"> · {product.preorder_deposit} deposit</span>
                )}
              </div>
              <button
                className={"pp-wishlist" + (wishlisted ? " wishlisted" : "")}
                onClick={() => onToggleWishlist(product.id)}
                aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Icon name="heart" size={16} />
                {wishlisted ? "Saved" : "Save"}
              </button>
            </div>

            <div className="pp-ctas">
              {product.coming_soon ? (
                product.preorder_enabled && product.preorder_deposit ? (
                  <button
                    className="pp-cta pp-cta-primary"
                    onClick={() => onCheckout(product)}
                    disabled={loading === product.id}
                  >
                    {loading === product.id ? "Loading\u2026" : "Pre-order now"}{" "}
                    <Icon name="arrow-right" size={14} />
                  </button>
                ) : product.preorder_enabled ? (
                  notified ? (
                    <span className="product-cta-notified">
                      <Icon name="check" size={14} /> We&apos;ll notify you
                    </span>
                  ) : (
                    <button
                      className="pp-cta pp-cta-secondary"
                      onClick={() => onNotifyMe(product.id)}
                      disabled={loading === product.id}
                    >
                      {loading === product.id ? "Loading\u2026" : "Notify me when available"}{" "}
                      <Icon name="mail" size={14} />
                    </button>
                  )
                ) : (
                  <span className="product-cta-soon">Coming soon</span>
                )
              ) : product.category === "course" ? (
                owned ? (
                  <Link href={`/courses/${product.id}`} className="pp-cta pp-cta-primary">
                    Go to course <Icon name="arrow-right" size={14} />
                  </Link>
                ) : (
                  <>
                    <button
                      className="pp-cta pp-cta-primary"
                      onClick={() => onCheckout(product)}
                      disabled={loading === product.id}
                    >
                      {loading === product.id ? "Loading\u2026" : `Buy ${product.price}`}{" "}
                      <Icon name="arrow-right" size={14} />
                    </button>
                    <Link href="/download" className="pp-cta pp-cta-sub">
                      Subscribe for all courses <Icon name="arrow-right" size={14} />
                    </Link>
                  </>
                )
              ) : product.booking_mode === "recurring" || product.booking_mode === "dated" ? (
                <button
                  className="pp-cta pp-cta-primary"
                  onClick={() => { onClose(); onDatePicker(product.id); }}
                  disabled={loading === product.id}
                >
                  View dates <Icon name="calendar" size={14} />
                </button>
              ) : product.booking_mode === "request" ? (
                <button
                  className="pp-cta pp-cta-primary"
                  onClick={() => { onClose(); onRequestCal(product.id); }}
                  disabled={loading === product.id}
                >
                  Request a date <Icon name="calendar" size={14} />
                </button>
              ) : isBookable ? (
                <button
                  className="pp-cta pp-cta-primary"
                  onClick={() => { onClose(); onViewDates(product.id); }}
                  disabled={loading === product.id}
                >
                  View dates <Icon name="calendar" size={14} />
                </button>
              ) : (
                <button
                  className="pp-cta pp-cta-primary"
                  onClick={() => onCheckout(product)}
                  disabled={loading === product.id}
                >
                  {loading === product.id ? "Loading\u2026" : ctaLabel}{" "}
                  <Icon name="arrow-right" size={14} />
                </button>
              )}
            </div>

            {isAffiliate && (
              <div className="product-note">
                <span className="affil-dot" /> Affiliate link · funds teacher training
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Date pills popup (modes: recurring + dated) ---------- */

interface DateOption {
  date: string;
  eventId?: number;
  spotsLeft?: number;
  label: string;
}

function DatePillsPopup({
  product,
  dates,
  onBook,
  onClose,
  loading,
  onNotify,
  notified,
}: {
  product: Product;
  dates: DateOption[];
  onBook: (product: Product, eventId?: number, cohortDate?: string) => void;
  onClose: () => void;
  loading: number | null;
  onNotify?: (productId: number) => void;
  notified?: boolean;
}) {
  const [selected, setSelected] = useState<number>(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (dates.length === 0) return (
    <div className="ev-cal-overlay" onClick={onClose}>
      <div className="ev-cal-popup" onClick={(e) => e.stopPropagation()}>
        <button className="ev-cal-close" onClick={onClose}><Icon name="x" size={18} /></button>
        <div className="ev-cal-header">
          <div className="ev-cal-product">
            <div className="ev-cal-brand">{product.brand}</div>
            <div className="ev-cal-name">{product.name}</div>
          </div>
        </div>
        <div className="ev-cal-empty-msg">No dates available yet.</div>
        {onNotify && (
          notified ? (
            <div className="dp-notified"><Icon name="check" size={14} /> We&apos;ll let you know when dates are added</div>
          ) : (
            <button className="dp-notify-btn" onClick={() => onNotify(product.id)} disabled={loading === product.id}>
              {loading === product.id ? "Loading\u2026" : "Notify me when available"} <Icon name="mail" size={14} />
            </button>
          )
        )}
      </div>
    </div>
  );

  const active = dates[selected];

  return (
    <div className="dp-overlay" onClick={onClose}>
      <div className="dp-popup" onClick={(e) => e.stopPropagation()}>
        <button className="dp-close" onClick={onClose}><Icon name="x" size={18} /></button>

        <div className="dp-header">
          <div className="dp-brand">{product.brand}</div>
          <div className="dp-name">{product.name}</div>
          <div className="dp-price">{product.price}</div>
        </div>

        <div className="dp-label">Choose a start date</div>
        <div className="dp-pills">
          {dates.map((d, i) => (
            <button
              key={i}
              className={"dp-pill" + (selected === i ? " active" : "")}
              onClick={() => setSelected(i)}
            >
              <span className="dp-pill-date">{d.label}</span>
              {d.spotsLeft !== undefined && (
                <span className="dp-pill-spots">
                  {d.spotsLeft > 0 ? `${d.spotsLeft} spots left` : "Full"}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          className="dp-book"
          disabled={loading === product.id || (active.spotsLeft !== undefined && active.spotsLeft <= 0)}
          onClick={() => onBook(product, active.eventId, active.eventId ? undefined : active.date)}
        >
          {loading === product.id ? "Loading\u2026" : active.spotsLeft !== undefined && active.spotsLeft <= 0 ? "Sold out" : "Book this date"}
          {" "}<Icon name="arrow-right" size={14} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Request calendar popup (mode: request) ---------- */

function RequestCalendarPopup({
  product,
  blockedDates,
  onClose,
}: {
  product: Product;
  blockedDates: string[];
  onClose: () => void;
}) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleSubmit = async () => {
    if (!selectedDate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          requested_at: `${selectedDate}T${selectedTime}:00`,
        }),
      });
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      if (data.ok) { setSubmitted(true); }
      else { alert(data.error || "Something went wrong."); }
    } catch { alert("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="dp-overlay" onClick={onClose}>
      <div className="dp-popup dp-popup-wide" onClick={(e) => e.stopPropagation()}>
        <button className="dp-close" onClick={onClose}><Icon name="x" size={18} /></button>

        <div className="dp-header">
          <div className="dp-brand">{product.brand}</div>
          <div className="dp-name">{product.name}</div>
          <div className="dp-price">{product.price}</div>
        </div>

        {submitted ? (
          <div className="rc-confirmed">
            <Icon name="check" size={20} />
            <h3>Request sent</h3>
            <p>We&apos;ll confirm your session within 24 hours. Keep an eye on your email.</p>
            <button className="dp-book" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="dp-label">Pick a date & time</div>

            <div className="ev-cal-nav">
              <button onClick={prevMonth} className="ev-cal-arrow">
                <Icon name="arrow-right" size={14} />
              </button>
              <span className="ev-cal-month">{monthNames[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} className="ev-cal-arrow ev-cal-arrow-right">
                <Icon name="arrow-right" size={14} />
              </button>
            </div>

            <div className="ev-cal-grid">
              {dayLabels.map((d) => <div key={d} className="ev-cal-day-label">{d}</div>)}
              {cells.map((day, i) => {
                if (day === null) return <div key={i} className="ev-cal-cell ev-cal-empty" />;
                const cellDate = new Date(viewYear, viewMonth, day);
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isPast = cellDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const isBlocked = blockedSet.has(dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = cellDate.getFullYear() === now.getFullYear() && cellDate.getMonth() === now.getMonth() && cellDate.getDate() === now.getDate();

                return (
                  <button
                    key={i}
                    className={
                      "ev-cal-cell" +
                      (isPast || isBlocked ? " ev-cal-past" : "") +
                      (isBlocked ? " rc-blocked" : "") +
                      (isSelected ? " ev-cal-selected" : "") +
                      (isToday ? " ev-cal-today" : "")
                    }
                    disabled={isPast || isBlocked}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="rc-time-row">
                <label className="rc-time-label">
                  Preferred time
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="rc-time-input"
                  />
                </label>
              </div>
            )}

            <button
              className="dp-book"
              disabled={!selectedDate || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Sending\u2026" : "Request this date"}{" "}<Icon name="arrow-right" size={14} />
            </button>

            <div className="rc-note">
              <Icon name="check" size={12} /> We confirm within 24 hours
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ShopClient({ products, ownedCourseIds = [] }: { products: Product[]; ownedCourseIds?: number[] }) {
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState<number | null>(null);
  const [events, setEvents] = useState<ShopEvent[]>([]);
  const [eventPicker, setEventPicker] = useState<number | null>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState<number | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [popupProduct, setPopupProduct] = useState<number | null>(null);
  const [datePicker, setDatePicker] = useState<number | null>(null);
  const [requestCal, setRequestCal] = useState<number | null>(null);
  const router = useRouter();

  // Default to first variant for each product
  useEffect(() => {
    const defaults: Record<number, number> = {};
    for (const p of products) {
      if (p.product_variants?.length) defaults[p.id] = p.product_variants[0].id;
    }
    setSelectedVariants(defaults);
  }, [products]);

  // Load wishlist (silently fails if not logged in)
  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => { if (r.ok) return r.json(); return []; })
      .then((ids: number[]) => setWishlist(new Set(ids)))
      .catch(() => {});
  }, []);

  const toggleWishlist = async (productId: number) => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (data.wishlisted) next.add(productId); else next.delete(productId);
      return next;
    });
  };

  const [recurringDates, setRecurringDates] = useState<Record<number, string[]>>({});
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          setRecurringDates(data.recurring || {});
          setBlockedDates(data.blocked_dates || []);
        } else {
          // Backwards compat: old flat array response
          setEvents(data);
        }
      })
      .catch(() => {});
  }, []);

  const getProductEvents = (productId: number) =>
    events.filter((e) => e.product_id === productId && e.status !== "cancelled");

  const handleCheckout = async (product: Product, eventId?: number, cohortDate?: string) => {
    const variant = product.product_variants?.find(
      (v) => v.id === selectedVariants[product.id]
    );
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
          variantId: variant?.id,
          variantName: variant?.name,
          isPreorder: product.coming_soon && product.preorder_enabled,
          depositPrice: product.preorder_deposit || undefined,
          cohortDate: cohortDate || undefined,
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
        console.error("Checkout error:", data);
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
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

  const [notified, setNotified] = useState<Set<number>>(new Set());

  const handleNotifyMe = async (productId: number) => {
    setLoading(productId);
    try {
      // Try notify-interest first (mailing list + conversation), fallback to preorder-interest
      const res = await fetch("/api/notify-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setNotified((prev) => new Set(prev).add(productId));
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const categories: Category[] = [
    { id: "all", label: "All" },
    { id: "course", label: "Digital courses" },
    { id: "workshop", label: "Workshops" },
    { id: "intensive", label: "Cohorts & intensives" },
    { id: "retreat", label: "Retreats" },
    { id: "journal", label: "Journals & prints" },
    { id: "kit", label: "Active wear" },
  ];

  const filtered = cat === "all" ? products : products.filter((p) => p.category === cat);

  const catMeta: Record<string, CatMeta> = {
    all: { eye: "Everything", title: <>Classes, Courses, <em>Retreats.</em></>, sub: "Workshops, intensives, retreats and the quiet things we keep on our shelf." },
    course: { eye: "Courses", title: <>Move with intention. <em>Learn at your pace.</em></>, sub: "Self-paced courses for the work beneath the work. Deepen your practice, on your own terms." },
    intensive: { eye: "Cohorts & intensives", title: <>Breathe together. <em>Grow together.</em></>, sub: "Live cohorts that ask a little more of you. Show up, on purpose." },
    workshop: { eye: "Workshops", title: <>Two a month. <em>Everything on rotation.</em></>, sub: "Single-session deep dives. Breath, alignment, restorative flow. For when a six-week cohort is too much and a class isn't enough." },
    retreat: { eye: "Retreats", title: <>Your softest era <em>starts on the mat.</em></>, sub: "A week somewhere else. No phones after dinner. Come back a little more yours." },
    journal: { eye: "Journals & prints", title: <>Put it on paper. <em>Let it go.</em></>, sub: "Paper things, printed slowly. For the pages that don't belong on a screen." },
    kit: { eye: "Active wear", title: <>Dress the practice. <em>Own the feeling.</em></>, sub: "What to wear on the mat, and to the coffee after." },
  };
  const head = catMeta[cat];

  const ctaLabel = (catId: string): string => {
    switch (catId) {
      case "course": return "Enrol";
      case "workshop": return "Book a seat";
      case "intensive": return "Join cohort";
      case "retreat": return "Book a spot";
      case "journal": return "Add to basket";
      default: return "Buy";
    }
  };

  return (
    <>
      <section className="shop-hero shop-hero-bold">
        <div className="shop-hero-inner">
          <h1 className="shop-hero-h1">{head.title}</h1>
          {head.sub && <p className="shop-hero-sub">{head.sub}</p>}
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
          <div className="sf-right">
            <Icon name="search" size={14} />
            <input placeholder="Search — 'retreat', 'journal', 'breath'…" />
          </div>
        </div>
      </section>

      <section className="shop-grid-wrap">
        <div className="shop-grid">
          {filtered.map((p) => {
            const isAffiliate = p.category === "kit";
            const swatchIsGradient =
              typeof p.swatch === "string" && p.swatch.includes("gradient");
            const selectedVariant = p.product_variants?.find(
              (v) => v.id === selectedVariants[p.id]
            );
            const displayImage = selectedVariant?.image_url || p.image_url;
            return (
              <article key={p.id} className={"product product-" + p.category} onClick={() => setPopupProduct(p.id)} style={{ cursor: "pointer" }}>
                <div
                  className="product-img"
                  style={{ background: displayImage ? undefined : p.swatch }}
                >
                  {displayImage && (
                    <img
                      src={displayImage}
                      alt={p.name}
                      className="product-photo"
                    />
                  )}
                  {(p.coming_soon || p.badge) && (
                    <div className={"product-badge" + (p.coming_soon ? " product-badge-soon" : "")}>{p.coming_soon ? "Coming soon" : p.badge}</div>
                  )}
                  <div
                    className="product-ghost"
                    style={
                      swatchIsGradient && !displayImage
                        ? { color: "rgba(255,255,255,0.9)" }
                        : undefined
                    }
                  >
                    {p.kind}
                  </div>
                  <button
                    className={"product-save" + (wishlist.has(p.id) ? " wishlisted" : "")}
                    aria-label={wishlist.has(p.id) ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                  >
                    <Icon name="heart" size={14} />
                  </button>
                </div>
                <div className="product-body">
                  <div className="product-brand">{p.brand}</div>
                  <div className="product-name">{p.name}</div>
                  {p.product_variants && p.product_variants.length > 0 && (
                    <div className="product-variants">
                      {p.product_variants.map((v) => (
                        <button
                          key={v.id}
                          className={"product-variant-btn" + (selectedVariants[p.id] === v.id ? " active" : "")}
                          onClick={(e) => { e.stopPropagation(); setSelectedVariants((prev) => ({ ...prev, [p.id]: v.id })); }}
                          title={v.name}
                        >
                          <span className="product-variant-swatch" style={{ background: v.swatch || "#ccc" }} />
                          <span className="product-variant-name">{v.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="product-blurb">{p.blurb}</p>
                  {p.meta && <div className="product-meta">{p.meta}</div>}
                  {p.coming_soon && p.release_date && (
                    <div className="product-release">
                      <Icon name="calendar" size={12} />
                      {" "}Expected {new Date(p.release_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    </div>
                  )}
                  {p.category === "course" && (
                    <div className="product-course-info">
                      <div className="product-course-opt">
                        <Icon name="check" size={12} />
                        <span><strong>{p.price}</strong> one-off · stream in the app</span>
                      </div>
                      <div className="product-course-opt product-course-opt-sub">
                        <Icon name="check" size={12} />
                        <span><strong>Free</strong> with membership · all courses included</span>
                      </div>
                    </div>
                  )}
                  <div className="product-foot">
                    <div className="product-price">
                      {p.category !== "course" && p.price}
                      {p.coming_soon && p.preorder_enabled && p.preorder_deposit && (
                        <span className="product-deposit"> · {p.preorder_deposit} deposit</span>
                      )}
                    </div>
                    {p.coming_soon ? (
                      p.preorder_enabled && p.preorder_deposit ? (
                        <button
                          className="product-cta product-cta-preorder"
                          onClick={(e) => { e.stopPropagation(); handleCheckout(p); }}
                          disabled={loading === p.id}
                        >
                          {loading === p.id ? "Loading\u2026" : "Pre-order"}{" "}
                          <Icon name="arrow-right" size={12} />
                        </button>
                      ) : p.preorder_enabled ? (
                        notified.has(p.id) ? (
                          <span className="product-cta-notified">
                            <Icon name="check" size={12} /> We&apos;ll notify you
                          </span>
                        ) : (
                          <button
                            className="product-cta product-cta-notify"
                            onClick={(e) => { e.stopPropagation(); handleNotifyMe(p.id); }}
                            disabled={loading === p.id}
                          >
                            {loading === p.id ? "Loading\u2026" : "Notify me"}{" "}
                            <Icon name="mail" size={12} />
                          </button>
                        )
                      ) : (
                        <span className="product-cta-soon">Coming soon</span>
                      )
                    ) : p.category === "course" ? (
                      ownedCourseIds.includes(p.id) ? (
                        <Link href={`/courses/${p.id}`} className="product-cta" onClick={(e) => e.stopPropagation()}>
                          Go to course <Icon name="arrow-right" size={12} />
                        </Link>
                      ) : (
                        <div className="product-course-options" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="product-cta"
                            onClick={() => handleCheckout(p)}
                            disabled={loading === p.id}
                          >
                            {loading === p.id ? "Loading\u2026" : `Buy ${p.price}`}{" "}
                            <Icon name="arrow-right" size={12} />
                          </button>
                          <Link href="/download" className="product-cta product-cta-sub">
                            Subscribe <Icon name="arrow-right" size={12} />
                          </Link>
                        </div>
                      )
                    ) : p.booking_mode === "recurring" || p.booking_mode === "dated" ? (
                      <button
                        className="product-cta"
                        onClick={(e) => { e.stopPropagation(); setDatePicker(p.id); }}
                        disabled={loading === p.id}
                      >
                        {loading === p.id ? "Loading\u2026" : "View dates"}{" "}
                        <Icon name="calendar" size={12} />
                      </button>
                    ) : p.booking_mode === "request" ? (
                      <button
                        className="product-cta"
                        onClick={(e) => { e.stopPropagation(); setRequestCal(p.id); }}
                        disabled={loading === p.id}
                      >
                        Request a date{" "}
                        <Icon name="calendar" size={12} />
                      </button>
                    ) : BOOKABLE_CATS.includes(p.category) ? (
                      <button
                        className="product-cta"
                        onClick={(e) => { e.stopPropagation(); setEventPicker(p.id); }}
                        disabled={loading === p.id}
                      >
                        {loading === p.id ? "Loading\u2026" : "View dates"}{" "}
                        <Icon name="calendar" size={12} />
                      </button>
                    ) : (
                      <button
                        className="product-cta"
                        onClick={(e) => { e.stopPropagation(); handleCheckout(p); }}
                        disabled={loading === p.id}
                      >
                        {loading === p.id ? "Loading\u2026" : ctaLabel(p.category)}{" "}
                        <Icon name="arrow-right" size={12} />
                      </button>
                    )}
                  </div>
                  {isAffiliate && (
                    <div className="product-note">
                      <span className="affil-dot" /> Affiliate link · funds
                      teacher training
                    </div>
                  )}
                </div>
              </article>
            );
          })}
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

      {popupProduct !== null && (() => {
        const product = products.find((p) => p.id === popupProduct);
        if (!product) return null;
        return (
          <ProductPopup
            product={product}
            selectedVariantId={selectedVariants[product.id]}
            onSelectVariant={(pid, vid) => setSelectedVariants((prev) => ({ ...prev, [pid]: vid }))}
            wishlisted={wishlist.has(product.id)}
            onToggleWishlist={toggleWishlist}
            onCheckout={handleCheckout}
            onViewDates={(pid) => { setPopupProduct(null); setEventPicker(pid); }}
            onDatePicker={(pid) => { setPopupProduct(null); setDatePicker(pid); }}
            onRequestCal={(pid) => { setPopupProduct(null); setRequestCal(pid); }}
            onNotifyMe={handleNotifyMe}
            notified={notified.has(product.id)}
            loading={loading}
            ctaLabel={ctaLabel(product.category)}
            onClose={() => setPopupProduct(null)}
            owned={ownedCourseIds.includes(product.id)}
          />
        );
      })()}

      {datePicker !== null && (() => {
        const product = products.find((p) => p.id === datePicker);
        if (!product) return null;

        let dates: DateOption[] = [];
        if (product.booking_mode === "recurring") {
          const rd = recurringDates[product.id] || [];
          dates = rd.map((d) => ({
            date: d,
            label: new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
          }));
        } else if (product.booking_mode === "dated") {
          const pe = getProductEvents(product.id);
          dates = pe.map((ev) => ({
            date: ev.start_at,
            eventId: ev.id,
            spotsLeft: ev.capacity - ev.booking_count,
            label: new Date(ev.start_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) +
              " \u00b7 " + new Date(ev.start_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          }));
        }

        return (
          <DatePillsPopup
            product={product}
            dates={dates}
            onBook={handleCheckout}
            onClose={() => setDatePicker(null)}
            loading={loading}
            onNotify={handleNotifyMe}
            notified={notified.has(product.id)}
          />
        );
      })()}

      {requestCal !== null && (() => {
        const product = products.find((p) => p.id === requestCal);
        if (!product) return null;
        return (
          <RequestCalendarPopup
            product={product}
            blockedDates={blockedDates}
            onClose={() => setRequestCal(null)}
          />
        );
      })()}

    </>
  );
}
