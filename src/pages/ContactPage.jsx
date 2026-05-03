export default function ContactPage() {
  return (
    <section className="section page-top">
      <div className="container contact-layout">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Talk to the VoltRush team.</h1>
          <p>
            Reach out for test ride bookings, product questions, fleet
            partnerships, or support.
          </p>

          <div className="contact-links">
            <a href="mailto:hello@voltrush.com">hello@voltrush.com</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">
              YouTube
            </a>
          </div>
        </div>

        <form className="contact-form">
          <input type="text" placeholder="Your name" aria-label="Your name" />
          <input type="email" placeholder="Email address" aria-label="Email address" />
          <input type="text" placeholder="Subject" aria-label="Subject" />
          <textarea
            rows="6"
            placeholder="Tell us what you're looking for"
            aria-label="Message"
          />
          <button className="button button--primary" type="submit">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
