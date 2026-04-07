"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, QrCode, Download } from "lucide-react";
import QRCode from "react-qr-code";
import { useRef } from "react";

interface LoyaltyQRModalProps {
  open: boolean;
  onClose: () => void;
  breweryId: string;
  programName: string;
  stampsRequired: number;
  reward: string;
}

export function LoyaltyQRModal({ open, onClose, breweryId, programName, stampsRequired, reward }: LoyaltyQRModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/brewery/${breweryId}`;

  function handleDownload() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#0F0E0C"; // Canvas context — hardcoded for PNG export
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 40, 40, 320, 320);
      const link = document.createElement("a");
      link.download = `${programName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-3xl border p-6 space-y-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode size={16} style={{ color: "var(--accent-gold)" }} />
                  <h2 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>
                    Loyalty QR Code
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Program info */}
              <div className="rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
                <p className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{programName}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {stampsRequired} stamps → {reward}
                </p>
              </div>

              {/* QR Code */}
              <div ref={qrRef} className="flex items-center justify-center p-5 rounded-2xl" style={{ background: "var(--bg)" }}>
                <QRCode
                  value={url}
                  size={200}
                  bgColor="#0F0E0C"
                  fgColor="#D4A843"
                  level="M"
                />
              </div>

              {/* Instructions */}
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                Customers scan this to open their stamp card for your brewery. Print it and display it at the bar.
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                >
                  <Download size={14} />
                  Download PNG
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
