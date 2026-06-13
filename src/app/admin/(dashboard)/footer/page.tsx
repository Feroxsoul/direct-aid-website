import { saveFooterSettings } from "@/lib/admin/actions";
import { FooterLinksEditor } from "@/components/admin/FooterLinksEditor";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetSettings } from "@/lib/admin/data";
import {
  DEFAULT_FOOTER_COLUMNS,
  parseFooterColumns,
  settingsMap,
} from "@/lib/admin/settings-store";

type FooterAdminPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminFooterPage({ searchParams }: FooterAdminPageProps) {
  await requirePermission("homepage", "edit");
  const { saved } = await searchParams;
  const settings = settingsMap(await adminGetSettings());

  const columns = parseFooterColumns(settings.footer_columns_json);
  const tagline =
    settings.footer_tagline ??
    "تمكين المجتمعات من خلال التنمية المستدامة والعمل الإنساني الشفاف في جميع أنحاء العالم.";
  const copyright =
    settings.footer_copyright ?? "العون المباشر الدولي. جميع الحقوق محفوظة.";

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">Footer</h1>
        <p className="dash-page-subtitle">
          Manage footer link columns and brand text shown on the public Arabic site.
        </p>
      </header>

      {saved ? <p className="admin-success">Footer saved successfully.</p> : null}

      <form action={saveFooterSettings} className="admin-form dash-panel">
        <FooterLinksEditor
          initialColumns={columns.length ? columns : DEFAULT_FOOTER_COLUMNS}
          initialTagline={tagline}
          initialCopyright={copyright}
        />
        <button type="submit" className="admin-button">
          Save footer
        </button>
      </form>
    </div>
  );
}
