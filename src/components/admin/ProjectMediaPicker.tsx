"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { uploadImage } from "@/lib/admin/actions";
import { normalizeCdnImageUrl } from "@/lib/image-url";

type ProjectMediaPickerProps = {
  imageUrl: string;
  galleryUrls?: string[];
};

export function ProjectMediaPicker({
  imageUrl,
  galleryUrls = [],
}: ProjectMediaPickerProps) {
  const initialGallery = useMemo(
    () =>
      Array.from(
        new Set(
          [...galleryUrls, imageUrl]
            .map((url) => normalizeCdnImageUrl(url))
            .filter(Boolean),
        ),
      ),
    [galleryUrls, imageUrl],
  );

  const [mainImage, setMainImage] = useState(
    normalizeCdnImageUrl(imageUrl) || initialGallery[0] || "",
  );
  const [images, setImages] = useState(initialGallery);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const galleryOnly = images.filter((url) => url !== mainImage);

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

      setImages((current) => Array.from(new Set([...current, ...uploaded])));
      if (!mainImage && uploaded[0]) {
        setMainImage(uploaded[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((current) => current.filter((item) => item !== url));
    if (mainImage === url) {
      setMainImage("");
    }
  }

  return (
    <div className="admin-field project-media-picker">
      <label className="admin-label">Project Images</label>
      <p className="admin-help-text">
        Upload multiple images, then click any thumbnail to set it as the main card image.
      </p>

      <input type="hidden" name="image_url" value={mainImage} required />
      <input type="hidden" name="gallery_urls" value={galleryOnly.join("\n")} />

      <div className="project-media-grid">
        {images.length === 0 ? (
          <p className="admin-setup-note">No images yet. Upload project photos below.</p>
        ) : (
          images.map((url) => {
            const isMain = url === mainImage;
            return (
              <button
                key={url}
                type="button"
                className={`project-media-thumb${isMain ? " is-main" : ""}`}
                onClick={() => setMainImage(url)}
                title={isMain ? "Main image" : "Set as main image"}
              >
                <Image src={url} alt="" width={140} height={100} className="object-cover" unoptimized />
                {isMain ? <span className="project-media-badge">Main</span> : null}
                <span
                  role="button"
                  tabIndex={0}
                  className="project-media-remove"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeImage(url);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      removeImage(url);
                    }
                  }}
                >
                  ×
                </span>
              </button>
            );
          })
        )}
      </div>

      <label className="admin-upload-button">
        {uploading ? "Uploading…" : "Upload images (multiple)"}
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
