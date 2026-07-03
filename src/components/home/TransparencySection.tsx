"use client";

import { usePublicLocale } from "@/lib/public-locale-context";
import { useSiteLang } from "@/lib/site-i18n-context";

type TransparencySectionProps = {
  title?: string;
  text?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  subscribeButtonLabel?: string;
};

function buildWhatsAppUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function TransparencySection({
  title = "راقب الشفافية",
  text = "ابقَ على اطلاع بآخر مستجدات عملياتنا الميدانية. نؤمن بالمساءلة الكاملة عن كل تبرع وكل حياة تتأثر من خلال مبادرة البركة 10×10.",
  whatsappNumber = "9651866888",
  whatsappMessage = "اشتراك",
  subscribeButtonLabel = "اشتراك",
}: TransparencySectionProps) {
  const { t } = useSiteLang();
  const { content } = usePublicLocale();
  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber || content.whatsapp_number,
    whatsappMessage || content.whatsapp_subscribe_message,
  );

  return (
    <section id="transparency" aria-label={t("transparency.aria")} className="landing-transparency">
      <div className="landing-container">
        <div className="landing-transparency-shell">
          <div>
            <h2 className="landing-transparency-title">
              {content.transparency_title || title}
            </h2>
            <p className="landing-transparency-text">{content.transparency_text || text}</p>
          </div>
          <div className="landing-subscribe-action">
            <a
              href={whatsappUrl}
              className="landing-newsletter-btn landing-newsletter-btn--whatsapp"
              target="_blank"
              rel="noreferrer"
            >
              {content.whatsapp_subscribe_button || subscribeButtonLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
