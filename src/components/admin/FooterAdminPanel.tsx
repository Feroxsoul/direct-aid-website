"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
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
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await saveFooterSettings(new FormData(event.currentTarget));
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/admin/footer?saved=1");
    router.refresh();
  }

  return (
    <div className="dash-page">
      <AdminPageHeader
        titleKey="page.footer"
        subtitleKey="footer.subtitle"
        saved={saved}
        savedKey="footer.saved"
      />

      <form onSubmit={handleSubmit} className="admin-form dash-panel">
        {error ? <p className="admin-error">{error}</p> : null}
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
        <button type="submit" className="admin-button" disabled={submitting}>
          {submitting ? t("common.uploading") : t("footer.save")}
        </button>
      </form>
    </div>
  );
}
