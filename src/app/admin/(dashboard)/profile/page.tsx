import { saveMyProfile } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { ImageField } from "@/components/admin/ImageField";

type ProfilePageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminProfilePage({ searchParams }: ProfilePageProps) {
  const profile = await requireAdmin();
  const { saved } = await searchParams;

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">My Profile</h1>
        <p className="dash-page-subtitle">
          Update your display name and profile photo.
        </p>
      </header>

      {saved ? <p className="admin-success">Profile saved.</p> : null}

      <form action={saveMyProfile} className="dash-panel admin-form">
        <div className="admin-field">
          <label className="admin-label">Email</label>
          <input className="admin-input" value={profile.email} readOnly dir="ltr" />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="display_name">
            Display name
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
          label="Profile photo URL"
          defaultValue={profile.avatar_url ?? ""}
        />

        <p className="admin-help-text">
          Role: {profile.role_name}. Password changes are handled by Super Admin in User Management.
        </p>

        <button type="submit" className="dash-btn dash-btn--primary">
          Save profile
        </button>
      </form>
    </div>
  );
}
