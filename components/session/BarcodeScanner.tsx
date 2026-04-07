"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, Loader2, AlertCircle, Beer } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BarcodeScanResult {
  beerId: string;
  beerName: string;
  breweryName: string;
  style: string;
}

interface BarcodeScannerProps {
  onBeerFound: (result: BarcodeScanResult) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onBeerFound, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<"initializing" | "scanning" | "found" | "not_found" | "error" | "unsupported">("initializing");
  const [errorMsg, setErrorMsg] = useState("");
  const [foundBeer, setFoundBeer] = useState<BarcodeScanResult | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState("");

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const lookupBarcode = useCallback(async (code: string) => {
    if (code === lastScannedCode) return;
    setLastScannedCode(code);

    try {
      const res = await fetch(`/api/beers/barcode/${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.found && data.data) {
        const result: BarcodeScanResult = {
          beerId: data.data.id,
          beerName: data.data.name,
          breweryName: data.data.brewery?.name ?? "Unknown brewery",
          style: data.data.style ?? "",
        };
        setFoundBeer(result);
        setStatus("found");
        stopCamera();
      } else {
        setStatus("not_found");
        // Reset after 2s so user can scan another
        setTimeout(() => {
          setStatus("scanning");
          setLastScannedCode("");
        }, 2000);
      }
    } catch {
      // Network error — keep scanning
      setLastScannedCode("");
    }
  }, [lastScannedCode, stopCamera]);

  useEffect(() => {
    // Check for BarcodeDetector support
    if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unsupported");
      return;
    }

    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new (window as any).BarcodeDetector({ // BarcodeDetector API not in TS stdlib
          formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
        });

        setStatus("scanning");

        // Scan every 500ms
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) {
                lookupBarcode(code);
              }
            }
          } catch {
            // Detection failed — keep scanning
          }
        }, 500);
      } catch (err: any) {
        if (!mounted) return;
        if (err.name === "NotAllowedError") {
          setErrorMsg("Camera access denied. Please allow camera access to scan barcodes.");
        } else if (err.name === "NotFoundError") {
          setErrorMsg("No camera found on this device.");
        } else {
          setErrorMsg("Could not start camera. Try again.");
        }
        setStatus("error");
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [lookupBarcode, stopCamera]);

  function handleUseBeer() {
    if (foundBeer) {
      onBeerFound(foundBeer);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#000" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(0,0,0,0.8)" }}>
        <span className="text-sm font-display font-bold text-white">Scan Barcode</span>
        <button
          onClick={() => { stopCamera(); onClose(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <X size={16} className="text-white" />
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        {status === "scanning" && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {/* Scan target overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-64 h-40 rounded-2xl border-2"
                style={{ borderColor: "var(--accent-gold)", boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }}
              />
            </div>
            <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/70">
              Point camera at the barcode on a can or bottle
            </p>
          </>
        )}

        {status === "initializing" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 size={32} className="text-white animate-spin" />
            <p className="text-sm text-white/70">Starting camera...</p>
          </div>
        )}

        {status === "unsupported" && (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
            <Camera size={48} className="text-white/40" />
            <p className="text-lg font-display font-bold text-white">Barcode scanning not supported</p>
            <p className="text-sm text-white/60">
              Your browser doesn't support barcode detection yet. Try Chrome on Android, or use the beer search to find your beer.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "var(--accent-gold)", color: "#000" }}
            >
              Use Search Instead
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
            <AlertCircle size={48} className="text-red-400" />
            <p className="text-lg font-display font-bold text-white">Camera Error</p>
            <p className="text-sm text-white/60">{errorMsg}</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "var(--accent-gold)", color: "#000" }}
            >
              Close
            </button>
          </div>
        )}

        {status === "not_found" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
            <AlertCircle size={48} style={{ color: "var(--accent-gold)" }} />
            <p className="text-lg font-display font-bold text-white mt-3">Beer not found</p>
            <p className="text-sm text-white/60 mt-1">This barcode isn't in our database yet</p>
            <p className="text-xs text-white/40 mt-1">Scanning again...</p>
          </div>
        )}

        <AnimatePresence>
          {status === "found" && foundBeer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6"
              style={{ background: "rgba(0,0,0,0.9)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(212,168,67,0.2)" }}
              >
                <Beer size={32} style={{ color: "var(--accent-gold)" }} />
              </div>
              <p className="text-xl font-display font-bold text-white text-center">{foundBeer.beerName}</p>
              <p className="text-sm text-white/60 mt-1">{foundBeer.breweryName}</p>
              {foundBeer.style && (
                <span
                  className="mt-2 px-3 py-1 rounded-full text-xs font-mono"
                  style={{ background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }}
                >
                  {foundBeer.style}
                </span>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setStatus("scanning"); setLastScannedCode(""); setFoundBeer(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  Scan Another
                </button>
                <button
                  onClick={handleUseBeer}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: "var(--accent-gold)", color: "#000" }}
                >
                  Use This Beer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/** Scan button that opens the barcode scanner */
export function BarcodeScanButton({ onBeerFound }: { onBeerFound: (result: BarcodeScanResult) => void }) {
  const [open, setOpen] = useState(false);

  // Only show if BarcodeDetector might be available (don't show on desktop Safari, etc.)
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported("BarcodeDetector" in window);
  }, []);

  if (!supported) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
        style={{
          background: "rgba(212,168,67,0.1)",
          borderColor: "rgba(212,168,67,0.3)",
          color: "var(--accent-gold)",
        }}
      >
        <Camera size={14} />
        Scan
      </button>
      <AnimatePresence>
        {open && (
          <BarcodeScanner
            onBeerFound={(result) => { onBeerFound(result); setOpen(false); }}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
