"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface MultiImageUploadProps {
  bucket: "brewery-covers";
  folder: string;
  currentUrls: string[];
  onUpdate: (urls: string[]) => void;
  maxImages?: number;
  maxSizeMb?: number;
}

export function MultiImageUpload({
  bucket,
  folder,
  currentUrls,
  onUpdate,
  maxImages = 3,
  maxSizeMb = 5,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File must be under ${maxSizeMb}MB.`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please use a JPEG, PNG, or WebP image.");
      return;
    }

    if (currentUrls.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
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
    onUpdate([...currentUrls, data.publicUrl]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(index: number) {
    const updated = currentUrls.filter((_, i) => i !== index);
    onUpdate(updated);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {currentUrls.map((url, i) => (
          <div
            key={url}
            className="relative rounded-xl overflow-hidden border group aspect-square"
            style={{ borderColor: "var(--border)" }}
          >
            <img src={url} alt={`Menu image ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => handleRemove(i)}
                className="p-2 rounded-full"
                style={{ background: "var(--danger)", color: "#fff" }}
              >
                <X size={14} />
              </button>
            </div>
            <span
              className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              {i + 1}
            </span>
          </div>
        ))}

        {currentUrls.length < maxImages && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl border-2 border-dashed aspect-square flex flex-col items-center justify-center gap-1 transition-colors hover:border-[var(--accent-gold)]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent-gold)" }} />
            ) : (
              <>
                {currentUrls.length === 0 ? <Camera size={18} /> : <Plus size={18} />}
                <span className="text-[10px]">
                  {currentUrls.length === 0 ? "Upload" : "Add"}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>
      )}

      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        Up to {maxImages} images · JPEG, PNG, or WebP · Max {maxSizeMb}MB each
      </p>
    </div>
  );
}
