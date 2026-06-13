import Image from "next/image";
import { MediaLibraryUpload } from "@/components/admin/MediaLibraryUpload";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetMediaAssets } from "@/lib/admin/data";

export default async function AdminMediaPage() {
  const profile = await requirePermission("media", "view");
  const assets = await adminGetMediaAssets();
  const canUpload =
    profile.role_slug === "super_admin" ||
    profile.permissions.media?.create === true;

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">مكتبة الوسائط</h1>
        <p className="dash-page-subtitle">
          رفع وتصفح وإعادة استخدام الصور عبر المشاريع والصفحات.
        </p>
      </header>

      {canUpload ? (
        <div className="dash-panel">
          <MediaLibraryUpload />
        </div>
      ) : null}

      <div className="dash-panel">
        {assets.length === 0 ? (
          <p className="dash-empty">لم يُرفع أي ملف بعد.</p>
        ) : (
          <div className="dash-media-grid">
            {assets.map((asset) => (
              <div key={asset.id} className="dash-media-item">
                <Image
                  src={asset.url}
                  alt={asset.alt_text ?? asset.filename ?? "Media"}
                  width={300}
                  height={300}
                  className="dash-media-thumb"
                  unoptimized
                />
                <div className="dash-media-meta">
                  {asset.filename ?? asset.url.split("/").pop()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
