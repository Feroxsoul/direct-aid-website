"use client";

import { saveFooterSettings } from "@/lib/admin/actions";
import { FooterLinksEditor } from "@/components/admin/FooterLinksEditor";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminLang } from "@/lib/admin/i18n-context";
import type { FooterColumn, FooterSocialLink } from "@/lib/admin/settings-store";

type FooterAdminPanelProps = {
  initialColumns: FooterColumn[];
  initialSocial: FooterSocialLink[];
  initialTagline: string;
  initialCopyright: string;
  initialLegalLine: string;
  initialPrivacyUrl: string;
  initialDonationPolicyUrl: string;
  showFooter: boolean;
  saved?: boolean;
};

export function FooterAdminPanel({
  initialColumns,
  initialSocial,
  initialTagline,
  initialCopyright,
  initialLegalLine,
  initialPrivacyUrl,
  initialDonationPolicyUrl,
  showFooter,
  saved,
}: FooterAdminPanelProps) {
  const { t } = useAdminLang();

  return (
    <div className="dash-page">
      <AdminPageHeader
        titleKey="page.footer"
        subtitleKey="footer.subtitle"
        saved={saved}
        savedKey="footer.saved"
      />

      <form action={saveFooterSettings} className="admin-form dash-panel">
        <div className="admin-field">
          <label className="admin-checkbox-label">
            <input type="checkbox" name="show_footer" defaultChecked={showFooter} />
            {t("footer.show")}
          </label>
          <p className="admin-help-text">{t("footer.showHelp")}</p>
        </div>

        <FooterLinksEditor
          initialColumns={initialColumns}
          initialSocial={initialSocial}
          initialTagline={initialTagline}
          initialCopyright={initialCopyright}
          initialLegalLine={initialLegalLine}
          initialPrivacyUrl={initialPrivacyUrl}
          initialDonationPolicyUrl={initialDonationPolicyUrl}
        />
        <button type="submit" className="admin-button">
          {t("footer.save")}
        </button>
      </form>
    </div>
  );
}
