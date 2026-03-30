"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Printer, QrCode, Check } from "lucide-react";
import QRCode from "qrcode";
import { HopMark } from "@/components/ui/HopMark";

interface QRTentClientProps {
  breweryId: string;
  breweryName: string;
  breweryCity: string;
  breweryState: string;
}

const TENT_SIZES = [
  { id: "table", label: "Table Tent", w: 400, h: 560, desc: "Standard 4×5.5in — folds to stand on tables" },
  { id: "coaster", label: "Coaster Card", w: 320, h: 320, desc: "3.5×3.5in square — perfect for coasters" },
  { id: "poster", label: "Poster Insert", w: 480, h: 640, desc: "5×6.5in — frame or mount near entrance" },
] as const;

type TentSize = typeof TENT_SIZES[number]["id"];

export function QRTentClient({ breweryId, breweryName, breweryCity, breweryState }: QRTentClientProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<TentSize>("table");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const breweryUrl = `${typeof window !== "undefined" ? window.location.origin : "https://app.hoptrack.beer"}/brewery-welcome/${breweryId}`;

  useEffect(() => {
    QRCode.toDataURL(breweryUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#1A1714", light: "#FBF7F0" },
      errorCorrectionLevel: "H",
    }).then(setQrDataUrl);
  }, [breweryUrl]);

  const size = TENT_SIZES.find(s => s.id === selectedSize)!;

  function copyUrl() {
    navigator.clipboard.writeText(breweryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadPNG() {
    if (!qrDataUrl) return;
    const canvas = document.createElement("canvas");
    canvas.width = size.w * 2; // 2x for retina
    canvas.height = size.h * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = "#FBF7F0";
    ctx.fillRect(0, 0, size.w, size.h);

    // Gold top bar
    ctx.fillStyle = "#D4A843";
    ctx.fillRect(0, 0, size.w, 6);

    // HopTrack wordmark — Playfair Display italic (Option A)
    ctx.fillStyle = "#1A1714";
    ctx.font = "italic 500 20px 'Playfair Display', Georgia, serif";
    ctx.letterSpacing = "-0.5px";
    ctx.textAlign = "center";
    ctx.fillText("Hop", size.w / 2 - 14, 40);
    ctx.font = "italic bold 20px 'Playfair Display', Georgia, serif";
    ctx.fillText("Track", size.w / 2 + 16, 40);

    // Gold rule
    ctx.strokeStyle = "#A67820";
    ctx.lineWidth = 0.75;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.moveTo(size.w / 2 - 52, 46);
    ctx.lineTo(size.w / 2 + 52, 46);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // QR code
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise<void>(r => { qrImg.onload = () => r(); });
    const qrSize = Math.min(size.w - 80, 200);
    const qrX = (size.w - qrSize) / 2;
    const qrY = 65;
    // QR background rounded rect
    ctx.fillStyle = "#FBF7F0";
    ctx.beginPath();
    (ctx as any).roundRect?.(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12) ??
      ctx.rect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
    ctx.fill();
    ctx.strokeStyle = "#E5DDD0";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // Brewery name
    const textY = qrY + qrSize + 40;
    ctx.fillStyle = "#1A1714";
    ctx.font = `italic 400 ${selectedSize === "coaster" ? 22 : 26}px 'Georgia', serif`;
    ctx.letterSpacing = "0px";
    ctx.textAlign = "center";
    // Wrap long names
    const maxW = size.w - 60;
    const words = breweryName.split(" ");
    let line = "";
    let lines: string[] = [];
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, size.w / 2, textY + i * 32));

    const locationY = textY + lines.length * 32 + 10;
    if (breweryCity) {
      ctx.fillStyle = "#6B5E4E";
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.letterSpacing = "2px";
      ctx.fillText(`${breweryCity.toUpperCase()}${breweryState ? `, ${breweryState}` : ""}`, size.w / 2, locationY);
    }

    // CTA
    const ctaY = size.h - 52;
    ctx.fillStyle = "rgba(212,168,67,0.12)";
    ctx.beginPath();
    (ctx as any).roundRect?.(size.w / 2 - 100, ctaY - 20, 200, 32, 8) ??
      ctx.rect(size.w / 2 - 100, ctaY - 20, 200, 32);
    ctx.fill();
    ctx.fillStyle = "#D4A843";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.letterSpacing = "2px";
    ctx.fillText("SCAN TO TRACK YOUR POURS", size.w / 2, ctaY - 1);

    // Gold bottom bar
    ctx.fillStyle = "#D4A843";
    ctx.fillRect(0, size.h - 6, size.w, 6);

    const link = document.createElement("a");
    link.download = `hoptrack-tent-${breweryName.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function printTent() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(getTentHTML(size.w, size.h, true));
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  function getTentHTML(w: number, h: number, forPrint = false): string {
    const qrSz = Math.min(w - 80, 200);
    const fontSz = selectedSize === "coaster" ? 22 : 26;
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500;1,700&family=DM+Sans:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: ${forPrint ? "#fff" : "#e5e5e5"}; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
  .tent {
    width: ${w}px; height: ${h}px;
    background: #FBF7F0;
    display: flex; flex-direction: column; align-items: center;
    position: relative; overflow: hidden;
    ${forPrint ? "" : "box-shadow: 0 8px 40px rgba(0,0,0,0.15);"}
  }
  .bar-top { width: 100%; height: 6px; background: #D4A843; flex-shrink: 0; }
  .bar-bottom { width: 100%; height: 6px; background: #D4A843; flex-shrink: 0; margin-top: auto; }
  .wordmark { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 500; font-size: 18px; letter-spacing: -0.3px; color: #1A1714; margin-top: 18px; }
  .divider { width: 80px; height: 1px; background: #D4A843; margin: 12px auto; }
  .qr-wrap { padding: 10px; background: #FBF7F0; border-radius: 12px; border: 1.5px solid #E5DDD0; margin: 4px 0; }
  .qr-wrap img { display: block; width: ${qrSz}px; height: ${qrSz}px; }
  .name { font-style: italic; font-size: ${fontSz}px; color: #1A1714; text-align: center; margin-top: 20px; padding: 0 24px; line-height: 1.25; }
  .location { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #6B5E4E; text-align: center; margin-top: 8px; text-transform: uppercase; }
  .cta { background: rgba(212,168,67,0.12); border-radius: 8px; padding: 7px 20px; margin-bottom: 18px; }
  .cta span { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 10px; letter-spacing: 2px; color: #D4A843; text-transform: uppercase; }
  @media print {
    body { background: #fff; }
    .tent { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="tent">
    <div class="bar-top"></div>
    <p class="wordmark">Hop<strong style="font-weight:700">Track</strong></p>
    <div class="divider"></div>
    <div class="qr-wrap"><img src="${qrDataUrl}" alt="QR Code" /></div>
    <p class="name">${breweryName}</p>
    ${breweryCity ? `<p class="location">${breweryCity}${breweryState ? `, ${breweryState}` : ""}</p>` : ""}
    <div style="flex:1"></div>
    <div class="cta"><span>Scan to track your pours</span></div>
    <div class="bar-bottom"></div>
  </div>
</body>
</html>`;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
      <div className="mb-6">
        <Link
          href={`/brewery-admin/${breweryId}`}
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-70"
          style={{ color: "var(--accent-gold)" }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          QR Table Tent
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Print or download branded QR codes that link guests directly to your HopTrack page.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Controls */}
        <div className="space-y-6">

          {/* Size picker */}
          <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Format</p>
            <div className="space-y-2">
              {TENT_SIZES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSize(s.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all"
                  style={
                    selectedSize === s.id
                      ? { background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)", borderColor: "color-mix(in srgb, var(--accent-gold) 40%, transparent)", color: "var(--text-primary)" }
                      : { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-secondary)" }
                  }
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${selectedSize === s.id ? "border-[var(--accent-gold)]" : "border-current opacity-40"}`}>
                    {selectedSize === s.id && <div className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>QR Links To</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs px-3 py-2 rounded-xl truncate" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                {breweryUrl}
              </code>
              <button
                onClick={copyUrl}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium flex-shrink-0 transition-all"
                style={{ background: copied ? "rgba(34,197,94,0.1)" : "var(--surface-2)", color: copied ? "#22c55e" : "var(--text-secondary)", border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "var(--border)"}` }}
              >
                {copied ? <><Check size={12} /> Copied</> : "Copy"}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={printTent}
              disabled={!qrDataUrl}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={downloadPNG}
              disabled={!qrDataUrl}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              <Download size={16} />
              Download PNG
            </button>
          </div>

          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Print on cardstock and fold for table tents. Laminate for durability.
          </p>
        </div>

        {/* Live preview */}
        <div>
          <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Preview</p>
          <div className="flex items-center justify-center rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)", minHeight: 400 }}>
            {qrDataUrl ? (
              <div
                style={{
                  width: Math.min(size.w, 320),
                  height: Math.min(size.h, (320 / size.w) * size.h),
                  background: "#FBF7F0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                  borderRadius: 8,
                  transform: `scale(${Math.min(320 / size.w, 1)})`,
                  transformOrigin: "top center",
                }}
              >
                {/* Gold top bar */}
                <div style={{ width: "100%", height: 6, background: "#D4A843", flexShrink: 0 }} />
                {/* Wordmark — Morgan's MP-5 lockup */}
                <div style={{ marginTop: 18 }}>
                  <HopMark variant="horizontal" theme="cream" height={22} />
                </div>
                {/* Divider */}
                <div style={{ width: 80, height: 1, background: "#D4A843", margin: "10px auto" }} />
                {/* QR */}
                <div style={{ padding: 10, background: "#FBF7F0", borderRadius: 12, border: "1.5px solid #E5DDD0", margin: "4px 0" }}>
                  <img src={qrDataUrl} alt="QR Code" style={{ display: "block", width: Math.min(size.w - 80, 160), height: Math.min(size.w - 80, 160) }} />
                </div>
                {/* Name */}
                <p style={{ fontStyle: "italic", fontSize: Math.min(selectedSize === "coaster" ? 22 : 26, 22), color: "#1A1714", textAlign: "center", margin: "16px 24px 0", lineHeight: 1.25 }}>
                  {breweryName}
                </p>
                {breweryCity && (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: "#6B5E4E", textAlign: "center", marginTop: 6, textTransform: "uppercase" }}>
                    {breweryCity}{breweryState ? `, ${breweryState}` : ""}
                  </p>
                )}
                {/* Spacer */}
                <div style={{ flex: 1 }} />
                {/* CTA */}
                <div style={{ background: "rgba(212,168,67,0.12)", borderRadius: 8, padding: "7px 20px", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#D4A843", textTransform: "uppercase" }}>
                    Scan to track your pours
                  </span>
                </div>
                {/* Powered by */}
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, letterSpacing: 1, color: "#B5A893", textTransform: "uppercase", marginBottom: 12 }}>
                  Download HopTrack — track every pour
                </p>
                {/* Gold bottom bar */}
                <div style={{ width: "100%", height: 6, background: "#D4A843", flexShrink: 0 }} />
              </div>
            ) : (
              <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <QrCode size={20} className="animate-pulse" />
                <span className="text-sm">Generating QR code...</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
