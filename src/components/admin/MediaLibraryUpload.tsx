"use client";

import { useState } from "react";
import { uploadMediaAsset } from "@/lib/admin/actions";

export function MediaLibraryUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("file", file);
      await uploadMediaAsset(formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="dash-btn dash-btn--primary" style={{ cursor: "pointer" }}>
        {loading ? "Uploading…" : "Upload image"}
        <input
          type="file"
          accept="image/*"
          hidden
          disabled={loading}
          onChange={handleChange}
        />
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
