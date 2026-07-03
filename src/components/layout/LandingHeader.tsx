"use client";

import Image from "next/image";
import Link from "next/link";
import { LandingHeaderActions } from "@/components/layout/LandingHeaderActions";
import { usePublicLocale } from "@/lib/public-locale-context";

const CDN = "https://cdn.prod.website-files.com/632a01171b125a156b28c038";
const DEFAULT_LOGO = `${CDN}/64c8cde2258c815c760717a9_small.png`;

type LandingHeaderProps = {
  logoUrl?: string;
  siteTitle?: string;
  shareIconUrl?: string;
  shareTitle?: string;
  shareText?: string;
  whatsappHeaderUrl?: string;
};

export function LandingHeader({
  logoUrl,
  shareIconUrl,
  shareTitle,
  shareText,
  whatsappHeaderUrl,
}: LandingHeaderProps) {
  const { content } = usePublicLocale();
  const resolvedLogo = logoUrl || content.logo_url || DEFAULT_LOGO;
  const resolvedTitle = content.site_title;

  return (
    <header className="landing-header">
      <div className="landing-container landing-header-inner">
        <Link href="/" className="landing-logo">
          <Image
            src={resolvedLogo}
            alt={resolvedTitle}
            width={130}
            height={44}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <LandingHeaderActions
          whatsappHeaderUrl={whatsappHeaderUrl ?? content.whatsapp_header_url}
          shareIconUrl={shareIconUrl ?? content.share_icon_url}
          shareTitle={shareTitle ?? resolvedTitle}
          shareText={shareText ?? (content.site_description || resolvedTitle)}
          siteTitle={resolvedTitle}
        />
      </div>
    </header>
  );
}
