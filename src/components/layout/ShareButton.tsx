"use client";

import Image from "next/image";

const CDN = "https://cdn.prod.website-files.com/632a01171b125a156b28c038";
const DEFAULT_SHARE_ICON = `${CDN}/6354b9e95ee93e437d920d4b_Share.svg`;

type ShareButtonProps = {
  iconUrl?: string;
  label?: string;
  title?: string;
  text?: string;
  className?: string;
};

export function ShareButton({
  iconUrl = DEFAULT_SHARE_ICON,
  label = "مشاركة",
  title,
  text,
  className = "landing-share-btn",
}: ShareButtonProps) {
  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: title ?? document.title,
      text: text ?? title ?? document.title,
      url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => void handleShare()}
    >
      <Image src={iconUrl} alt="" width={20} height={20} className="h-5 w-5" aria-hidden />
    </button>
  );
}
