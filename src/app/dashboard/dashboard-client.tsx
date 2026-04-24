"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icons";

interface Order {
  id: string;
  plan_name: string | null;
  type: string;
  status: string;
  amount: number | null;
  currency: string | null;
  created_at: string;
}

interface DashboardClientProps {
  name: string;
  email: string;
  avatar: string;
  subscriptionStatus: string | null;
  planName: string | null;
  orders: Order[];
}

export function DashboardClient({ name, email, avatar, subscriptionStatus, planName, orders }: DashboardClientProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function formatAmount(amount: number | null, currency: string | null) {
    if (!amount) return "—";
    const symbol = currency === "gbp" ? "\u00a3" : currency === "usd" ? "$" : "\u20ac";
    return `${symbol}${(amount / 100).toFixed(2)}`;
  }

  return (
    <section className="dashboard">
      <div className="dashboard-inner">
        <div className="dashboard-header">
          <div className="dashboard-user">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="dashboard-avatar" referrerPolicy="no-referrer" />
            ) : (
              <div className="dashboard-avatar-placeholder">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="dashboard-name">Welcome back, {name}</h1>
              <p className="dashboard-email">{email}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
            Sign out
          </button>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <Icon name="heart" size={24} />
            </div>
            <h3>Your Practice</h3>
            <p>Track your sessions and build a streak that sticks.</p>
            <div className="dashboard-card-stat">
              <span className="stat-number">0</span>
              <span className="stat-label">sessions this week</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <Icon name="leaf" size={24} />
            </div>
            <h3>Membership</h3>
            <p>Your current plan and billing.</p>
            {subscriptionStatus === "active" ? (
              <div className="dashboard-card-meta" style={{ background: "rgba(8,131,149,0.1)", color: "var(--teal)" }}>
                Active — {planName}
              </div>
            ) : (
              <div className="dashboard-card-meta">Free trial</div>
            )}
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <Icon name="moon" size={24} />
            </div>
            <h3>Orders</h3>
            <p>Your purchase history.</p>
            <div className="dashboard-card-stat">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">order{orders.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-recent">
          <h2>Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="dashboard-empty">
              <Icon name="spark" size={32} />
              <p>No orders yet. Visit the shop or subscribe to a plan to get started.</p>
            </div>
          ) : (
            <div className="dashboard-orders">
              {orders.map((o) => (
                <div key={o.id} className="dashboard-order">
                  <div className="order-info">
                    <div className="order-name">{o.plan_name || "Shop purchase"}</div>
                    <div className="order-meta">
                      {o.type === "subscription" ? "Subscription" : "One-time"} · {new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div className="order-amount">{formatAmount(o.amount, o.currency)}</div>
                  <div className={"order-status " + (o.status === "completed" ? "status-ok" : "")}>
                    {o.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
