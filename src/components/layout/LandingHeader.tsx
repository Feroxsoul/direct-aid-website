import Image from "next/image";
import Link from "next/link";
import { ShareButton } from "@/components/layout/ShareButton";

const CDN = "https://cdn.prod.website-files.com/632a01171b125a156b28c038";
const DEFAULT_LOGO = `${CDN}/64c8cde2258c815c760717a9_small.png`;

type LandingHeaderProps = {
  logoUrl?: string;
  siteTitle?: string;
  shareIconUrl?: string;
  shareLabel?: string;
  shareTitle?: string;
  shareText?: string;
};

export function LandingHeader({
  logoUrl = DEFAULT_LOGO,
  siteTitle = "مشاريع 10×10",
  shareIconUrl,
  shareLabel = "مشاركة",
  shareTitle,
  shareText,
}: LandingHeaderProps) {
  return (
    <header className="landing-header">
      <div className="landing-container landing-header-inner">
        <Link href="/" className="landing-logo">
          <Image
            src={logoUrl}
            alt={siteTitle}
            width={130}
            height={44}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <ShareButton
          iconUrl={shareIconUrl}
          label={shareLabel}
          title={shareTitle ?? siteTitle}
          text={shareText ?? siteTitle}
        />
      </div>
    </header>
  );
}
