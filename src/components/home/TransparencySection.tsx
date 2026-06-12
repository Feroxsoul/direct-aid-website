export function TransparencySection() {
  return (
    <section id="transparency" aria-label="Transparency" className="landing-transparency">
      <div className="landing-container">
        <div className="landing-transparency-shell">
          <div>
            <h2 className="landing-transparency-title">Monitor Transparency</h2>
            <p className="landing-transparency-text">
              Stay informed with real-time updates on our field operations. We believe
              in total accountability for every donation received and every life
              impacted through the Al Baraka 10×10 initiative.
            </p>
          </div>
          <form className="landing-newsletter" action="#" method="post">
            <input
              type="email"
              className="landing-newsletter-input"
              placeholder="Enter your email address"
              aria-label="Email address"
            />
            <button type="submit" className="landing-newsletter-btn">
              JOIN COMMUNITY
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
