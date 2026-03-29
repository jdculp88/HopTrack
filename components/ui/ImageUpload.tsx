"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  bucket: "beer-photos" | "brewery-covers";
  /** Path prefix inside bucket — e.g. userId or breweryId */
  folder: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  /** Shape of the preview */
  aspect?: "square" | "cover";
  /** Max file size in MB */
  maxSizeMb?: number;
  label?: string;
}

export function ImageUpload({
  bucket,
  folder,
  currentUrl,
  onUpload,
  onRemove,
  aspect = "square",
  maxSizeMb = 5,
  label = "Upload photo",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMb}MB.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${folder}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    setPreview(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
  }

  function handleRemove() {
    setPreview(null);
    onRemove?.();
    if (inputRef.current) inputRef.current.value = "";
  }

  const isSquare = aspect === "square";

  return (
    <div>
      {preview ? (
        <div className={`relative rounded-2xl overflow-hidden border group ${isSquare ? "w-32 h-32" : "w-full h-40"}`}
          style={{ borderColor: "var(--border)" }}>
          <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
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
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:border-[var(--accent-gold)] ${isSquare ? "w-32 h-32" : "w-full h-40"}`}
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent-gold)" }} />
          ) : (
            <>
              <Camera size={20} />
              <span className="text-xs">{label}</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
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
