"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Icon } from "./icons";
import dynamic from "next/dynamic";
import type { User } from "@supabase/supabase-js";

const RichEditor = dynamic(() => import("./RichEditor").then((m) => m.RichEditor), {
  ssr: false,
  loading: () => <div className="adm-loading">Loading editor...</div>,
});

/* ------------------------------------------------------------------ */
/*  LogoMark (inline — no Chrome dependency)                           */
/* ------------------------------------------------------------------ */

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      className="logo-mark-svg"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="15" cy="20" r="11" stroke="var(--teal)" strokeWidth="1.6" fill="none" />
      <circle cx="25" cy="20" r="11" stroke="var(--teal)" strokeWidth="1.6" fill="none" />
      <path
        d="M20 11.3 a11 11 0 0 1 0 17.4 a11 11 0 0 1 0 -17.4 Z"
        fill="var(--teal)"
        fillOpacity="0.14"
      />
      <circle cx="20" cy="20" r="3.2" fill="var(--sun)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Stats {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  revenueAllTime: number;
  ordersMonth: number;
  ordersAllTime: number;
  totalUsers: number;
  byCategory: { category: string; revenue: number; count: number }[];
  recentOrders: {
    id: number;
    product_name: string;
    category: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }[];
}

interface Order {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  product_name: string;
  product_id: number;
  category: string;
  amount: number;
  currency: string;
  status: string;
  stripe_session_id: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  created_at: string;
  purchase_count: number;
  total_spent: number;
  is_admin: boolean;
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
}

export interface Event {
  id: number;
  product_id: number;
  title: string;
  start_at: string;
  end_at: string | null;
  location: string | null;
  capacity: number;
  notes: string | null;
  status: string;
  created_at: string;
  booking_count: number;
  waitlist_count: number;
  products?: { name: string; brand: string; category: string };
}

export interface Booking {
  id: number;
  user_id: string;
  event_id: number;
  purchase_id: number | null;
  status: string;
  created_at: string;
  cancelled_at: string | null;
  user_email: string;
  user_name: string;
  user_avatar: string | null;
  events?: { id: number; title: string; start_at: string; location: string | null; products?: { name: string; brand: string } };
}

export interface WaitlistEntry {
  id: number;
  user_id: string;
  event_id: number;
  position: number;
  created_at: string;
  user_email: string;
  user_name: string;
  user_avatar: string | null;
  events?: { id: number; title: string; start_at: string };
}

export interface MailingList {
  id: number;
  name: string;
  description: string | null;
  auto_subscribe_on: string | null;
  created_at: string;
  total_members: number;
  subscribed_members: number;
}

export interface MailingListMember {
  id: number;
  list_id: number;
  user_id: string;
  email: string;
  name: string | null;
  subscribed: boolean;
  created_at: string;
}

export interface Campaign {
  id: number;
  list_id: number | null;
  event_id: number | null;
  subject: string;
  body: string;
  from_name: string;
  from_email: string;
  status: string;
  recipient_count: number;
  sent_at: string | null;
  created_at: string;
  mailing_lists?: { name: string } | null;
  events?: { title: string } | null;
}

