import { saveMyProfile } from "@/lib/admin/actions";
import { AdminPageHeader, AdminText } from "@/components/admin/AdminPageHeader";
import { ImageField } from "@/components/admin/ImageField";
import { requireAdmin } from "@/lib/admin/auth";

type ProfilePageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminProfilePage({ searchParams }: ProfilePageProps) {
  const profile = await requireAdmin();
  const { saved } = await searchParams;

  return (
    <div className="dash-page">
      <AdminPageHeader
        titleKey="page.profile"
        subtitleKey="profile.subtitle"
        saved={Boolean(saved)}
        savedKey="profile.saved"
      />

      <form action={saveMyProfile} className="dash-panel admin-form">
        <div className="admin-field">
          <label className="admin-label">
            <AdminText k="profile.email" />
          </label>
          <input className="admin-input" value={profile.email} readOnly dir="ltr" />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="display_name">
            <AdminText k="profile.displayName" />
          </label>
          <input
            id="display_name"
            name="display_name"
            className="admin-input"
            defaultValue={profile.display_name ?? ""}
          />
        </div>

        <ImageField
          name="avatar_url"
          labelKey="profile.avatar"
          defaultValue={profile.avatar_url ?? ""}
        />

        <p className="admin-help-text">
          <AdminText k="profile.roleNote" vars={{ role: profile.role_name }} />
        </p>

        <button type="submit" className="dash-btn dash-btn--primary">
          <AdminText k="profile.save" />
        </button>
      </form>
    </div>
  );
}
