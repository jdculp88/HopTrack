"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Award, Tag, ToggleLeft, ToggleRight, X, Save, Loader2, Trash2, Edit2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface LoyaltyClientProps {
  breweryId: string;
  initialPrograms: any[];
  initialPromotions: any[];
  beers: any[];
}

const emptyProgram = { name: "The Hop Club", description: "", stamps_required: "10", reward_description: "One free pint — any size, any beer." };
const emptyPromo = { title: "", description: "", discount_type: "percent" as const, discount_value: "", ends_at: "", beer_id: "" };

export function LoyaltyClient({ breweryId, initialPrograms, initialPromotions, beers }: LoyaltyClientProps) {
  const [programs, setPrograms] = useState(initialPrograms);
  const [promotions, setPromotions] = useState(initialPromotions);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [programForm, setProgramForm] = useState(emptyProgram);
  const [promoForm, setPromoForm] = useState(emptyPromo);
  const [savingProgram, setSavingProgram] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);
  const [confirmDeletePromoId, setConfirmDeletePromoId] = useState<string | null>(null);
  const [deletingPromoId, setDeletingPromoId] = useState<string | null>(null);
  const supabase = createClient();

  function openAddProgram() {
    setProgramForm(emptyProgram);
    setEditingProgram(null);
    setShowProgramForm(true);
  }

  function openEditProgram(prog: any) {
    setProgramForm({
      name: prog.name,
      description: prog.description ?? "",
      stamps_required: prog.stamps_required?.toString() ?? "10",
      reward_description: prog.reward_description ?? "",
    });
    setEditingProgram(prog);
    setShowProgramForm(true);
  }

  async function saveProgram() {
    if (!programForm.name.trim() || !programForm.reward_description.trim()) return;
    setSavingProgram(true);
    const payload = {
      brewery_id: breweryId,
      name: programForm.name,
      description: programForm.description || null,
      stamps_required: parseInt(programForm.stamps_required) || 10,
      reward_description: programForm.reward_description,
    };

    if (editingProgram) {
      const { data } = await (supabase as any)
        .from("loyalty_programs").update(payload).eq("id", editingProgram.id).select().single();
      if (data) setPrograms(p => p.map(x => x.id === editingProgram.id ? { ...x, ...data } : x));
    } else {
      const { data } = await (supabase as any)
        .from("loyalty_programs").insert({ ...payload, is_active: true }).select().single();
      if (data) setPrograms(p => [data, ...p]);
    }

    setSavingProgram(false);
    setShowProgramForm(false);
    setEditingProgram(null);
    setProgramForm(emptyProgram);
  }

  async function savePromo() {
    if (!promoForm.title.trim()) return;
    setSavingPromo(true);
    const { data } = await (supabase as any).from("promotions").insert({
      brewery_id: breweryId,
      title: promoForm.title,
      description: promoForm.description || null,
      discount_type: promoForm.discount_type,
      discount_value: promoForm.discount_value ? parseFloat(promoForm.discount_value) : null,
      ends_at: promoForm.ends_at || null,
      beer_id: promoForm.beer_id || null,
      is_active: true,
    }).select().single();
    if (data) setPromotions(p => [data, ...p]);
    setSavingPromo(false);
    setShowPromoForm(false);
    setPromoForm(emptyPromo);
  }

  async function toggleProgram(prog: any) {
    const newVal = !prog.is_active;
    setPrograms(p => p.map(x => x.id === prog.id ? { ...x, is_active: newVal } : x));
    const { error } = await (supabase as any).from("loyalty_programs").update({ is_active: newVal }).eq("id", prog.id);
    if (error) setPrograms(p => p.map(x => x.id === prog.id ? { ...x, is_active: prog.is_active } : x));
  }

  async function togglePromo(promo: any) {
    const newVal = !promo.is_active;
    setPromotions(p => p.map(x => x.id === promo.id ? { ...x, is_active: newVal } : x));
    const { error } = await (supabase as any).from("promotions").update({ is_active: newVal }).eq("id", promo.id);
    if (error) setPromotions(p => p.map(x => x.id === promo.id ? { ...x, is_active: promo.is_active } : x));
  }

  async function deletePromo(id: string) {
    setDeletingPromoId(id);
    setConfirmDeletePromoId(null);
    await (supabase as any).from("promotions").delete().eq("id", id);
    setPromotions(p => p.filter(x => x.id !== id));
    setDeletingPromoId(null);
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Loyalty & Promotions</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Reward your regulars and drive traffic with targeted offers.</p>
      </div>

      {/* Loyalty Programs */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Award size={20} style={{ color: "var(--accent-gold)" }} /> Stamp Programs
          </h2>
          {programs.length === 0 && (
            <button onClick={openAddProgram}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
              <Plus size={14} /> Create Program
            </button>
          )}
        </div>

        {programs.length === 0 ? (
          <div className="rounded-2xl border p-10 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-4xl mb-3">🎟️</p>
            <p className="font-display text-lg mb-1" style={{ color: "var(--text-primary)" }}>No loyalty program yet</p>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Replace your paper punch cards with a digital stamp card your customers will actually use.</p>
            <button onClick={openAddProgram}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
              Create Your First Program
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map(prog => (
              <div key={prog.id} className="flex items-center gap-4 p-5 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold" style={{ color: "var(--text-primary)" }}>{prog.name}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-mono", prog.is_active ? "bg-green-500/15 text-green-400" : "opacity-50")}
                      style={!prog.is_active ? { background: "var(--surface-2)", color: "var(--text-muted)" } : {}}>
                      {prog.is_active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {prog.stamps_required} stamps → {prog.reward_description}
                  </p>
                </div>
                {/* Stamp visual */}
                <div className="hidden sm:flex gap-1 flex-wrap max-w-[180px]">
                  {Array.from({ length: Math.min(prog.stamps_required, 10) }).map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs"
                      style={{ borderColor: "var(--accent-gold)", background: i < 3 ? "var(--accent-gold)" : "transparent" }}>
                      {i < 3 ? "★" : ""}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEditProgram(prog)}
                    className="p-2 rounded-lg transition-colors hover:opacity-70"
                    style={{ color: "var(--text-secondary)" }}>
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => toggleProgram(prog)} className="flex-shrink-0">
                    {prog.is_active
                      ? <ToggleRight size={26} style={{ color: "var(--accent-gold)" }} />
                      : <ToggleLeft size={26} style={{ color: "var(--text-muted)" }} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promotions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Tag size={20} style={{ color: "var(--accent-gold)" }} /> Promotions
          </h2>
          <button onClick={() => setShowPromoForm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
            <Plus size={14} /> Add Promo
          </button>
        </div>

        {promotions.length === 0 ? (
          <div className="rounded-2xl border p-10 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-4xl mb-3">🏷️</p>
            <p className="font-display text-lg mb-1" style={{ color: "var(--text-primary)" }}>No promotions yet</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Create a deal for slow sellers or happy hour specials visible to HopTrack users near you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promotions.map(promo => (
              <div key={promo.id} className="rounded-2xl border overflow-hidden"
                style={{ background: "var(--surface)", borderColor: confirmDeletePromoId === promo.id ? "var(--danger)" : "var(--border)" }}>
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{promo.title}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full")}
                        style={promo.is_active
                          ? { background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }
                          : { background: "var(--surface-2)", color: "var(--text-muted)" }}>
                        {promo.is_active ? "Live" : "Paused"}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {promo.discount_type === "percent" && promo.discount_value && `${promo.discount_value}% off`}
                      {promo.discount_type === "fixed" && promo.discount_value && `$${promo.discount_value} off`}
                      {promo.discount_type === "bogo" && "Buy one get one"}
                      {promo.discount_type === "free_item" && "Free item"}
                      {promo.ends_at && ` · Ends ${new Date(promo.ends_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePromo(promo)}>
                      {promo.is_active
                        ? <ToggleRight size={24} style={{ color: "var(--accent-gold)" }} />
                        : <ToggleLeft size={24} style={{ color: "var(--text-muted)" }} />}
                    </button>
                    <button
                      onClick={() => setConfirmDeletePromoId(confirmDeletePromoId === promo.id ? null : promo.id)}
                      disabled={deletingPromoId === promo.id}
                      className="p-1 transition-opacity hover:opacity-70 disabled:opacity-40"
                      style={{ color: confirmDeletePromoId === promo.id ? "var(--danger)" : "var(--text-secondary)" }}>
                      {deletingPromoId === promo.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

                {/* Inline delete confirmation */}
                <AnimatePresence>
                  {confirmDeletePromoId === promo.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-t"
                        style={{ background: "rgba(196,75,58,0.06)", borderColor: "var(--danger)" }}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={13} style={{ color: "var(--danger)" }} />
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            Delete <strong style={{ color: "var(--text-primary)" }}>{promo.title}</strong>?
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmDeletePromoId(null)}
                            className="px-3 py-1 rounded-lg text-xs font-medium"
                            style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}>
                            Cancel
                          </button>
                          <button onClick={() => deletePromo(promo.id)}
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
            ))}
          </div>
        )}
      </section>

      {/* Program Add/Edit Modal */}
      <AnimatePresence>
        {showProgramForm && (
          <FormModal
            title={editingProgram ? "Edit Loyalty Program" : "Create Loyalty Program"}
            onClose={() => { setShowProgramForm(false); setEditingProgram(null); }}
            onSave={saveProgram}
            saving={savingProgram}
            saveLabel={editingProgram ? "Save Changes" : "Create Program"}>
            <Field label="Program Name" required>
              <input value={programForm.name} onChange={e => setProgramForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. The Hop Club" style={inputStyle} />
            </Field>
            <Field label="Stamps Required">
              <input type="number" min="1" max="50" value={programForm.stamps_required}
                onChange={e => setProgramForm(f => ({ ...f, stamps_required: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Reward" required>
              <input value={programForm.reward_description}
                onChange={e => setProgramForm(f => ({ ...f, reward_description: e.target.value }))}
                placeholder="e.g. One free pint of any beer" style={inputStyle} />
            </Field>
            <Field label="Description">
              <textarea value={programForm.description}
                onChange={e => setProgramForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional details for your customers..." rows={2}
                style={{ ...inputStyle, resize: "none" as any }} />
            </Field>
          </FormModal>
        )}
        {showPromoForm && (
          <FormModal title="Create Promotion" onClose={() => setShowPromoForm(false)}
            onSave={savePromo} saving={savingPromo} saveLabel="Launch Promo">
            <Field label="Title" required>
              <input value={promoForm.title} onChange={e => setPromoForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Happy Hour — $2 Off All Pints" style={inputStyle} />
            </Field>
            <Field label="Discount Type">
              <select value={promoForm.discount_type} onChange={e => setPromoForm(f => ({ ...f, discount_type: e.target.value as any }))} style={inputStyle}>
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed $ off</option>
                <option value="bogo">Buy one get one</option>
                <option value="free_item">Free item</option>
              </select>
            </Field>
            {(promoForm.discount_type === "percent" || promoForm.discount_type === "fixed") && (
              <Field label={promoForm.discount_type === "percent" ? "Percent Off" : "Dollar Amount Off"}>
                <input type="number" min="0" step="0.5" value={promoForm.discount_value}
                  onChange={e => setPromoForm(f => ({ ...f, discount_value: e.target.value }))}
                  placeholder={promoForm.discount_type === "percent" ? "15" : "2.00"} style={inputStyle} />
              </Field>
            )}
            <Field label="Specific Beer (optional)">
              <select value={promoForm.beer_id} onChange={e => setPromoForm(f => ({ ...f, beer_id: e.target.value }))} style={inputStyle}>
                <option value="">All beers</option>
                {beers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="End Date (optional)">
              <input type="date" value={promoForm.ends_at} onChange={e => setPromoForm(f => ({ ...f, ends_at: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Description">
              <textarea value={promoForm.description} onChange={e => setPromoForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Any additional details..." rows={2} style={{ ...inputStyle, resize: "none" as any }} />
            </Field>
          </FormModal>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)",
  background: "var(--surface-2)", color: "var(--text-primary)", fontSize: 14, outline: "none",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}{required && " *"}
      </label>
      {children}
    </div>
  );
}

function FormModal({ title, onClose, onSave, saving, saveLabel, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; saveLabel: string; children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-lg rounded-2xl p-6 border space-y-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={20} /></button>
        </div>
        {children}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-medium border"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "transparent" }}>Cancel</button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
            {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <><Save size={16} />{saveLabel}</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
