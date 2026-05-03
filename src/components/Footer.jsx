import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="eyebrow">VoltRush</p>
          <h3>Built for riders who expect more than transport.</h3>
          <p className="footer-copy">
            Premium electric bikes engineered for speed, control, and a cleaner
            future.
          </p>
        </div>

        <div>
          <p className="footer-title">Explore</p>
          <div className="footer-links">
            <Link to="/bikes">All Bikes</Link>
            <Link to="/about">Innovation</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/checkout">Checkout</Link>
          </div>
        </div>

        <div>
          <p className="footer-title">Follow</p>
          <div className="footer-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer">
              X / Twitter
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
