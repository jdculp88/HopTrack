"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Lock, Palette, Trash2, ChevronRight, Bell, Camera, Loader2, Check, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Profile } from "@/types/database";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "same";

interface SettingsClientProps {
  profile: Profile | null;
  userEmail: string;
}

const inputCls = "w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none transition-colors focus:border-[var(--accent-gold)] placeholder:text-[var(--text-muted)]";

const DEFAULT_PREFS = { friend_activity: true, achievements: true, weekly_stats: true, share_live: true };

export function SettingsClient({ profile, userEmail }: SettingsClientProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [homeCity, setHomeCity] = useState(profile?.home_city ?? "");
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    () => ({ ...DEFAULT_PREFS, ...((profile as any)?.notification_preferences ?? {}) })
  );

  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) { setUsernameStatus("idle"); return; }
    if (!/^[a-z0-9_]+$/i.test(value)) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    try {
      const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(value)}`);
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  function handleUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
    if (cleaned === (profile?.username ?? "")) {
      setUsernameStatus("same");
      return;
    }
    if (cleaned.length < 3) { setUsernameStatus("idle"); return; }
    usernameDebounceRef.current = setTimeout(() => checkUsername(cleaned), 500);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (usernameStatus === "taken") return;
    setSaving(true);
    const res = await fetch("/api/profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, username, bio, home_city: homeCity, is_public: isPublic }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
  }

  async function handleNotifToggle(key: string, value: boolean) {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    await fetch("/api/profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notification_preferences: updated }),
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toastError("Image must be under 5MB");
      return;
    }
    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      await fetch("/api/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: avatarUrl }),
      });
      toastSuccess("Photo updated!");
      router.refresh();
    } catch {
      toastError("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Settings</h1>

      {/* Profile section */}
      <Section title="Profile" icon={<User size={16} />}>
        <form onSubmit={handleSave} className="space-y-4">
          {profile && (
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
              <UserAvatar profile={{ ...profile, display_name: displayName }} size="lg" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{displayName || "Your name"}</p>
                <label className="text-xs text-[var(--accent-gold)] hover:underline mt-1 cursor-pointer inline-flex items-center gap-1">
                  {uploadingPhoto ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
                  {uploadingPhoto ? "Uploading..." : "Change photo"}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>
            </div>
          )}

          <Field label="Display Name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className={inputCls}
            />
          </Field>

          <Field label="Username">
            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm pointer-events-none">@</span>
                <input
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="username"
                  maxLength={30}
                  className={`${inputCls} pl-8 pr-10 font-mono ${
                    usernameStatus === "available"
                      ? "border-[#4ADE80] focus:border-[#4ADE80]"
                      : usernameStatus === "taken"
                      ? "border-[var(--danger)] focus:border-[var(--danger)]"
                      : ""
                  }`}
                />
                {usernameStatus === "checking" && (
                  <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] animate-spin" />
                )}
                {usernameStatus === "available" && (
                  <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4ADE80]" />
                )}
                {usernameStatus === "taken" && (
                  <X size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--danger)]" />
                )}
              </div>
              {usernameStatus === "checking" && (
                <p className="text-xs text-[var(--text-muted)] mt-1.5 ml-1">Checking...</p>
              )}
              {usernameStatus === "available" && (
                <p className="text-xs text-[#4ADE80] mt-1.5 ml-1">Username available</p>
              )}
              {usernameStatus === "taken" && (
                <p className="text-xs text-[var(--danger)] mt-1.5 ml-1">Username already taken</p>
              )}
            </div>
          </Field>

          <Field label="Bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about your beer journey..."
              rows={3}
              maxLength={200}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field label="Home City">
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                placeholder="e.g. Portland, OR"
                className={`${inputCls} pl-11`}
              />
            </div>
          </Field>

          <button
            type="submit"
            disabled={saving || usernameStatus === "taken" || usernameStatus === "checking"}
            className="bg-[var(--accent-gold)] hover:bg-[var(--accent-amber)] text-[var(--bg)] font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-60 text-sm"
          >
            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Section>

      {/* Appearance section */}
      <Section title="Appearance" icon={<Palette size={16} />}>
        <ThemeToggle variant="full" />
      </Section>

      {/* Notifications section */}
      <Section title="Notifications" icon={<Bell size={16} />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[var(--text-primary)] text-sm">Friend Activity</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Get notified when friends start a session</p>
            </div>
            <Toggle value={notifPrefs.friend_activity} onChange={(v) => handleNotifToggle("friend_activity", v)} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[var(--text-primary)] text-sm">Achievements</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Get notified when you unlock achievements</p>
            </div>
            <Toggle value={notifPrefs.achievements} onChange={(v) => handleNotifToggle("achievements", v)} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[var(--text-primary)] text-sm">Weekly Stats</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Receive your weekly beer stats summary</p>
            </div>
            <Toggle value={notifPrefs.weekly_stats} onChange={(v) => handleNotifToggle("weekly_stats", v)} />
          </div>
          <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
            Push notifications are delivered when the app is closed. In-app notifications are always on.
          </p>
        </div>
      </Section>

      {/* Privacy section */}
      <Section title="Privacy" icon={<Lock size={16} />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[var(--text-primary)] text-sm">Public Profile</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Appear in leaderboards and friend search</p>
            </div>
            <Toggle value={isPublic} onChange={setIsPublic} />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[var(--border)] pt-4">
            <div>
              <p className="font-medium text-[var(--text-primary)] text-sm">Show Active Sessions</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Let friends see when you&apos;re currently drinking</p>
            </div>
            <Toggle value={notifPrefs.share_live} onChange={(v) => handleNotifToggle("share_live", v)} />
          </div>
        </div>
      </Section>

      {/* Account section */}
      <Section title="Account" icon={<User size={16} />}>
        <div className="space-y-1">
          <div className="flex items-center justify-between p-3 rounded-xl">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Email</p>
              <p className="text-sm text-[var(--text-primary)] font-mono">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors text-left group"
          >
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Sign Out</span>
            <ChevronRight size={14} className="text-[var(--text-muted)]" />
          </button>

          <button
            disabled
            title="Account deletion will be available soon"
            className="w-full flex items-center justify-between p-3 rounded-xl text-left opacity-50 cursor-not-allowed"
          >
            <span className="text-sm text-[#C44B3A]">Delete Account (Coming Soon)</span>
            <Trash2 size={14} className="text-[#C44B3A]" />
          </button>
        </div>
      </Section>

      <p className="text-center text-xs text-[var(--text-muted)] pb-4">HopTrack · Drink Responsibly 🍺</p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)]">
        <span className="text-[var(--accent-gold)]">{icon}</span>
        <h2 className="font-sans font-semibold text-[var(--text-primary)] text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${value ? "bg-[var(--accent-gold)]" : "bg-[#3A3628]"}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${value ? "left-6" : "left-0.5"}`}
      />
    </button>
  );
}
