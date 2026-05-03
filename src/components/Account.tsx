"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Nav } from "./nav";
import { MiniFoot } from "./footer";
import { Icon } from "./icons";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface Profile {
  display_name?: string | null;
  phone?: string | null;
  bio?: string | null;
  notify_booking_confirm?: boolean;
  notify_event_reminder?: boolean;
  notify_newsletter?: boolean;
  notify_marketing?: boolean;
}

interface Subscription {
  id: number;
  list_id: number;
  subscribed: boolean;
  mailing_lists: { id: number; name: string; description: string | null };
}

interface AccountShellProps {
  user: User;
  profile: Profile;
  subscriptions: Subscription[];
}

export function AccountShell({ user, profile: initialProfile, subscriptions: initialSubs }: AccountShellProps) {
  const router = useRouter();

  const email = user.email || "";
  const oauthName = user.user_metadata?.full_name || "";
  const avatar = user.user_metadata?.avatar_url;

  const [displayName, setDisplayName] = useState(initialProfile.display_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [notifs, setNotifs] = useState({
    notify_booking_confirm: initialProfile.notify_booking_confirm ?? true,
    notify_event_reminder: initialProfile.notify_event_reminder ?? true,
    notify_newsletter: initialProfile.notify_newsletter ?? true,
    notify_marketing: initialProfile.notify_marketing ?? true,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const [subs, setSubs] = useState(initialSubs);
  const [subToggles, setSubToggles] = useState<Record<number, boolean>>({});

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-profile",
          display_name: displayName || null,
          phone: phone || null,
          bio: bio || null,
        }),
      });
      const data = await res.json();
      if (data.ok) setProfileSaved(true);
      else alert(data.error || "Save failed");
    } catch {
      alert("Save failed");
    } finally {
      setProfileSaving(false);
    }
  };

  const saveNotifs = async () => {
    setNotifSaving(true);
    setNotifSaved(false);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-notifications", ...notifs }),
      });
      const data = await res.json();
      if (data.ok) setNotifSaved(true);
      else alert(data.error || "Save failed");
    } catch {
      alert("Save failed");
    } finally {
      setNotifSaving(false);
    }
  };

  const toggleSub = async (memberId: number, subscribed: boolean) => {
    setSubToggles((s) => ({ ...s, [memberId]: true }));
    try {
      await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-subscription", member_id: memberId, subscribed }),
      });
      setSubs((prev) =>
        prev.map((s) => (s.id === memberId ? { ...s, subscribed } : s))
      );
    } catch {
      alert("Failed to update");
    } finally {
      setSubToggles((s) => ({ ...s, [memberId]: false }));
    }
  };

  const updateNotif = (key: keyof typeof notifs, val: boolean) => {
    setNotifs((n) => ({ ...n, [key]: val }));
    setNotifSaved(false);
  };

  return (
    <>
      <Nav />
      <section className="acct-main">
        <div className="acct-inner">
          <Link href="/dashboard" className="acct-back">
            <span className="acct-back-arrow"><Icon name="arrow-right" size={14} /></span> Back to dashboard
          </Link>

          <div className="acct-header">
            {avatar && (
              <img src={avatar} alt="" className="acct-avatar" referrerPolicy="no-referrer" />
            )}
            <div>
              <h1 className="acct-h1">Account</h1>
              <p className="acct-email">{email}</p>
            </div>
          </div>

          <div className="acct-section">
            <h2 className="acct-h2">Your details</h2>
            <p className="acct-hint">
              Your email and photo come from Google and can&apos;t be changed here.
            </p>
            <div className="acct-form">
              <label className="acct-label">
                <span className="acct-label-text">Email</span>
                <input className="acct-input acct-input-disabled" value={email} disabled />
              </label>
              <label className="acct-label">
                <span className="acct-label-text">Google name</span>
                <input className="acct-input acct-input-disabled" value={oauthName} disabled />
              </label>
              <label className="acct-label">
                <span className="acct-label-text">Display name</span>
                <input
                  className="acct-input"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setProfileSaved(false); }}
                  placeholder="How you'd like to be called"
                />
              </label>
              <label className="acct-label">
                <span className="acct-label-text">Phone</span>
                <input
                  className="acct-input"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setProfileSaved(false); }}
                  placeholder="+44 7..."
                />
              </label>
              <label className="acct-label acct-label-full">
                <span className="acct-label-text">Bio</span>
                <textarea
                  className="acct-textarea"
                  value={bio}
                  onChange={(e) => { setBio(e.target.value); setProfileSaved(false); }}
                  placeholder="A little about yourself..."
                  rows={3}
                />
              </label>
              <div className="acct-form-actions">
                <button
                  className="acct-btn acct-btn-primary"
                  onClick={saveProfile}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : profileSaved ? "Saved" : "Save changes"}
                  {profileSaved && <Icon name="check" size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="acct-section">
            <h2 className="acct-h2">Notifications</h2>
            <p className="acct-hint">Choose which emails you receive from us.</p>
            <div className="acct-notif-list">
              <label className="acct-notif-row">
                <div className="acct-notif-info">
                  <div className="acct-notif-name">Booking confirmations</div>
                  <div className="acct-notif-desc">Confirmation emails when you book a workshop or retreat.</div>
                </div>
                <input
                  type="checkbox"
                  className="acct-toggle"
                  checked={notifs.notify_booking_confirm}
                  onChange={(e) => updateNotif("notify_booking_confirm", e.target.checked)}
                />
              </label>
              <label className="acct-notif-row">
                <div className="acct-notif-info">
                  <div className="acct-notif-name">Event reminders</div>
                  <div className="acct-notif-desc">A reminder the day before your event.</div>
                </div>
                <input
                  type="checkbox"
                  className="acct-toggle"
                  checked={notifs.notify_event_reminder}
                  onChange={(e) => updateNotif("notify_event_reminder", e.target.checked)}
                />
              </label>
              <label className="acct-notif-row">
                <div className="acct-notif-info">
                  <div className="acct-notif-name">Newsletter</div>
                  <div className="acct-notif-desc">Monthly updates, new classes and wellness tips.</div>
                </div>
                <input
                  type="checkbox"
                  className="acct-toggle"
                  checked={notifs.notify_newsletter}
                  onChange={(e) => updateNotif("notify_newsletter", e.target.checked)}
                />
              </label>
              <label className="acct-notif-row">
                <div className="acct-notif-info">
                  <div className="acct-notif-name">Marketing</div>
                  <div className="acct-notif-desc">Occasional offers, new product launches and partner announcements.</div>
                </div>
                <input
                  type="checkbox"
                  className="acct-toggle"
                  checked={notifs.notify_marketing}
                  onChange={(e) => updateNotif("notify_marketing", e.target.checked)}
                />
              </label>
            </div>
            <div className="acct-form-actions">
              <button
                className="acct-btn acct-btn-primary"
                onClick={saveNotifs}
                disabled={notifSaving}
              >
                {notifSaving ? "Saving..." : notifSaved ? "Saved" : "Save preferences"}
                {notifSaved && <Icon name="check" size={14} />}
              </button>
            </div>
          </div>

          {subs.length > 0 && (
            <div className="acct-section">
              <h2 className="acct-h2">Mailing lists</h2>
              <p className="acct-hint">You&apos;re subscribed to these lists. Unsubscribe any time.</p>
              <div className="acct-notif-list">
                {subs.map((s) => (
                  <label key={s.id} className="acct-notif-row">
                    <div className="acct-notif-info">
                      <div className="acct-notif-name">{s.mailing_lists.name}</div>
                      {s.mailing_lists.description && (
                        <div className="acct-notif-desc">{s.mailing_lists.description}</div>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="acct-toggle"
                      checked={s.subscribed}
                      disabled={!!subToggles[s.id]}
                      onChange={(e) => toggleSub(s.id, e.target.checked)}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="acct-section acct-section-last">
            <h2 className="acct-h2">Account</h2>
            <div className="acct-actions">
              <button className="acct-btn acct-btn-outline" onClick={handleSignOut}>
                Sign out <Icon name="arrow-right" size={12} />
              </button>
              <a href="mailto:hello@nine2rise.com?subject=Delete my account" className="acct-btn acct-btn-danger">
                Request account deletion
              </a>
            </div>
            <p className="acct-hint" style={{ marginTop: 12 }}>
              To delete your account and all associated data, email us and we&apos;ll handle it within 48 hours.
            </p>
          </div>
        </div>
      </section>
      <MiniFoot />
    </>
  );
}
