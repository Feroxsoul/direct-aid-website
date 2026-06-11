"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadImage } from "@/lib/admin/actions";

type GalleryFieldProps = {
  name: string;
  label: string;
  defaultValue?: string[];
};

export function GalleryField({
  name,
  label,
  defaultValue = [],
}: GalleryFieldProps) {
  const [urls, setUrls] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError("");

    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        uploaded.push(await uploadImage(formData));
      }
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeUrl(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <input type="hidden" name={name} value={urls.join("\n")} />

      {urls.length > 0 ? (
        <ul className="admin-gallery-list">
          {urls.map((url, index) => (
            <li key={`${url}-${index}`} className="admin-gallery-item">
              <Image
                src={url}
                alt=""
                width={64}
                height={64}
                className="admin-thumb"
                unoptimized
              />
              <span className="admin-gallery-url" dir="ltr">
                {url}
              </span>
              <button
                type="button"
                className="admin-gallery-remove"
                onClick={() => removeUrl(index)}
              >
                حذف
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-setup-note">لا توجد صور في المعرض بعد.</p>
      )}

      <label className="admin-upload-button">
        {uploading ? "جاري الرفع…" : "رفع صور للمعرض"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
