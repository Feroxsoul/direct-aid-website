"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { uploadImage } from "@/lib/admin/actions";
import { useAdminLang } from "@/lib/admin/i18n-context";
import { normalizeCdnImageUrl } from "@/lib/image-url";

type ProjectMediaPickerProps = {
  imageUrl: string;
  galleryUrls?: string[];
};

async function uploadFiles(files: FileList | File[]) {
  const uploaded: string[] = [];
  for (const file of Array.from(files)) {
    const formData = new FormData();
    formData.append("file", file);
    uploaded.push(await uploadImage(formData));
  }
  return uploaded;
}

export function ProjectMediaPicker({
  imageUrl,
  galleryUrls = [],
}: ProjectMediaPickerProps) {
  const { t } = useAdminLang();
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
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const galleryOnly = images.filter((url) => url !== mainImage);

  async function addFiles(files: FileList | File[] | null | undefined) {
    if (!files?.length) return;

    setUploading(true);
    setError("");

    try {
      const uploaded = await uploadFiles(files);
      setImages((current) => Array.from(new Set([...current, ...uploaded])));
      if (!mainImage && uploaded[0]) {
        setMainImage(uploaded[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    await addFiles(event.target.files);
    event.target.value = "";
  }

  function removeImage(url: string) {
    setImages((current) => current.filter((item) => item !== url));
    if (mainImage === url) {
      setMainImage("");
    }
  }

  return (
    <div className="admin-field project-media-picker">
      <label className="admin-label">{t("projectMedia.title")}</label>
      <p className="admin-help-text">{t("projectMedia.help")}</p>

      <input type="hidden" name="image_url" value={mainImage} />
      <input type="hidden" name="gallery_urls" value={galleryOnly.join("\n")} />

      <div
        className={`project-media-dropzone${dragging ? " is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles(event.dataTransfer.files);
        }}
        onClick={() => document.getElementById("project-media-input")?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            document.getElementById("project-media-input")?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {uploading ? t("common.uploading") : t("projectMedia.drop")}
      </div>

      <input
        id="project-media-input"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleUpload}
        disabled={uploading}
      />

      <div className="project-media-grid">
        {images.length === 0 ? (
          <p className="admin-setup-note">{t("projectMedia.empty")}</p>
        ) : (
          images.map((url) => {
            const isMain = url === mainImage;
            return (
              <button
                key={url}
                type="button"
                className={`project-media-thumb${isMain ? " is-main" : ""}`}
                onClick={() => setMainImage(url)}
                title={isMain ? t("projectMedia.main") : t("projectMedia.setMain")}
              >
                <Image src={url} alt="" width={140} height={100} className="object-cover" unoptimized />
                {isMain ? <span className="project-media-badge">{t("projectMedia.mainBadge")}</span> : null}
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

      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