export interface EmailTemplate {
  id: number;
  slug: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(amount: number) {
  return `£${(amount / 100).toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

const CAT_LABELS: Record<string, string> = {
  course: "Course",
  workshop: "Workshop",
  intensive: "Cohort / Intensive",
  retreat: "Retreat",
  journal: "Journal / Print",
  kit: "Active wear",
};

/* ------------------------------------------------------------------ */
/*  AdminShell — layout with sidebar                                   */
/* ------------------------------------------------------------------ */

export function AdminShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: "spark" as const },
    { href: "/admin/orders", label: "Orders", icon: "calendar" as const },
    { href: "/admin/users", label: "Users", icon: "user" as const },
    { href: "/admin/products", label: "Products", icon: "heart" as const },
    { href: "/admin/courses", label: "Courses", icon: "book" as const },
    { href: "/admin/events", label: "Events", icon: "clock" as const },
    { href: "/admin/bookings", label: "Bookings", icon: "check" as const },
    { href: "/admin/mailing", label: "Mailing", icon: "mail" as const },
    { href: "/admin/campaigns", label: "Campaigns", icon: "play" as const },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          <LogoMark size={22} />
          <span>Admin</span>
        </Link>
        <nav className="adm-nav">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={"adm-link" + (isActive(l.href) ? " active" : "")}
            >
              <Icon name={l.icon} size={16} />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          <span className="adm-user-label">{user.email}</span>
          <Link href="/dashboard" className="adm-back">
            <Icon name="arrow-right" size={12} /> Back to site
          </Link>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview                                                           */
/* ------------------------------------------------------------------ */

export function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading">Loading...</div>;
  if (!stats) return <div className="adm-loading">Failed to load stats.</div>;

  return (
    <div>
      <h1 className="adm-h1">Overview</h1>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-label">Revenue today</div>
          <div className="adm-stat-value">{fmt(stats.revenueToday)}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">This week</div>
          <div className="adm-stat-value">{fmt(stats.revenueWeek)}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">This month</div>
          <div className="adm-stat-value">{fmt(stats.revenueMonth)}</div>
          <div className="adm-stat-sub">{stats.ordersMonth} orders</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">All time</div>
          <div className="adm-stat-value">{fmt(stats.revenueAllTime)}</div>
          <div className="adm-stat-sub">{stats.ordersAllTime} orders · {stats.totalUsers} users</div>
        </div>
      </div>

      {stats.byCategory.length > 0 && (
        <div className="adm-section">
          <h2 className="adm-h2">Revenue by category</h2>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.byCategory
                .sort((a, b) => b.revenue - a.revenue)
                .map((c) => (
                  <tr key={c.category}>
                    <td>{CAT_LABELS[c.category] || c.category}</td>
                    <td>{c.count}</td>
                    <td>{fmt(c.revenue)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {stats.recentOrders.length > 0 && (
        <div className="adm-section">
          <h2 className="adm-h2">Recent orders</h2>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.product_name}</td>
                  <td>{CAT_LABELS[o.category] || o.category}</td>
                  <td>{fmt(o.amount)}</td>
                  <td>
                    <span className={"adm-badge adm-badge-" + (o.status || "completed")}>
                      {o.status || "completed"}
                    </span>
                  </td>
                  <td>{fmtDateTime(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Users                                                              */
/* ------------------------------------------------------------------ */

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading">Loading...</div>;

  const filtered = search
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.name.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const selectedUser = selected ? users.find((u) => u.id === selected) : null;

  return (
    <div>
      <h1 className="adm-h1">Users ({users.length})</h1>

      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <Icon name="search" size={14} />
          <input
            className="adm-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {selectedUser && (
        <div className="adm-detail-card">
          <button className="adm-detail-close" onClick={() => setSelected(null)}>
            <Icon name="x" size={16} />
          </button>
          <div className="adm-detail-head">
            {selectedUser.avatar && (
              <img src={selectedUser.avatar} alt="" className="adm-detail-avatar" referrerPolicy="no-referrer" />
            )}
            <div>
              <div className="adm-detail-name">{selectedUser.name}</div>
              <div className="adm-detail-email">{selectedUser.email}</div>
            </div>
          </div>
          <div className="adm-detail-grid">
            <div>
              <span className="adm-detail-label">Signed up</span>
              <span>{fmtDate(selectedUser.created_at)}</span>
            </div>
            <div>
              <span className="adm-detail-label">Purchases</span>
              <span>{selectedUser.purchase_count}</span>
            </div>
            <div>
              <span className="adm-detail-label">Total spent</span>
              <span>{fmt(selectedUser.total_spent)}</span>
            </div>
            <div>
              <span className="adm-detail-label">Role</span>
              <span>{selectedUser.is_admin ? "Admin" : "Member"}</span>
            </div>
          </div>
          <div className="adm-detail-id">ID: {selectedUser.id}</div>
        </div>
      )}

      <table className="adm-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Signed up</th>
            <th>Purchases</th>
            <th>Total spent</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr
              key={u.id}
              className={"adm-row-click" + (selected === u.id ? " adm-row-active" : "")}
              onClick={() => setSelected(selected === u.id ? null : u.id)}
            >
              <td>
                <div className="adm-user-cell">
                  {u.avatar && (
                    <img src={u.avatar} alt="" className="adm-user-av" referrerPolicy="no-referrer" />
                  )}
                  {u.name}
                </div>
              </td>
              <td>{u.email}</td>
              <td>{fmtDate(u.created_at)}</td>
              <td>{u.purchase_count}</td>
              <td>{u.total_spent > 0 ? fmt(u.total_spent) : "—"}</td>
              <td>
                {u.is_admin && <span className="adm-badge adm-badge-admin">Admin</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Orders                                                             */
/* ------------------------------------------------------------------ */

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refunding, setRefunding] = useState<number | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleRefund = async (order: Order) => {
    if (!confirm(`Refund ${fmt(order.amount)} to ${order.user_email} for "${order.product_name}"?`)) return;
    setRefunding(order.id);
    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId: order.id }),
      });
      const data = await res.json();
      if (data.ok) {
        loadOrders();
      } else {
        alert(data.error || "Refund failed");
      }
    } catch {
      alert("Refund failed");
    } finally {
      setRefunding(null);
    }
  };

  if (loading) return <div className="adm-loading">Loading...</div>;

  const categories = ["all", ...new Set(orders.map((o) => o.category))];
  const statuses = ["all", ...new Set(orders.map((o) => o.status))];

  const filtered = orders.filter((o) => {
    if (catFilter !== "all" && o.category !== catFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const totalRevenue = filtered
    .filter((o) => o.status !== "refunded")
    .reduce((s, o) => s + o.amount, 0);

  return (
    <div>
      <h1 className="adm-h1">Orders ({orders.length})</h1>

      <div className="adm-toolbar">
        <select
          className="adm-select"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : CAT_LABELS[c] || c}
            </option>
          ))}
        </select>
        <select
          className="adm-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <div className="adm-toolbar-stat">
          Showing {filtered.length} · {fmt(totalRevenue)} revenue
        </div>
      </div>

      <table className="adm-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((o) => (
            <tr key={o.id}>
              <td className="adm-muted">{o.id}</td>
              <td>
                <div>{o.user_name}</div>
                <div className="adm-sub">{o.user_email}</div>
              </td>
              <td>{o.product_name}</td>
              <td>{CAT_LABELS[o.category] || o.category}</td>
              <td>{fmt(o.amount)}</td>
              <td>
                <span className={"adm-badge adm-badge-" + o.status}>{o.status}</span>
              </td>
              <td>{fmtDateTime(o.created_at)}</td>
              <td>
                {o.status === "completed" && (
                  <button
                    className="adm-btn-sm adm-btn-danger"
                    onClick={() => handleRefund(o)}
                    disabled={refunding === o.id}
                  >
                    {refunding === o.id ? "..." : "Refund"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Products                                                           */
/* ------------------------------------------------------------------ */

const EMPTY_PRODUCT = {
  category: "course",
  kind: "",
  brand: "Work Well Yoga",
  name: "",
  price: "",
  meta: "",
  blurb: "",
  swatch: "linear-gradient(135deg, #568F87, #3E6E67)",
  image_url: "",
  badge: "",
  sort_order: 0,
  active: true,
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setForm((prev) => ({ ...prev, image_url: data.url }));
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const loadProducts = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const startNew = () => {
    setForm(EMPTY_PRODUCT);
    setEditing("new");
  };

  const startEdit = (p: Product) => {
    setForm({
      category: p.category,
      kind: p.kind,
      brand: p.brand,
      name: p.name,
      price: p.price,
      meta: p.meta || "",
      blurb: p.blurb || "",
      swatch: p.swatch || "",
      image_url: p.image_url || "",
      badge: p.badge || "",
      sort_order: p.sort_order,
      active: p.active,
    });
    setEditing(p.id);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
  };

  const saveProduct = async () => {
    setSaving(true);
    try {
      const method = editing === "new" ? "POST" : "PUT";
      const body = editing === "new" ? form : { ...form, id: editing };
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        cancelEdit();
        loadProducts();
      }
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Delete this product permanently?")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadProducts();
  };

  const toggleActive = async (p: Product) => {
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    loadProducts();
  };

  if (loading) return <div className="adm-loading">Loading...</div>;

  return (
    <div>
      <div className="adm-h1-row">
        <h1 className="adm-h1">Products ({products.length})</h1>
        {editing === null && (
          <button className="adm-btn adm-btn-primary" onClick={startNew}>
            + Add product
          </button>
        )}
      </div>

      {editing !== null && (
        <div className="adm-form-card">
          <h3 className="adm-form-title">
            {editing === "new" ? "New product" : "Edit product"}
          </h3>
          <div className="adm-form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Brand
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="course">Course</option>
                <option value="workshop">Workshop</option>
                <option value="intensive">Cohort / Intensive</option>
                <option value="retreat">Retreat</option>
                <option value="journal">Journal / Print</option>
                <option value="kit">Active wear</option>
              </select>
            </label>
            <label>
              Price
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="£34"
              />
            </label>
            <label>
              Kind / subtitle
              <input
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
                placeholder="Self-paced · digital course"
              />
            </label>
            <label>
              Meta
              <input
                value={form.meta}
                onChange={(e) => setForm({ ...form, meta: e.target.value })}
                placeholder="6 modules · lifetime access"
              />
            </label>
            <label className="adm-form-full">
              Blurb
              <textarea
                value={form.blurb}
                onChange={(e) => setForm({ ...form, blurb: e.target.value })}
                rows={2}
              />
            </label>
            <label>
              Swatch (CSS color/gradient)
              <input
                value={form.swatch}
                onChange={(e) => setForm({ ...form, swatch: e.target.value })}
              />
            </label>
            <label className="adm-form-full">
              Product image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <span className="adm-muted">Uploading...</span>}
              {form.image_url && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={form.image_url}
                    alt="Preview"
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }}
                  />
                  <button
                    type="button"
                    className="adm-btn-sm adm-btn-danger"
                    onClick={() => setForm({ ...form, image_url: "" })}
                  >
                    Remove
                  </button>
                </div>
              )}
            </label>
            <label>
              Badge
              <input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="New, Coming soon, etc."
              />
            </label>
            <label>
              Sort order
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                }
              />
            </label>
            <label className="adm-form-check">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active (visible in shop)
            </label>
          </div>
          <div className="adm-form-actions">
            <button
              className="adm-btn adm-btn-primary"
              onClick={saveProduct}
              disabled={saving || !form.name || !form.price}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="adm-btn" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="adm-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Swatch</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Badge</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={!p.active ? "adm-row-inactive" : ""}>
              <td className="adm-muted">{p.id}</td>
              <td>
                <div
                  className="adm-swatch"
                  style={{ background: p.swatch || "#ccc" }}
                />
              </td>
              <td>
                <div>{p.brand} — {p.name}</div>
                <div className="adm-sub">{p.kind}</div>
              </td>
              <td>{CAT_LABELS[p.category] || p.category}</td>
              <td>{p.price}</td>
              <td>{p.badge && <span className="adm-badge">{p.badge}</span>}</td>
              <td>
                <button
                  className={"adm-toggle" + (p.active ? " on" : "")}
                  onClick={() => toggleActive(p)}
                  title={p.active ? "Click to hide from shop" : "Click to show in shop"}
                >
                  {p.active ? "Yes" : "No"}
                </button>
              </td>
              <td>
                <div className="adm-row-actions">
                  <button className="adm-btn-sm" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button
                    className="adm-btn-sm adm-btn-danger"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Events                                                             */
/* ------------------------------------------------------------------ */

const BOOKABLE_CATS = ["workshop", "intensive", "retreat"];

const EMPTY_EVENT = {
  product_id: 0,
  title: "",
  start_at: "",
  end_at: "",
  location: "",
  capacity: 20,
  notes: "",
  status: "open",
};

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_EVENT);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadEvents = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/events").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
    ])
      .then(([ev, pr]) => {
        setEvents(ev);
        setProducts(pr.filter((p: Product) => BOOKABLE_CATS.includes(p.category)));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const loadDetail = useCallback(async (eventId: number) => {
    setDetailLoading(true);
    const [bookingsRes, waitlistRes] = await Promise.all([
      fetch(`/api/admin/bookings?event_id=${eventId}`).then((r) => r.json()),
      fetch(`/api/admin/waitlist?event_id=${eventId}`).then((r) => r.json()),
    ]);
    setAttendees(bookingsRes);
    setWaitlist(waitlistRes);
    setDetailLoading(false);
  }, []);

  const showDetail = (eventId: number) => {
    setDetail(eventId);
    loadDetail(eventId);
  };

  const startNew = () => {
    setForm({ ...EMPTY_EVENT, product_id: products[0]?.id || 0 });
    setEditing("new");
  };

  const startEdit = (ev: Event) => {
    setForm({
      product_id: ev.product_id,
      title: ev.title,
      start_at: ev.start_at.slice(0, 16),
      end_at: ev.end_at?.slice(0, 16) || "",
      location: ev.location || "",
      capacity: ev.capacity,
      notes: ev.notes || "",
      status: ev.status,
    });
    setEditing(ev.id);
  };

  const saveEvent = async () => {
    setSaving(true);
    try {
      const method = editing === "new" ? "POST" : "PUT";
      const body = editing === "new" ? form : { ...form, id: editing };
      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); } else { setEditing(null); loadEvents(); }
    } catch { alert("Save failed"); }
    finally { setSaving(false); }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("Delete this event? All bookings and waitlist entries will be removed.")) return;
    await fetch("/api/admin/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (detail === id) setDetail(null);
    loadEvents();
  };

  const cancelBooking = async (bookingId: number) => {
    if (!confirm("Cancel this booking?")) return;
    await fetch("/api/admin/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: "cancelled" }),
    });
    if (detail) loadDetail(detail);
    loadEvents();
  };

  const markNoShow = async (bookingId: number) => {
    await fetch("/api/admin/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: "no-show" }),
    });
    if (detail) loadDetail(detail);
  };

  const promoteWaitlist = async (waitlistId: number) => {
    if (!confirm("Promote this person from waitlist to confirmed booking?")) return;
    await fetch("/api/admin/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waitlist_id: waitlistId }),
    });
    if (detail) loadDetail(detail);
    loadEvents();
  };

  const removeFromWaitlist = async (waitlistId: number) => {
    if (!confirm("Remove from waitlist?")) return;
    await fetch("/api/admin/waitlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: waitlistId }),
    });
    if (detail) loadDetail(detail);
    loadEvents();
  };

  if (loading) return <div className="adm-loading">Loading...</div>;

  const filtered = statusFilter === "all" ? events : events.filter((e) => e.status === statusFilter);
  const detailEvent = detail ? events.find((e) => e.id === detail) : null;

  return (
    <div>
      <div className="adm-h1-row">
        <h1 className="adm-h1">Events ({events.length})</h1>
        {editing === null && (
          <button className="adm-btn adm-btn-primary" onClick={startNew}>
            + Add event
          </button>
        )}
      </div>

      {editing !== null && (
        <div className="adm-form-card">
          <h3 className="adm-form-title">{editing === "new" ? "New event" : "Edit event"}</h3>
          <div className="adm-form-grid">
            <label>
              Product
              <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.brand} — {p.name} ({CAT_LABELS[p.category]})</option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Paired Yin — May 2026" />
            </label>
            <label>
              Start date & time
              <input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
            </label>
            <label>
              End date & time
              <input type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
            </label>
            <label>
              Location
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Studio, London / Zoom" />
            </label>
            <label>
              Capacity
              <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} />
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="full">Full</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="adm-form-full">
              Notes (admin only)
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </label>
          </div>
          <div className="adm-form-actions">
            <button className="adm-btn adm-btn-primary" onClick={saveEvent} disabled={saving || !form.title || !form.start_at}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="adm-btn" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="adm-toolbar">
        <select className="adm-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="full">Full</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Event detail panel */}
      {detailEvent && (
        <div className="adm-detail-card">
          <button className="adm-detail-close" onClick={() => setDetail(null)}>
            <Icon name="x" size={16} />
          </button>
          <h3 className="adm-form-title">{detailEvent.title}</h3>
          <div className="adm-detail-grid" style={{ marginBottom: 20 }}>
            <div>
              <span className="adm-detail-label">Date</span>
              <span>{fmtDateTime(detailEvent.start_at)}</span>
            </div>
            <div>
              <span className="adm-detail-label">Location</span>
              <span>{detailEvent.location || "—"}</span>
            </div>
            <div>
              <span className="adm-detail-label">Capacity</span>
              <span>{detailEvent.booking_count} / {detailEvent.capacity}</span>
            </div>
            <div>
              <span className="adm-detail-label">Waitlist</span>
              <span>{detailEvent.waitlist_count}</span>
            </div>
          </div>

          {detailLoading ? (
            <div className="adm-loading">Loading attendees...</div>
          ) : (
            <>
              <h4 style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 8px" }}>
                Attendees ({attendees.filter((a) => a.status === "confirmed").length})
              </h4>
              {attendees.length > 0 ? (
                <table className="adm-table" style={{ marginBottom: 20 }}>
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Status</th><th>Booked</th><th></th></tr>
                  </thead>
                  <tbody>
                    {attendees.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div className="adm-user-cell">
                            {a.user_avatar && <img src={a.user_avatar} alt="" className="adm-user-av" referrerPolicy="no-referrer" />}
                            {a.user_name}
                          </div>
                        </td>
                        <td>{a.user_email}</td>
                        <td><span className={"adm-badge adm-badge-" + a.status}>{a.status}</span></td>
                        <td>{fmtDate(a.created_at)}</td>
                        <td>
                          <div className="adm-row-actions">
                            {a.status === "confirmed" && (
                              <>
                                <button className="adm-btn-sm" onClick={() => markNoShow(a.id)}>No-show</button>
                                <button className="adm-btn-sm adm-btn-danger" onClick={() => cancelBooking(a.id)}>Cancel</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="adm-muted" style={{ marginBottom: 20 }}>No bookings yet.</p>
              )}

              <h4 style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 8px" }}>
                Waitlist ({waitlist.length})
              </h4>
              {waitlist.length > 0 ? (
                <table className="adm-table">
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Email</th><th>Joined</th><th></th></tr>
                  </thead>
                  <tbody>
                    {waitlist.map((w) => (
                      <tr key={w.id}>
                        <td className="adm-muted">{w.position}</td>
                        <td>
                          <div className="adm-user-cell">
                            {w.user_avatar && <img src={w.user_avatar} alt="" className="adm-user-av" referrerPolicy="no-referrer" />}
                            {w.user_name}
                          </div>
                        </td>
                        <td>{w.user_email}</td>
                        <td>{fmtDate(w.created_at)}</td>
                        <td>
                          <div className="adm-row-actions">
                            <button className="adm-btn-sm adm-btn-primary" style={{ color: "#fff" }} onClick={() => promoteWaitlist(w.id)}>Promote</button>
                            <button className="adm-btn-sm adm-btn-danger" onClick={() => removeFromWaitlist(w.id)}>Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="adm-muted">No one on waitlist.</p>
              )}
            </>
          )}
        </div>
      )}

      <table className="adm-table">
        <thead>
          <tr><th>ID</th><th>Product</th><th>Event</th><th>Date</th><th>Location</th><th>Booked</th><th>Waitlist</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {filtered.map((ev) => (
            <tr key={ev.id} className={"adm-row-click" + (detail === ev.id ? " adm-row-active" : "")} onClick={() => showDetail(ev.id)}>
              <td className="adm-muted">{ev.id}</td>
              <td>{ev.products ? `${ev.products.brand} — ${ev.products.name}` : "—"}</td>
              <td>{ev.title}</td>
              <td>{fmtDateTime(ev.start_at)}</td>
              <td>{ev.location || "—"}</td>
              <td>{ev.booking_count} / {ev.capacity}</td>
              <td>{ev.waitlist_count > 0 ? ev.waitlist_count : "—"}</td>
              <td><span className={"adm-badge adm-badge-" + ev.status}>{ev.status}</span></td>
              <td>
                <div className="adm-row-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="adm-btn-sm" onClick={() => startEdit(ev)}>Edit</button>
                  <button className="adm-btn-sm adm-btn-danger" onClick={() => deleteEvent(ev.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bookings (all bookings view)                                       */
/* ------------------------------------------------------------------ */

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancelBooking = async (id: number) => {
    if (!confirm("Cancel this booking?")) return;
    await fetch("/api/admin/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "cancelled" }),
    });
    load();
  };

  if (loading) return <div className="adm-loading">Loading...</div>;

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.user_name.toLowerCase().includes(q) ||
        b.user_email.toLowerCase().includes(q) ||
        (b.events?.title || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <h1 className="adm-h1">All Bookings ({bookings.length})</h1>

      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <Icon name="search" size={14} />
          <input className="adm-search" placeholder="Search by name, email, or event..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="adm-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No-show</option>
        </select>
      </div>

      <table className="adm-table">
        <thead>
          <tr><th>User</th><th>Event</th><th>Date</th><th>Location</th><th>Status</th><th>Booked</th><th></th></tr>
        </thead>
        <tbody>
          {filtered.map((b) => (
            <tr key={b.id}>
              <td>
                <div className="adm-user-cell">
                  {b.user_avatar && <img src={b.user_avatar} alt="" className="adm-user-av" referrerPolicy="no-referrer" />}
                  <div>
                    <div>{b.user_name}</div>
                    <div className="adm-sub">{b.user_email}</div>
                  </div>
                </div>
              </td>
              <td>{b.events?.title || "—"}</td>
              <td>{b.events?.start_at ? fmtDateTime(b.events.start_at) : "—"}</td>
              <td>{b.events?.location || "—"}</td>
              <td><span className={"adm-badge adm-badge-" + b.status}>{b.status}</span></td>
              <td>{fmtDate(b.created_at)}</td>
              <td>
                {b.status === "confirmed" && (
                  <button className="adm-btn-sm adm-btn-danger" onClick={() => cancelBooking(b.id)}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mailing Lists                                                      */
/* ------------------------------------------------------------------ */

export function AdminMailing() {
  const [lists, setLists] = useState<MailingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ name: "", description: "", auto_subscribe_on: "" });
  const [saving, setSaving] = useState(false);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [members, setMembers] = useState<MailingListMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const loadLists = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/mailing-lists").then((r) => r.json()),
      fetch("/api/admin/events").then((r) => r.json()),
    ])
      .then(([l, e]) => { setLists(l); setEvents(e); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadLists(); }, [loadLists]);

  const loadMembers = async (listId: number) => {
    setMembersLoading(true);
    const data = await fetch(`/api/admin/mailing-lists/members?list_id=${listId}`).then((r) => r.json());
    setMembers(data);
    setMembersLoading(false);
  };

  const showMembers = (listId: number) => {
    setSelectedList(listId);
    loadMembers(listId);
  };

  const startNew = () => {
    setForm({ name: "", description: "", auto_subscribe_on: "" });
    setEditing("new");
  };

  const startEdit = (list: MailingList) => {
    setForm({
      name: list.name,
      description: list.description || "",
      auto_subscribe_on: list.auto_subscribe_on || "",
    });
    setEditing(list.id);
  };

  const saveList = async () => {
    setSaving(true);
    try {
      const method = editing === "new" ? "POST" : "PUT";
      const body = editing === "new" ? form : { ...form, id: editing };
      const res = await fetch("/api/admin/mailing-lists", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); } else { setEditing(null); loadLists(); }
    } catch { alert("Save failed"); }
    finally { setSaving(false); }
  };

  const deleteList = async (id: number) => {
    if (!confirm("Delete this mailing list and all its members?")) return;
    await fetch("/api/admin/mailing-lists", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (selectedList === id) setSelectedList(null);
    loadLists();
  };

  const removeMember = async (memberId: number) => {
    await fetch("/api/admin/mailing-lists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove-member", member_id: memberId }),
    });
    if (selectedList) loadMembers(selectedList);
    loadLists();
  };

  const toggleSubscribe = async (memberId: number, subscribed: boolean) => {
    await fetch("/api/admin/mailing-lists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-subscribe", member_id: memberId, subscribed }),
    });
    if (selectedList) loadMembers(selectedList);
    loadLists();
  };

  const importFromEvent = async (eventId: number) => {
    if (!selectedList) return;
    const res = await fetch("/api/admin/mailing-lists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-event-attendees", list_id: selectedList, event_id: eventId }),
    });
    const data = await res.json();
    alert(`Added ${data.added} members from event.`);
    loadMembers(selectedList);
    loadLists();
  };

  if (loading) return <div className="adm-loading">Loading...</div>;

  const selectedListData = selectedList ? lists.find((l) => l.id === selectedList) : null;

  return (
    <div>
      <div className="adm-h1-row">
        <h1 className="adm-h1">Mailing Lists ({lists.length})</h1>
        {editing === null && (
          <button className="adm-btn adm-btn-primary" onClick={startNew}>+ New list</button>
        )}
      </div>

      {editing !== null && (
        <div className="adm-form-card">
          <h3 className="adm-form-title">{editing === "new" ? "New mailing list" : "Edit list"}</h3>
          <div className="adm-form-grid">
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Auto-subscribe on
              <select value={form.auto_subscribe_on} onChange={(e) => setForm({ ...form, auto_subscribe_on: e.target.value })}>
                <option value="">None (manual only)</option>
                <option value="signup">User signup</option>
                <option value="workshop">Workshop purchase</option>
                <option value="intensive">Cohort/intensive purchase</option>
                <option value="retreat">Retreat purchase</option>
                <option value="purchase">Any purchase</option>
              </select>
            </label>
            <label className="adm-form-full">
              Description
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
          </div>
          <div className="adm-form-actions">
            <button className="adm-btn adm-btn-primary" onClick={saveList} disabled={saving || !form.name}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="adm-btn" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Members panel */}
      {selectedListData && (
        <div className="adm-detail-card">
          <button className="adm-detail-close" onClick={() => setSelectedList(null)}>
            <Icon name="x" size={16} />
          </button>
          <h3 className="adm-form-title">{selectedListData.name} — Members</h3>
          <p className="adm-sub" style={{ marginBottom: 16 }}>
            {selectedListData.subscribed_members} subscribed / {selectedListData.total_members} total
          </p>

          <div className="adm-toolbar">
            <select className="adm-select" onChange={(e) => { if (e.target.value) importFromEvent(Number(e.target.value)); e.target.value = ""; }}>
              <option value="">Import from event...</option>
              {events.filter((e) => e.status !== "cancelled").map((e) => (
                <option key={e.id} value={e.id}>{e.title} ({fmtDate(e.start_at)})</option>
              ))}
            </select>
          </div>

          {membersLoading ? (
            <div className="adm-loading">Loading members...</div>
          ) : members.length > 0 ? (
            <table className="adm-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Subscribed</th><th>Added</th><th></th></tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name || "—"}</td>
                    <td>{m.email}</td>
                    <td>
                      <button className={"adm-toggle" + (m.subscribed ? " on" : "")} onClick={() => toggleSubscribe(m.id, !m.subscribed)}>
                        {m.subscribed ? "Yes" : "No"}
                      </button>
                    </td>
                    <td>{fmtDate(m.created_at)}</td>
                    <td>
                      <button className="adm-btn-sm adm-btn-danger" onClick={() => removeMember(m.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="adm-muted">No members yet.</p>
          )}
        </div>
      )}

      <table className="adm-table">
        <thead>
          <tr><th>Name</th><th>Description</th><th>Auto-subscribe</th><th>Members</th><th>Subscribed</th><th></th></tr>
        </thead>
        <tbody>
          {lists.map((l) => (
            <tr key={l.id} className={"adm-row-click" + (selectedList === l.id ? " adm-row-active" : "")} onClick={() => showMembers(l.id)}>
              <td style={{ fontWeight: 500 }}>{l.name}</td>
              <td>{l.description || "—"}</td>
              <td>{l.auto_subscribe_on ? <span className="adm-badge">{l.auto_subscribe_on}</span> : "—"}</td>
              <td>{l.total_members}</td>
              <td>{l.subscribed_members}</td>
              <td>
                <div className="adm-row-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="adm-btn-sm" onClick={() => startEdit(l)}>Edit</button>
                  <button className="adm-btn-sm adm-btn-danger" onClick={() => deleteList(l.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Campaigns                                                          */
/* ------------------------------------------------------------------ */

export function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [lists, setLists] = useState<MailingList[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ list_id: 0, event_id: 0, subject: "", body: "", from_name: "Work Well Yoga", from_email: "hello@workwellyoga.com" });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const [tab, setTab] = useState<"campaigns" | "templates">("campaigns");
  const [editingTemplate, setEditingTemplate] = useState<number | "new" | null>(null);
  const [templateForm, setTemplateForm] = useState({ slug: "", name: "", subject: "", body: "" });
  const [templateSaving, setTemplateSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/campaigns").then((r) => r.json()),
      fetch("/api/admin/mailing-lists").then((r) => r.json()),
      fetch("/api/admin/events").then((r) => r.json()),
      fetch("/api/admin/email-templates").then((r) => r.json()),
    ])
      .then(([c, l, e, t]) => { setCampaigns(c); setLists(l); setEvents(e); setTemplates(t); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setForm({ list_id: lists[0]?.id || 0, event_id: 0, subject: "", body: "", from_name: "Work Well Yoga", from_email: "hello@workwellyoga.com" });
    setEditing("new");
  };

  const startEdit = (c: Campaign) => {
    setForm({
      list_id: c.list_id || 0,
      event_id: c.event_id || 0,
      subject: c.subject,
      body: c.body,
      from_name: c.from_name,
      from_email: c.from_email,
    });
    setEditing(c.id);
  };

  const saveCampaign = async () => {
    setSaving(true);
    try {
      const method = editing === "new" ? "POST" : "PUT";
      const body = editing === "new" ? form : { ...form, id: editing };
      if (body.list_id === 0) delete (body as Record<string, unknown>).list_id;
      if (body.event_id === 0) delete (body as Record<string, unknown>).event_id;
      const res = await fetch("/api/admin/campaigns", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); } else { setEditing(null); load(); }
    } catch { alert("Save failed"); }
    finally { setSaving(false); }
  };

  const sendCampaign = async (id: number) => {
    if (!confirm("Send this campaign? (Note: emails won't actually send until Resend is configured with your domain.)")) return;
    const res = await fetch("/api/admin/campaigns", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "send" }),
    });
    const data = await res.json();
    if (data.ok) {
      alert(`Campaign marked as sent to ${data.recipient_count} recipients. (Emails will send once Resend is configured.)`);
      load();
    } else {
      alert(data.error || "Send failed");
    }
  };

  const deleteCampaign = async (id: number) => {
    if (!confirm("Delete this campaign?")) return;
    await fetch("/api/admin/campaigns", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  // Templates
  const startNewTemplate = () => {
    setTemplateForm({ slug: "", name: "", subject: "", body: "" });
    setEditingTemplate("new");
  };

  const startEditTemplate = (t: EmailTemplate) => {
    setTemplateForm({ slug: t.slug, name: t.name, subject: t.subject, body: t.body });
    setEditingTemplate(t.id);
  };

  const saveTemplate = async () => {
    setTemplateSaving(true);
    try {
      const method = editingTemplate === "new" ? "POST" : "PUT";
      const body = editingTemplate === "new" ? templateForm : { ...templateForm, id: editingTemplate };
      const res = await fetch("/api/admin/email-templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); } else { setEditingTemplate(null); load(); }
    } catch { alert("Save failed"); }
    finally { setTemplateSaving(false); }
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    await fetch("/api/admin/email-templates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  if (loading) return <div className="adm-loading">Loading...</div>;

  const previewCampaign = preview ? campaigns.find((c) => c.id === preview) : null;

  return (
    <div>
      <div className="adm-h1-row">
        <h1 className="adm-h1">Email</h1>
        <div className="adm-tab-bar">
          <button className={"adm-tab" + (tab === "campaigns" ? " active" : "")} onClick={() => setTab("campaigns")}>Campaigns</button>
          <button className={"adm-tab" + (tab === "templates" ? " active" : "")} onClick={() => setTab("templates")}>Templates</button>
        </div>
      </div>

      {tab === "campaigns" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            {editing === null && (
              <button className="adm-btn adm-btn-primary" onClick={startNew}>+ New campaign</button>
            )}
          </div>

          {editing !== null && (
            <div className="adm-form-card">
              <h3 className="adm-form-title">{editing === "new" ? "New campaign" : "Edit campaign"}</h3>
              <div className="adm-form-grid">
                <label>
                  Subject
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Email subject line" />
                </label>
                <label>
                  Send to
                  <select value={form.list_id || form.event_id ? "list" : ""} onChange={(e) => {
                    if (e.target.value === "") { setForm({ ...form, list_id: 0, event_id: 0 }); }
                  }}>
                    <option value="">Choose audience...</option>
                    <optgroup label="Mailing lists">
                      {lists.map((l) => (
                        <option key={`l-${l.id}`} value={`list-${l.id}`} onClick={() => setForm({ ...form, list_id: l.id, event_id: 0 })}>
                          {l.name} ({l.subscribed_members} subscribed)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Event attendees">
                      {events.filter((e) => e.status !== "cancelled").map((e) => (
                        <option key={`e-${e.id}`} value={`event-${e.id}`} onClick={() => setForm({ ...form, event_id: e.id, list_id: 0 })}>
                          {e.title} ({e.booking_count} booked)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>
                <label>
                  From name
                  <input value={form.from_name} onChange={(e) => setForm({ ...form, from_name: e.target.value })} />
                </label>
                <label>
                  From email
                  <input value={form.from_email} onChange={(e) => setForm({ ...form, from_email: e.target.value })} />
                </label>
                <label className="adm-form-full">
                  Audience
                  <select onChange={(e) => {
                    const v = e.target.value;
                    if (v.startsWith("list-")) setForm({ ...form, list_id: Number(v.split("-")[1]), event_id: 0 });
                    else if (v.startsWith("event-")) setForm({ ...form, event_id: Number(v.split("-")[1]), list_id: 0 });
                    else setForm({ ...form, list_id: 0, event_id: 0 });
                  }} value={form.list_id ? `list-${form.list_id}` : form.event_id ? `event-${form.event_id}` : ""}>
                    <option value="">Choose audience...</option>
                    <optgroup label="Mailing lists">
                      {lists.map((l) => (
                        <option key={`l-${l.id}`} value={`list-${l.id}`}>{l.name} ({l.subscribed_members} subscribed)</option>
                      ))}
                    </optgroup>
                    <optgroup label="Event attendees">
                      {events.filter((e) => e.status !== "cancelled").map((e) => (
                        <option key={`e-${e.id}`} value={`event-${e.id}`}>{e.title} ({e.booking_count} booked)</option>
                      ))}
                    </optgroup>
                  </select>
                </label>
                <div className="adm-form-full">
                  <label style={{ marginBottom: 8, display: "block" }}>Body</label>
                  <RichEditor content={form.body} onChange={(html) => setForm({ ...form, body: html })} />
                </div>
              </div>
              <div className="adm-form-actions">
                <button className="adm-btn adm-btn-primary" onClick={saveCampaign} disabled={saving || !form.subject}>
                  {saving ? "Saving..." : "Save draft"}
                </button>
                <button className="adm-btn" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewCampaign && (
            <div className="adm-detail-card">
              <button className="adm-detail-close" onClick={() => setPreview(null)}>
                <Icon name="x" size={16} />
              </button>
              <h3 className="adm-form-title">Preview: {previewCampaign.subject}</h3>
              <div className="adm-email-preview" dangerouslySetInnerHTML={{ __html: previewCampaign.body }} />
            </div>
          )}

          <table className="adm-table">
            <thead>
              <tr><th>Subject</th><th>Audience</th><th>Recipients</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className={"adm-row-click" + (preview === c.id ? " adm-row-active" : "")} onClick={() => setPreview(preview === c.id ? null : c.id)}>
                  <td style={{ fontWeight: 500 }}>{c.subject}</td>
                  <td>{c.mailing_lists?.name || c.events?.title || "—"}</td>
                  <td>{c.recipient_count > 0 ? c.recipient_count : "—"}</td>
                  <td><span className={"adm-badge adm-badge-" + c.status}>{c.status}</span></td>
                  <td>{c.sent_at ? fmtDateTime(c.sent_at) : fmtDate(c.created_at)}</td>
                  <td>
                    <div className="adm-row-actions" onClick={(e) => e.stopPropagation()}>
                      {c.status === "draft" && (
                        <>
                          <button className="adm-btn-sm" onClick={() => startEdit(c)}>Edit</button>
                          <button className="adm-btn-sm adm-btn-primary" style={{ color: "#fff" }} onClick={() => sendCampaign(c.id)}>Send</button>
                        </>
                      )}
                      <button className="adm-btn-sm adm-btn-danger" onClick={() => deleteCampaign(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr><td colSpan={6} className="adm-muted" style={{ textAlign: "center", padding: 32 }}>No campaigns yet. Create your first one.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {tab === "templates" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            {editingTemplate === null && (
              <button className="adm-btn adm-btn-primary" onClick={startNewTemplate}>+ New template</button>
            )}
          </div>

          {editingTemplate !== null && (
            <div className="adm-form-card">
              <h3 className="adm-form-title">{editingTemplate === "new" ? "New template" : "Edit template"}</h3>
              <div className="adm-form-grid">
                <label>
                  Name
                  <input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="e.g. Booking Confirmed" />
                </label>
                <label>
                  Slug
                  <input value={templateForm.slug} onChange={(e) => setTemplateForm({ ...templateForm, slug: e.target.value })} placeholder="e.g. booking-confirmed" disabled={editingTemplate !== "new"} />
                </label>
                <label className="adm-form-full">
                  Subject
                  <input value={templateForm.subject} onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })} placeholder="Use {{event_title}}, {{name}} etc." />
                </label>
                <div className="adm-form-full">
                  <label style={{ marginBottom: 8, display: "block" }}>Body</label>
                  <RichEditor content={templateForm.body} onChange={(html) => setTemplateForm({ ...templateForm, body: html })} />
                </div>
              </div>
              <p className="adm-sub" style={{ margin: "12px 0 0" }}>
                Variables: {"{{name}}"}, {"{{event_title}}"}, {"{{event_date}}"}, {"{{event_location}}"}, {"{{position}}"}
              </p>
              <div className="adm-form-actions">
                <button className="adm-btn adm-btn-primary" onClick={saveTemplate} disabled={templateSaving || !templateForm.name || !templateForm.slug}>
                  {templateSaving ? "Saving..." : "Save"}
                </button>
                <button className="adm-btn" onClick={() => setEditingTemplate(null)}>Cancel</button>
              </div>
            </div>
          )}

          <table className="adm-table">
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Subject</th><th></th></tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td><code className="adm-muted">{t.slug}</code></td>
                  <td>{t.subject}</td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-btn-sm" onClick={() => startEditTemplate(t)}>Edit</button>
                      <button className="adm-btn-sm adm-btn-danger" onClick={() => deleteTemplate(t.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Courses — module & lesson management                               */
/* ------------------------------------------------------------------ */

interface CourseProduct {
  id: number;
  name: string;
  brand: string;
  active: boolean;
  module_count: number;
  lesson_count: number;
}

interface CourseModule {
  id: number;
  product_id: number;
  title: string;
  sort_order: number;
  course_lessons: CourseLesson[];
}

interface CourseLesson {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  content_html: string;
  video_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
  course_resources: CourseResource[];
}

interface CourseResource {
  id: number;
  lesson_id: number;
  name: string;
  url: string;
  file_type: string;
}

export function AdminCourses() {
  const [products, setProducts] = useState<CourseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<CourseProduct | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  // Module form
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModule, setEditingModule] = useState<number | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");

  // Lesson form
  const [editingLesson, setEditingLesson] = useState<number | "new" | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", content_html: "", video_url: "", duration_minutes: "" });
  const [lessonSaving, setLessonSaving] = useState(false);

  // Resource form
  const [addingResource, setAddingResource] = useState<number | null>(null);
  const [resourceForm, setResourceForm] = useState({ name: "", url: "", file_type: "pdf" });

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/admin/courses");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const fetchModules = useCallback(async (productId: number) => {
    setModulesLoading(true);
    try {
      const res = await fetch(`/api/admin/courses?product_id=${productId}`);
      const data = await res.json();
      setModules(Array.isArray(data) ? data : []);
    } catch {
      setModules([]);
    }
    setModulesLoading(false);
  }, []);

  const selectProduct = (p: CourseProduct) => {
    setSelectedProduct(p);
    setEditingLesson(null);
    fetchModules(p.id);
  };

  const goBack = () => {
    setSelectedProduct(null);
    setModules([]);
    setEditingLesson(null);
    fetchProducts();
  };

  /* Module actions */
  const addModule = async () => {
    if (!newModuleTitle.trim() || !selectedProduct) return;
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "module", product_id: selectedProduct.id, title: newModuleTitle }),
    });
    setNewModuleTitle("");
    fetchModules(selectedProduct.id);
  };

  const saveModuleTitle = async (id: number) => {
    await fetch("/api/admin/courses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "module", id, title: editModuleTitle }),
    });
    setEditingModule(null);
    if (selectedProduct) fetchModules(selectedProduct.id);
  };

  const deleteModule = async (id: number) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "module", id }),
    });
    if (selectedProduct) fetchModules(selectedProduct.id);
  };

  /* Lesson actions */
  const startNewLesson = (moduleId: number) => {
    setLessonModuleId(moduleId);
    setEditingLesson("new");
    setLessonForm({ title: "", content_html: "", video_url: "", duration_minutes: "" });
  };

  const startEditLesson = (lesson: CourseLesson) => {
    setLessonModuleId(lesson.module_id);
    setEditingLesson(lesson.id);
    setLessonForm({
      title: lesson.title,
      content_html: lesson.content_html,
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes?.toString() || "",
    });
  };

  const saveLesson = async () => {
    if (!lessonForm.title.trim()) return;
    setLessonSaving(true);
    try {
      if (editingLesson === "new") {
        await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "lesson",
            module_id: lessonModuleId,
            title: lessonForm.title,
            content_html: lessonForm.content_html,
            video_url: lessonForm.video_url || null,
            duration_minutes: lessonForm.duration_minutes ? parseInt(lessonForm.duration_minutes) : null,
          }),
        });
      } else {
        await fetch("/api/admin/courses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "lesson",
            id: editingLesson,
            title: lessonForm.title,
            content_html: lessonForm.content_html,
            video_url: lessonForm.video_url || null,
            duration_minutes: lessonForm.duration_minutes ? parseInt(lessonForm.duration_minutes) : null,
          }),
        });
      }
      setEditingLesson(null);
      if (selectedProduct) fetchModules(selectedProduct.id);
    } finally {
      setLessonSaving(false);
    }
  };

  const deleteLesson = async (id: number) => {
    if (!confirm("Delete this lesson?")) return;
    await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "lesson", id }),
    });
    if (selectedProduct) fetchModules(selectedProduct.id);
  };

  /* Resource actions */
  const addResource = async (lessonId: number) => {
    if (!resourceForm.name.trim() || !resourceForm.url.trim()) return;
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "resource", lesson_id: lessonId, ...resourceForm }),
    });
    setAddingResource(null);
    setResourceForm({ name: "", url: "", file_type: "pdf" });
    if (selectedProduct) fetchModules(selectedProduct.id);
  };

  const deleteResource = async (id: number) => {
    await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "resource", id }),
    });
    if (selectedProduct) fetchModules(selectedProduct.id);
  };

  if (loading) return <div className="adm-loading">Loading...</div>;

  /* ---- Product list view ---- */
  if (!selectedProduct) {
    return (
      <div>
        <h1 className="adm-h1">Courses</h1>
        <p className="adm-sub">Manage modules and lessons for your digital courses.</p>

        {products.length === 0 ? (
          <p className="adm-sub">No course products found. Create a product with category &quot;Course&quot; first.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Modules</th>
                <th>Lessons</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div className="adm-muted">{p.brand}</div>
                  </td>
                  <td>{p.module_count}</td>
                  <td>{p.lesson_count}</td>
                  <td>
                    <span className={"adm-badge adm-badge-" + (p.active ? "confirmed" : "cancelled")}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button className="adm-btn-sm" onClick={() => selectProduct(p)}>
                      Manage content
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  /* ---- Course content editor ---- */
  return (
    <div>
      <div className="adm-toolbar">
        <button className="adm-btn" onClick={goBack}>
          <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><Icon name="arrow-right" size={14} /></span> Back
        </button>
        <h1 className="adm-h1" style={{ margin: 0 }}>{selectedProduct.name}</h1>
      </div>

      {modulesLoading ? (
        <div className="adm-loading">Loading modules...</div>
      ) : (
        <>
          {/* Lesson editor panel */}
          {editingLesson !== null && (
            <div className="adm-form-card" style={{ marginBottom: 24 }}>
              <h3 className="adm-form-title">{editingLesson === "new" ? "New lesson" : "Edit lesson"}</h3>
              <div className="adm-form-grid">
                <label>
                  Title
                  <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
                </label>
                <label>
                  Video URL
                  <input value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} placeholder="YouTube or Vimeo embed URL" />
                </label>
                <label>
                  Duration (minutes)
                  <input type="number" value={lessonForm.duration_minutes} onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })} />
                </label>
                <div className="adm-form-full">
                  <label style={{ marginBottom: 8, display: "block" }}>Content</label>
                  <RichEditor content={lessonForm.content_html} onChange={(html) => setLessonForm({ ...lessonForm, content_html: html })} />
                </div>
              </div>
              <div className="adm-form-actions">
                <button className="adm-btn adm-btn-primary" onClick={saveLesson} disabled={lessonSaving || !lessonForm.title.trim()}>
                  {lessonSaving ? "Saving..." : "Save lesson"}
                </button>
                <button className="adm-btn" onClick={() => setEditingLesson(null)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Module list */}
          <div className="adm-course-modules">
            {modules.map((mod, mi) => (
              <div key={mod.id} className="adm-course-module">
                <div className="adm-course-module-head">
                  <span className="adm-course-module-num">{mi + 1}</span>
                  {editingModule === mod.id ? (
                    <div style={{ display: "flex", gap: 8, flex: 1 }}>
                      <input
                        className="adm-course-module-input"
                        value={editModuleTitle}
                        onChange={(e) => setEditModuleTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveModuleTitle(mod.id)}
                        autoFocus
                      />
                      <button className="adm-btn-sm" onClick={() => saveModuleTitle(mod.id)}>Save</button>
                      <button className="adm-btn-sm" onClick={() => setEditingModule(null)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span className="adm-course-module-title">{mod.title}</span>
                      <span className="adm-muted">{mod.course_lessons.length} lesson{mod.course_lessons.length !== 1 ? "s" : ""}</span>
                      <div className="adm-row-actions">
                        <button className="adm-btn-sm" onClick={() => { setEditingModule(mod.id); setEditModuleTitle(mod.title); }}>Rename</button>
                        <button className="adm-btn-sm adm-btn-danger" onClick={() => deleteModule(mod.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>

                {/* Lessons */}
                <div className="adm-course-lessons">
                  {mod.course_lessons.map((lesson, li) => (
                    <div key={lesson.id} className="adm-course-lesson">
                      <div className="adm-course-lesson-row">
                        <span className="adm-course-lesson-num">{mi + 1}.{li + 1}</span>
                        <span className="adm-course-lesson-title">{lesson.title}</span>
                        {lesson.duration_minutes && (
                          <span className="adm-muted">{lesson.duration_minutes} min</span>
                        )}
                        {lesson.video_url && <span className="adm-badge adm-badge-open">Video</span>}
                        {lesson.course_resources.length > 0 && (
                          <span className="adm-muted">{lesson.course_resources.length} file{lesson.course_resources.length !== 1 ? "s" : ""}</span>
                        )}
                        <div className="adm-row-actions">
                          <button className="adm-btn-sm" onClick={() => startEditLesson(lesson)}>Edit</button>
                          <button className="adm-btn-sm" onClick={() => { setAddingResource(addingResource === lesson.id ? null : lesson.id); setResourceForm({ name: "", url: "", file_type: "pdf" }); }}>
                            + File
                          </button>
                          <button className="adm-btn-sm adm-btn-danger" onClick={() => deleteLesson(lesson.id)}>Delete</button>
                        </div>
                      </div>

                      {/* Resources */}
                      {lesson.course_resources.length > 0 && (
                        <div className="adm-course-resources">
                          {lesson.course_resources.map((r) => (
                            <div key={r.id} className="adm-course-resource">
                              <Icon name="arrow-up-right" size={12} />
                              <a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a>
                              <span className="adm-muted">{r.file_type}</span>
                              <button className="adm-btn-sm adm-btn-danger" onClick={() => deleteResource(r.id)} style={{ marginLeft: "auto" }}>Remove</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add resource form */}
                      {addingResource === lesson.id && (
                        <div className="adm-course-resource-form">
                          <input placeholder="File name" value={resourceForm.name} onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })} />
                          <input placeholder="URL" value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} />
                          <select value={resourceForm.file_type} onChange={(e) => setResourceForm({ ...resourceForm, file_type: e.target.value })}>
                            <option value="pdf">PDF</option>
                            <option value="doc">Document</option>
                            <option value="audio">Audio</option>
                            <option value="video">Video</option>
                            <option value="image">Image</option>
                            <option value="other">Other</option>
                          </select>
                          <button className="adm-btn-sm" onClick={() => addResource(lesson.id)}>Add</button>
                          <button className="adm-btn-sm" onClick={() => setAddingResource(null)}>Cancel</button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button className="adm-btn-sm adm-btn-add-lesson" onClick={() => startNewLesson(mod.id)}>+ Add lesson</button>
                </div>
              </div>
            ))}
          </div>

          {/* Add module */}
          <div className="adm-course-add-module">
            <input
              placeholder="New module title..."
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addModule()}
            />
            <button className="adm-btn adm-btn-primary" onClick={addModule} disabled={!newModuleTitle.trim()}>
              + Add module
            </button>
          </div>
        </>
      )}
    </div>
  );
}
