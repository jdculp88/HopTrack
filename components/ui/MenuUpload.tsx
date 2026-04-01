"use client";

import { useState, useRef } from "react";
import { Camera, FileText, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

interface MenuUploadProps {
  bucket: "brewery-covers";
  folder: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  maxSizeMb?: number;
  label?: string;
}

function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.toLowerCase().endsWith(".pdf");
}

export function MenuUpload({
  bucket,
  folder,
  currentUrl,
  onUpload,
  onRemove,
  maxSizeMb = 10,
  label = "Upload menu",
}: MenuUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localIsPdf, setLocalIsPdf] = useState(false);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [committedUrl, setCommittedUrl] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = localPreview ?? committedUrl;
  const showAsPdf = localIsPdf || isPdfUrl(committedUrl);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File must be under ${maxSizeMb}MB.`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please use a JPEG, PNG, WebP image, or a PDF.");
      return;
    }

    const isPdf = file.type === "application/pdf";
    setLocalIsPdf(isPdf);
    setLocalFileName(file.name);

    if (!isPdf) {
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
    } else {
      setLocalPreview("pdf-uploading");
    }

    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? (isPdf ? "pdf" : "jpg");
    const fileName = `${folder}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      if (!isPdf && localPreview && localPreview !== "pdf-uploading") {
        URL.revokeObjectURL(localPreview);
      }
      setLocalPreview(null);
      setLocalIsPdf(false);
      setLocalFileName(null);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    setCommittedUrl(publicUrl);
    if (!isPdf && localPreview && localPreview !== "pdf-uploading") {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    onUpload(publicUrl);
    setUploading(false);
  }

  function handleRemove() {
    if (localPreview && localPreview !== "pdf-uploading") {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setLocalIsPdf(false);
    setLocalFileName(null);
    setCommittedUrl(null);
    onRemove?.();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {displayUrl ? (
        <div
          className="relative rounded-2xl overflow-hidden border group w-full h-40"
          style={{ borderColor: "var(--border)" }}
        >
          {showAsPdf ? (
            // PDF preview state
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ background: "var(--surface)" }}
            >
              <FileText size={32} style={{ color: "var(--accent-gold)" }} />
              <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                {localFileName || "Menu PDF"}
              </span>
              {committedUrl && !uploading && (
                <a
                  href={committedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono underline"
                  style={{ color: "var(--accent-gold)" }}
                >
                  View PDF
                </a>
              )}
            </div>
          ) : (
            // Image preview state
            <img src={displayUrl} alt="Menu preview" className="w-full h-full object-cover" />
          )}

          {/* Loading overlay during upload */}
          {uploading && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent-gold)" }} />
            </div>
          )}

          {/* Hover controls */}
          {!uploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="p-2 rounded-full"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                <Camera size={16} />
              </button>
              {onRemove && (
                <button
                  onClick={handleRemove}
                  className="p-2 rounded-full"
                  style={{ background: "var(--danger)", color: "#fff" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:border-[var(--accent-gold)]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent-gold)" }} />
          ) : (
            <>
              <Camera size={20} />
              <span className="text-xs">{label}</span>
              <span className="text-xs opacity-60">Images or PDF</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <p className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>{error}</p>
      )}
    </div>
  );
}
