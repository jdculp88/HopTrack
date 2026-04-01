"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Lock, Palette, Trash2, ChevronRight, Bell, Camera, Loader2, Check, X, Gift, Copy, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Profile } from "@/types/database";

type UsernameStatus = "idle" | "debouncing" | "checking" | "available" | "taken" | "same";

interface SettingsClientProps {
  profile: Profile | null;
  userEmail: string;
}

const inputCls = "w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none transition-colors focus:border-[var(--accent-gold)] placeholder:text-[var(--text-muted)]";

const DEFAULT_PREFS = {
  friend_activity: true, achievements: true, weekly_stats: true, share_live: true,
  smart_wishlist_on_tap: true, smart_friend_session: true, smart_loyalty_nudge: true,
};

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
    () => ({ ...DEFAULT_PREFS, ...(profile?.notification_preferences ?? {}) })
  );
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralUseCount, setReferralUseCount] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.code) {
          setReferralCode(data.code);
          setReferralUseCount(data.use_count ?? 0);
        }
      })
      .catch(() => {});

    // Scroll to hash anchor on mount (e.g. #invite-friends)
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  function handleCopyCode() {
    if (!referralCode) return;
    const link = `${window.location.origin}/join?ref=${referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }

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
    setUsernameStatus("debouncing");
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
    try {
      const res = await fetch("/api/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_preferences: updated }),
      });
      if (res.ok) {
        toastSuccess("Preference saved");
      } else {
        toastError("Failed to save preference");
        setNotifPrefs(prev => ({ ...prev, [key]: !value }));
      }
    } catch {
      toastError("Failed to save preference");
      setNotifPrefs(prev => ({ ...prev, [key]: !value }));
    }
  }

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = "";
    setAvatarError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError("Please select a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError("Image must be under 5MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handlePhotoCancelPreview() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarError(null);
  }

  async function handlePhotoConfirmUpload() {
    if (!avatarFile) return;
    setUploadingPhoto(true);
    setAvatarError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      await fetch("/api/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: avatarUrl }),
      });
      toastSuccess("Photo updated!");
      handlePhotoCancelPreview();
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
      <h1 className="font-sans text-3xl font-bold text-[var(--text-primary)]">Settings</h1>

      {/* Profile section */}
      <Section title="Profile" icon={<User size={16} />} description="Your public identity on HopTrack">
        <form onSubmit={handleSave} className="space-y-4">
          {profile && (
            <div className="space-y-3 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 relative" style={{ border: "2px solid var(--accent-gold)" }}>
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <UserAvatar profile={{ ...profile, display_name: displayName }} size="lg" />
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{displayName || "Your name"}</p>
                  {!avatarPreview && (
                    <label className="text-xs text-[var(--accent-gold)] hover:underline mt-1 cursor-pointer inline-flex items-center gap-1">
                      <Camera size={10} />
                      Change photo
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoSelect} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Avatar error */}
              <AnimatePresence>
                {avatarError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "color-mix(in srgb, var(--danger) 10%, transparent)", color: "var(--danger)" }}>
                      <AlertCircle size={12} className="flex-shrink-0" />
                      {avatarError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preview confirm/cancel */}
              <AnimatePresence>
                {avatarPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePhotoCancelPreview}
                        disabled={uploadingPhoto}
                        className="flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ color: "var(--text-secondary)", background: "var(--surface-2)", border: "1px solid var(--border)" }}
                      >
                        <motion.span className="flex items-center justify-center" whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                          Cancel
                        </motion.span>
                      </button>
                      <button
                        onClick={handlePhotoConfirmUpload}
                        disabled={uploadingPhoto}
                        className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-1.5"
                        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                      >
                        <motion.span className="flex items-center justify-center gap-1.5" whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                          {uploadingPhoto ? (
                            <><Loader2 size={12} className="animate-spin" /> Uploading...</>
                          ) : (
                            <><Check size={12} /> Confirm</>
                          )}
                        </motion.span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                {(usernameStatus === "debouncing" || usernameStatus === "checking") && (
                  <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] animate-spin" />
                )}
                {usernameStatus === "available" && (
                  <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4ADE80]" />
                )}
                {usernameStatus === "taken" && (
                  <X size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--danger)]" />
                )}
              </div>
              {usernameStatus === "debouncing" && (
                <p className="text-xs text-[var(--text-muted)] mt-1.5 ml-1">Checking...</p>
              )}
              {usernameStatus === "checking" && (
                <p className="text-xs text-[var(--text-muted)] mt-1.5 ml-1">Checking availability...</p>
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
            <div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about your beer journey..."
                rows={3}
                maxLength={200}
                className={`${inputCls} resize-none`}
              />
              <p
                className="text-xs mt-1.5 ml-1 text-right tabular-nums"
                style={{ color: bio.length >= 180 ? "var(--danger)" : bio.length >= 150 ? "var(--accent-amber)" : "var(--text-muted)" }}
              >
                {bio.length} / 200
              </p>
            </div>
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
            disabled={saving || usernameStatus === "taken" || usernameStatus === "checking" || usernameStatus === "debouncing"}
            className="bg-[var(--accent-gold)] hover:bg-[var(--accent-amber)] text-[var(--bg)] font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-60 text-sm"
          >
            <motion.span className="flex items-center justify-center" whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
            </motion.span>
          </button>
        </form>
      </Section>

      {/* Appearance section */}
      <Section title="Appearance" icon={<Palette size={16} />} description="Customize how HopTrack looks">
        <ThemeToggle variant="full" />
      </Section>

      {/* Privacy section */}
      <Section title="Privacy" icon={<Lock size={16} />} description="Control who sees your activity">
        <div className="space-y-1">
          <ToggleRow
            label="Public Profile"
            description="Appear in leaderboards and friend search"
            value={isPublic}
            onChange={setIsPublic}
          />
          <ToggleRow
            label="Show Active Sessions"
            description="Let friends see when you're currently drinking"
            value={notifPrefs.share_live}
            onChange={(v) => handleNotifToggle("share_live", v)}
          />
        </div>
      </Section>

      {/* Notifications section */}
      <Section title="Notifications" icon={<Bell size={16} />} description="Choose what you want to hear about">
        <div className="space-y-1">
          <ToggleRow
            label="Friend Activity"
            description="Get notified when friends start a session"
            value={notifPrefs.friend_activity}
            onChange={(v) => handleNotifToggle("friend_activity", v)}
          />
          <ToggleRow
            label="Achievements"
            description="Get notified when you unlock achievements"
            value={notifPrefs.achievements}
            onChange={(v) => handleNotifToggle("achievements", v)}
          />
          <ToggleRow
            label="Weekly Stats"
            description="Receive your weekly beer stats summary"
            value={notifPrefs.weekly_stats}
            onChange={(v) => handleNotifToggle("weekly_stats", v)}
          />
          <p className="text-[10px] font-mono uppercase tracking-wide text-[var(--accent-gold)] pt-3 mt-2 border-t border-[var(--border)]">
            Smart Notifications
          </p>
          <ToggleRow
            label="Wishlist On Tap"
            description="Get notified when a wishlisted beer goes on tap nearby"
            value={notifPrefs.smart_wishlist_on_tap}
            onChange={(v) => handleNotifToggle("smart_wishlist_on_tap", v)}
          />
          <ToggleRow
            label="Friend Sessions"
            description="Get notified when a friend starts drinking"
            value={notifPrefs.smart_friend_session}
            onChange={(v) => handleNotifToggle("smart_friend_session", v)}
          />
          <ToggleRow
            label="Loyalty Reminders"
            description="Get reminded when you're close to earning a reward"
            value={notifPrefs.smart_loyalty_nudge}
            onChange={(v) => handleNotifToggle("smart_loyalty_nudge", v)}
          />
          <p className="text-xs text-[var(--text-muted)] pt-3 mt-2 border-t border-[var(--border)]">
            Push notifications are delivered when the app is closed. Smart notifications are limited to 3 per day. In-app notifications are always on.
          </p>
        </div>
      </Section>

      {/* Invite Friends section */}
      <div id="invite-friends" />
      <Section title="Invite Friends" icon={<Gift size={16} />} description="Earn 250 XP for every friend who joins">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Share your invite link. When a friend joins HopTrack with your code, you earn <span className="text-[var(--accent-gold)] font-medium">+250 XP</span>.
          </p>
          {referralCode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 font-mono text-sm text-[var(--accent-gold)] tracking-widest select-all">
                  {referralCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border"
                  style={{
                    background: copiedCode ? "var(--accent-gold)" : "var(--surface-2)",
                    borderColor: copiedCode ? "var(--accent-gold)" : "var(--border)",
                    color: copiedCode ? "var(--bg)" : "var(--text-primary)",
                  }}
                >
                  <motion.span className="flex items-center gap-1.5" whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCode ? "Copied!" : "Copy Link"}
                  </motion.span>
                </button>
              </div>
              {referralUseCount > 0 && (
                <p className="text-xs text-[var(--text-muted)]">
                  🍺 {referralUseCount} {referralUseCount === 1 ? "person has" : "people have"} joined with your code
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Loader2 size={14} className="animate-spin" />
              Generating your invite code...
            </div>
          )}
        </div>
      </Section>

      {/* Account section */}
      <Section title="Account" icon={<User size={16} />} description="Your login and account details">
        <div className="space-y-1">
          <div className="flex items-center justify-between p-3 rounded-xl">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Email</p>
              <p className="text-sm text-[var(--text-primary)] font-mono">{userEmail}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone" icon={<Trash2 size={16} />} description="Destructive actions — proceed with care" variant="danger">
        <div className="space-y-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))] transition-colors text-left group border border-[var(--border)]"
          >
            <motion.span className="flex items-center justify-between w-full" whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
              <div>
                <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--danger)]">Sign Out</span>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">You&apos;ll need to sign in again to access your account</p>
              </div>
              <ChevronRight size={14} className="text-[var(--text-muted)]" />
            </motion.span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl text-left border border-[var(--border)] hover:border-[var(--danger)]/40 transition-colors group"
          >
            <div>
              <span className="text-sm font-medium text-[var(--danger)]">Delete Account</span>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Permanently removes all your data</p>
            </div>
            <Trash2 size={14} className="text-[var(--danger)] opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>

          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-4 rounded-xl border border-[var(--danger)]/30 bg-[color-mix(in_srgb,var(--danger)_5%,var(--surface))] space-y-3">
                  <p className="text-sm font-medium text-[var(--danger)]">This cannot be undone.</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    All your sessions, ratings, achievements, and friendships will be permanently deleted. Type <span className="font-mono font-bold text-[var(--text-primary)]">DELETE</span> to confirm.
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--danger)] placeholder:text-[var(--text-muted)] transition-colors font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                      className="flex-1 py-2 rounded-xl text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (deleteConfirmText !== "DELETE") return;
                        setDeleting(true);
                        try {
                          const res = await fetch("/api/users/delete-account", { method: "DELETE" });
                          if (!res.ok) {
                            const d = await res.json();
                            toastError(d.error ?? "Failed to delete account");
                            setDeleting(false);
                            return;
                          }
                          const supabase = createClient();
                          await supabase.auth.signOut();
                          router.push("/");
                        } catch {
                          toastError("Something went wrong. Please try again.");
                          setDeleting(false);
                        }
                      }}
                      disabled={deleteConfirmText !== "DELETE" || deleting}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                      style={{ background: "var(--danger)", color: "#fff" }}
                    >
                      {deleting ? "Deleting..." : "Delete My Account"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      <p className="text-center text-xs text-[var(--text-muted)] pb-4">HopTrack -- Drink Responsibly</p>
    </div>
  );
}

function Section({ title, icon, description, children, variant = "default" }: { title: string; icon: React.ReactNode; description?: string; children: React.ReactNode; variant?: "default" | "danger" }) {
  return (
    <div className={`rounded-2xl overflow-hidden ${
      variant === "danger"
        ? "bg-[color-mix(in_srgb,var(--danger)_5%,var(--surface))] border border-[color-mix(in_srgb,var(--danger)_20%,var(--border))]"
        : "bg-[var(--surface)] border border-[var(--border)]"
    }`}>
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <span className={variant === "danger" ? "text-[var(--danger)]" : "text-[var(--accent-gold)]"}>{icon}</span>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">{title}</h2>
        </div>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-1 ml-[30px]">{description}</p>
        )}
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

function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="pr-4">
        <p className="font-medium text-[var(--text-primary)] text-sm">{label}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`w-12 h-7 rounded-full transition-all duration-200 relative flex-shrink-0 ${
        value
          ? "bg-[var(--accent-gold)] shadow-[0_0_8px_color-mix(in_srgb,var(--accent-gold)_30%,transparent)]"
          : "bg-[var(--surface-2)] border border-[var(--border)]"
      }`}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-sm transition-all duration-200 ${
          value ? "left-[22px] bg-white" : "left-0.5 bg-[var(--text-muted)]"
        }`}
      />
    </button>
  );
}
