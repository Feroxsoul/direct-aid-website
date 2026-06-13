"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "@/lib/admin/actions";

type ImageFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  onUrlChange?: (url: string) => void;
};

export function ImageField({
  name,
  label,
  defaultValue = "",
  required = false,
  onUrlChange,
}: ImageFieldProps) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setUrl(defaultValue);
  }, [defaultValue]);

  function updateUrl(nextUrl: string) {
    setUrl(nextUrl);
    onUrlChange?.(nextUrl);
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const publicUrl = await uploadImage(formData);
      if (mountedRef.current) {
        updateUrl(publicUrl);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "فشل رفع الصورة");
      }
    } finally {
      if (mountedRef.current) {
        setUploading(false);
      }
    }
  }

  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="url"
        className="admin-input"
        value={url}
        onChange={(event) => updateUrl(event.target.value)}
        required={required}
        dir="ltr"
      />
      <div className="admin-image-row">
        <label className="admin-upload-button">
          {uploading ? "جاري الرفع…" : "رفع صورة"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {url ? (
          <Image
            src={url}
            alt=""
            width={80}
            height={80}
            className="admin-thumb"
            unoptimized
          />
        ) : null}
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
