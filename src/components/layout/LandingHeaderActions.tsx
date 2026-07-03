"use client";

import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ShareButton } from "@/components/layout/ShareButton";
import { WhatsAppHeaderButton } from "@/components/layout/WhatsAppHeaderButton";
import { useSiteLang } from "@/lib/site-i18n-context";

type LandingHeaderActionsProps = {
  whatsappHeaderUrl?: string;
  shareIconUrl?: string;
  shareTitle?: string;
  shareText?: string;
  siteTitle?: string;
};

export function LandingHeaderActions({
  whatsappHeaderUrl,
  shareIconUrl,
  shareTitle,
  shareText,
  siteTitle,
}: LandingHeaderActionsProps) {
  const { t } = useSiteLang();

  return (
    <div className="landing-header-actions-group">
      <LanguageToggle />
      {whatsappHeaderUrl ? (
        <WhatsAppHeaderButton href={whatsappHeaderUrl} label={t("whatsapp")} />
      ) : null}
      <ShareButton
        iconUrl={shareIconUrl}
        label={t("share")}
        title={shareTitle ?? siteTitle}
        text={shareText ?? siteTitle}
      />
    </div>
  );
}
