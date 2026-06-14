import Image from "next/image";
import { MediaLibraryUpload } from "@/components/admin/MediaLibraryUpload";
import { AdminPageHeader, AdminText } from "@/components/admin/AdminPageHeader";
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
      <AdminPageHeader titleKey="page.media" subtitleKey="media.subtitle" />

      {canUpload ? (
        <div className="dash-panel">
          <MediaLibraryUpload />
        </div>
      ) : null}

      <div className="dash-panel">
        {assets.length === 0 ? (
          <p className="dash-empty"><AdminText k="media.empty" /></p>
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
