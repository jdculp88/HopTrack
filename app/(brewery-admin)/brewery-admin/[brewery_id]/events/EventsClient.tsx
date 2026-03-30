"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, X, Save, Loader2, Trash2, AlertTriangle, ToggleLeft, ToggleRight, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/dates";

function getNowDatetimeLocal() {
  const now = new Date();
  // Format as YYYY-MM-DDTHH:MM for datetime-local min attribute
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const EVENT_TYPES = [
  { value: "tap_takeover", label: "Tap Takeover", emoji: "🍺" },
  { value: "release_party", label: "Release Party", emoji: "🎉" },
  { value: "trivia", label: "Trivia Night", emoji: "🧠" },
  { value: "live_music", label: "Live Music", emoji: "🎵" },
  { value: "food_pairing", label: "Food Pairing", emoji: "🍽️" },
  { value: "other", label: "Other", emoji: "📅" },
] as const;

type EventType = (typeof EVENT_TYPES)[number]["value"];

const emptyForm = {
  title: "",
  description: "",
  event_date: "",
  start_datetime: "",
  end_datetime: "",
  event_type: "other" as EventType,
};

interface EventsClientProps {
  breweryId: string;
  initialEvents: any[];
}

export function EventsClient({ breweryId, initialEvents }: EventsClientProps) {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ start?: string; end?: string }>({});
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter(e => e.event_date >= today && e.is_active);
  const past = events.filter(e => e.event_date < today || !e.is_active);

  function openAdd() {
    setForm(emptyForm);
    setFormErrors({});
    setEditingEvent(null);
    setShowForm(true);
  }

  function openEdit(event: any) {
    // Reconstruct datetime-local strings from stored date + time fields
    const startDt = event.event_date && event.start_time
      ? `${event.event_date}T${event.start_time.slice(0, 5)}`
      : event.event_date
      ? `${event.event_date}T00:00`
      : "";
    const endDt = event.event_date && event.end_time
      ? `${event.event_date}T${event.end_time.slice(0, 5)}`
      : "";
    setForm({
      title: event.title,
      description: event.description ?? "",
      event_date: event.event_date,
      start_datetime: startDt,
      end_datetime: endDt,
      event_type: event.event_type,
    });
    setFormErrors({});
    setEditingEvent(event);
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim() || !form.start_datetime) return;

    const errors: { start?: string; end?: string } = {};
    const now = new Date();
    const startDt = new Date(form.start_datetime);

    // Only block past dates for new events (not edits)
    if (!editingEvent && startDt < now) {
      errors.start = "Event start time cannot be in the past";
    }

    if (form.end_datetime) {
      const endDt = new Date(form.end_datetime);
      if (endDt <= startDt) {
        errors.end = "End time must be after start time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setSaving(true);

    // Parse out date/time components for DB storage
    const startDate = form.start_datetime.split("T")[0];
    const startTime = form.start_datetime.split("T")[1] ?? null;
    const endTime = form.end_datetime ? form.end_datetime.split("T")[1] : null;

    const payload = {
      brewery_id: breweryId,
      title: form.title,
      description: form.description || null,
      event_date: startDate,
      start_time: startTime,
      end_time: endTime,
      event_type: form.event_type,
    };

    if (editingEvent) {
      const { data } = await (supabase as any)
        .from("brewery_events").update(payload).eq("id", editingEvent.id).select().single();
      if (data) setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...data } : e));
    } else {
      const { data } = await (supabase as any)
        .from("brewery_events").insert({ ...payload, is_active: true }).select().single();
      if (data) setEvents(prev => [...prev, data].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    }

    setSaving(false);
    setShowForm(false);
    setEditingEvent(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  async function toggleEvent(event: any) {
    const newVal = !event.is_active;
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_active: newVal } : e));
    const { error } = await (supabase as any).from("brewery_events").update({ is_active: newVal }).eq("id", event.id);
    if (error) setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_active: event.is_active } : e));
  }

  async function deleteEvent(id: string) {
    setDeletingId(id);
    setConfirmDeleteId(null);
    await (supabase as any).from("brewery_events").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto pt-16 lg:pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Events</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Post upcoming events — customers see them on your brewery page.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] shrink-0"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
        >
          <Plus size={15} /> Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-4xl mb-3">📅</p>
          <p className="font-display text-xl mb-1" style={{ color: "var(--text-primary)" }}>No events yet</p>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            Post tap takeovers, release parties, trivia nights — anything that brings people through the door.
          </p>
          <button
            onClick={openAdd}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            Post Your First Event
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Upcoming · {upcoming.length}
              </h2>
              <div className="space-y-3">
                {upcoming.map(event => <EventCard key={event.id} event={event} onEdit={openEdit} onToggle={toggleEvent} onDelete={deleteEvent} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} deletingId={deletingId} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Past & Inactive · {past.length}
              </h2>
              <div className="space-y-3 opacity-60">
                {past.map(event => <EventCard key={event.id} event={event} onEdit={openEdit} onToggle={toggleEvent} onDelete={deleteEvent} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} deletingId={deletingId} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Add/Edit modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setFormErrors({}); } }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-lg rounded-2xl p-6 border space-y-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {editingEvent ? "Edit Event" : "Add Event"}
                </h2>
                <button onClick={() => { setShowForm(false); setFormErrors({}); }} style={{ color: "var(--text-muted)" }}><X size={20} /></button>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>Event Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EVENT_TYPES.map(et => (
                    <button
                      key={et.value}
                      onClick={() => setForm(f => ({ ...f, event_type: et.value }))}
                      className="flex flex-col items-center gap-1 py-3 sm:py-2.5 rounded-xl border text-xs font-mono transition-colors min-h-[44px]"
                      style={form.event_type === et.value
                        ? { background: "rgba(212,168,67,0.15)", borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }
                        : { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-muted)" }
                      }
                    >
                      <span>{et.emoji}</span>
                      <span>{et.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Title *">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Summer IPA Release Party" style={inputStyle} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Field label="Start Date & Time *">
                    <input
                      type="datetime-local"
                      value={form.start_datetime}
                      min={!editingEvent ? getNowDatetimeLocal() : undefined}
                      onChange={e => {
                        setForm(f => ({ ...f, start_datetime: e.target.value }));
                        if (formErrors.start) setFormErrors(fe => ({ ...fe, start: undefined }));
                      }}
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.start ? "var(--danger)" : "var(--border)",
                      }}
                    />
                  </Field>
                  <AnimatePresence>
                    {formErrors.start && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="text-xs mt-1"
                        style={{ color: "var(--danger)" }}
                      >
                        {formErrors.start}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <Field label="End Date & Time">
                    <input
                      type="datetime-local"
                      value={form.end_datetime}
                      min={form.start_datetime || (!editingEvent ? getNowDatetimeLocal() : undefined)}
                      onChange={e => {
                        setForm(f => ({ ...f, end_datetime: e.target.value }));
                        if (formErrors.end) setFormErrors(fe => ({ ...fe, end: undefined }));
                      }}
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.end ? "var(--danger)" : "var(--border)",
                      }}
                    />
                  </Field>
                  <AnimatePresence>
                    {formErrors.end && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="text-xs mt-1"
                        style={{ color: "var(--danger)" }}
                      >
                        {formErrors.end}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <Field label="Description">
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Tell customers what to expect..." rows={3}
                  style={{ ...inputStyle, resize: "none" as any }} />
              </Field>

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowForm(false); setFormErrors({}); }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "transparent" }}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving || !form.title.trim() || !form.start_datetime}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
                  {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : <><Save size={16} />{editingEvent ? "Save Changes" : "Post Event"}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({ event, onEdit, onToggle, onDelete, confirmDeleteId, setConfirmDeleteId, deletingId }: {
  event: any;
  onEdit: (e: any) => void;
  onToggle: (e: any) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  deletingId: string | null;
}) {
  const et = EVENT_TYPES.find(t => t.value === event.event_type);
  const timeStr = event.start_time
    ? `${event.start_time}${event.end_time ? ` – ${event.end_time}` : ""}`
    : null;

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: confirmDeleteId === event.id ? "var(--danger)" : "var(--border)" }}>
      <div className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(212,168,67,0.1)" }}>
          {et?.emoji ?? "📅"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold" style={{ color: "var(--text-primary)" }}>{event.title}</p>
          <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <Calendar size={11} />{formatDate(event.event_date)}
            </span>
            {timeStr && (
              <span className="flex items-center gap-1">
                <Clock size={11} />{timeStr}
              </span>
            )}
            {et && <span className="font-mono">{et.label}</span>}
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={() => onEdit(event)} className="p-2.5 sm:p-2 rounded-lg hover:opacity-70 transition-opacity min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
            ✏️
          </button>
          <button onClick={() => onToggle(event)} className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center">
            {event.is_active
              ? <ToggleRight size={26} style={{ color: "var(--accent-gold)" }} />
              : <ToggleLeft size={26} style={{ color: "var(--text-muted)" }} />}
          </button>
          <button
            onClick={() => setConfirmDeleteId(confirmDeleteId === event.id ? null : event.id)}
            disabled={deletingId === event.id}
            className="p-2.5 sm:p-1 rounded-lg hover:opacity-70 transition-opacity disabled:opacity-40 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            style={{ color: confirmDeleteId === event.id ? "var(--danger)" : "var(--text-secondary)" }}>
            {deletingId === event.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {confirmDeleteId === event.id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-t"
              style={{ background: "rgba(196,75,58,0.06)", borderColor: "var(--danger)" }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} style={{ color: "var(--danger)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Delete <strong style={{ color: "var(--text-primary)" }}>{event.title}</strong>?
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDeleteId(null)}
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}>
                  Cancel
                </button>
                <button onClick={() => onDelete(event.id)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: "var(--danger)", color: "#fff" }}>
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)",
  background: "var(--surface-2)", color: "var(--text-primary)", fontSize: 14, outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
