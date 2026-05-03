export default function AboutPage() {
  return (
    <section className="section page-top">
      <div className="container about-layout">
        <div>
          <p className="eyebrow">About VoltRush</p>
          <h1>Innovation that moves people and cities forward.</h1>
        </div>

        <div className="about-copy">
          <p>
            VoltRush was founded to close the gap between premium technology and
            everyday mobility. We believe electric bikes should feel fast,
            intelligent, and beautifully made.
          </p>
          <p>
            Our team combines industrial design, battery engineering, and urban
            transport thinking to build machines that are thrilling to ride and
            better for the environment.
          </p>
        </div>

        <div className="timeline-grid">
          <article className="feature-card">
            <strong>Advanced engineering</strong>
            <p>We develop high-efficiency drivetrains and thermal-safe battery packs for dependable daily performance.</p>
          </article>
          <article className="feature-card">
            <strong>Sustainable design</strong>
            <p>Modular frames, recyclable materials, and longer life cycles help reduce waste across ownership.</p>
          </article>
          <article className="feature-card">
            <strong>Human-centered mobility</strong>
            <p>Every geometry, interface, and smart feature is built around comfort, confidence, and delight.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
