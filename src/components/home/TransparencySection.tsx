type TransparencySectionProps = {
  title?: string;
  text?: string;
  newsletterPlaceholder?: string;
  newsletterButton?: string;
};

export function TransparencySection({
  title = "راقب الشفافية",
  text = "ابقَ على اطلاع بآخر مستجدات عملياتنا الميدانية. نؤمن بالمساءلة الكاملة عن كل تبرع وكل حياة تتأثر من خلال مبادرة البركة 10×10.",
  newsletterPlaceholder = "أدخل بريدك الإلكتروني",
  newsletterButton = "انضم للمجتمع",
}: TransparencySectionProps) {
  return (
    <section id="transparency" aria-label="الشفافية" className="landing-transparency">
      <div className="landing-container">
        <div className="landing-transparency-shell">
          <div>
            <h2 className="landing-transparency-title">{title}</h2>
            <p className="landing-transparency-text">{text}</p>
          </div>
          <form className="landing-newsletter" action="#" method="post">
            <input
              type="email"
              className="landing-newsletter-input"
              placeholder={newsletterPlaceholder}
              aria-label="البريد الإلكتروني"
            />
            <button type="submit" className="landing-newsletter-btn">
              {newsletterButton}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
