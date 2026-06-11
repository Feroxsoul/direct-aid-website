import Image from "next/image";
import Link from "next/link";

const CDN =
  "https://cdn.prod.website-files.com/632a01171b125a156b28c038";

const DEFAULT_LOGO = `${CDN}/64c8cde2258c815c760717a9_small.png`;
const DEFAULT_SHARE_ICON = `${CDN}/6354b9e95ee93e437d920d4b_Share.svg`;

type HeaderProps = {
  logoUrl?: string;
  shareIconUrl?: string;
  shareLabel?: string;
  siteTitle?: string;
};

export function Header({
  logoUrl = DEFAULT_LOGO,
  shareIconUrl = DEFAULT_SHARE_ICON,
  shareLabel = "المشاركة",
  siteTitle = "10x10 مشاريع",
}: HeaderProps) {
  return (
    <header className="menu-box da-flex-row-reverse flex w-full items-center justify-between self-stretch px-[var(--da-space-6)] pt-[var(--da-space-6)]">
      <div className="logo-box pt-[5px]">
        <Link href="/">
          <Image
            src={logoUrl}
            alt={siteTitle}
            width={120}
            height={40}
            className="h-auto w-auto"
            priority
          />
        </Link>
      </div>

      <Link
        href="#"
        className="share-button da-flex-row-reverse flex min-h-10 items-center justify-between self-center rounded-da-sm bg-da-lightgray px-3 text-da-gray no-underline me-[var(--da-space-6)]"
        aria-label={shareLabel}
      >
        <span className="da-text-button ps-2">{shareLabel}</span>
        <Image
          src={shareIconUrl}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
          aria-hidden
        />
      </Link>
    </header>
  );
}
