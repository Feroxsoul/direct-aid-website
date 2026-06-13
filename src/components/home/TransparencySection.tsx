export function TransparencySection() {
  return (
    <section id="transparency" aria-label="الشفافية" className="landing-transparency">
      <div className="landing-container">
        <div className="landing-transparency-shell">
          <div>
            <h2 className="landing-transparency-title">راقب الشفافية</h2>
            <p className="landing-transparency-text">
              ابقَ على اطلاع بآخر مستجدات عملياتنا الميدانية. نؤمن بالمساءلة
              الكاملة عن كل تبرع وكل حياة تتأثر من خلال مبادرة البركة 10×10.
            </p>
          </div>
          <form className="landing-newsletter" action="#" method="post">
            <input
              type="email"
              className="landing-newsletter-input"
              placeholder="أدخل بريدك الإلكتروني"
              aria-label="البريد الإلكتروني"
            />
            <button type="submit" className="landing-newsletter-btn">
              انضم للمجتمع
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
