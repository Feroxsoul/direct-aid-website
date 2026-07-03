"use client";

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
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);

  return (
    <section id="transparency" aria-label={t("transparency.aria")} className="landing-transparency">
      <div className="landing-container">
        <div className="landing-transparency-shell">
          <div>
            <h2 className="landing-transparency-title">{title}</h2>
            <p className="landing-transparency-text">{text}</p>
          </div>
          <div className="landing-subscribe-action">
            <a
              href={whatsappUrl}
              className="landing-newsletter-btn landing-newsletter-btn--whatsapp"
              target="_blank"
              rel="noreferrer"
            >
              {subscribeButtonLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
