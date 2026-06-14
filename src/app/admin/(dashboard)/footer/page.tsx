import { FooterAdminPanel } from "@/components/admin/FooterAdminPanel";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetSettings } from "@/lib/admin/data";
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_FOOTER_DONATION_POLICY_URL,
  DEFAULT_FOOTER_LEGAL,
  DEFAULT_FOOTER_PRIVACY_URL,
  DEFAULT_FOOTER_SOCIAL,
  parseFooterColumns,
  parseFooterSocial,
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
  const social = parseFooterSocial(settings.footer_social_json);
  const tagline =
    settings.footer_tagline ??
    "جمعية العون المباشر — مؤسسة خيرية كويتية تعمل على تقديم العون الإنساني والتنموي في أكثر من 30 دولة.";
  const copyright = settings.footer_copyright ?? "جمعية العون المباشر. جميع الحقوق محفوظة.";

  return (
    <FooterAdminPanel
      initialColumns={columns.length ? columns : DEFAULT_FOOTER_COLUMNS}
      initialSocial={social.length ? social : DEFAULT_FOOTER_SOCIAL}
      initialTagline={tagline}
      initialCopyright={copyright}
      initialLegalLine={settings.footer_legal_line ?? DEFAULT_FOOTER_LEGAL}
      initialPrivacyUrl={settings.footer_privacy_url ?? DEFAULT_FOOTER_PRIVACY_URL}
      initialDonationPolicyUrl={
        settings.footer_donation_policy_url ?? DEFAULT_FOOTER_DONATION_POLICY_URL
      }
      showFooter={(settings.show_footer ?? "true") !== "false"}
      saved={saved === "1"}
    />
  );
}
