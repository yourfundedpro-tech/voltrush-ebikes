import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import Stars from "../components/Stars";
import { products, reviews, salePercent } from "../data/products";

export default function HomePage() {
  const featuredBike = products[0];

  return (
    <div className="page-stack">
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Premium electric bikes</p>
            <h1>Ride the Future</h1>
            <p className="hero__lede">
              Every bike, scooter, and conversion kit is live on the homepage now,
              with full-scroll browsing and a bold {salePercent}% off launch sale.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" to="/bikes">
                Shop Collection
              </Link>
              <Link className="button button--ghost" to={`/bikes/${featuredBike.slug}`}>
                View Featured Bike
              </Link>
            </div>
            <div className="hero__stats">
              <div>
                <strong>{featuredBike.range} mi</strong>
                <span>Range</span>
              </div>
              <div>
                <strong>{featuredBike.speed} mph</strong>
                <span>Top speed</span>
              </div>
              <div>
                <strong>${featuredBike.price.toLocaleString()}</strong>
                <span>Sale price now</span>
              </div>
            </div>
          </div>

          <div className="hero__visual card-panel hero__visual--image">
            <ProductImage
              className="hero__bike-image"
              src={featuredBike.image}
              alt={featuredBike.name}
              name={featuredBike.name}
              category={featuredBike.category}
              accent={featuredBike.accent}
              loading="eager"
            />
            <div className="hero__badge">
              <span>{salePercent}% off featured</span>
              <strong>{featuredBike.name}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Full collection</p>
              <h2>All bikes, scooters, and kits in one scrollable storefront.</h2>
            </div>
            <Link className="text-link" to="/bikes">
              Open catalog page
            </Link>
          </div>

          <div className="product-grid product-grid--full">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container split-panel">
          <div>
            <p className="eyebrow">Innovation + sustainability</p>
            <h2>Engineered to reduce impact without reducing excitement.</h2>
            <p>
              We use long-life battery systems, recyclable alloys, and modular
              components that are designed to stay on the road longer and waste less.
            </p>
            <Link className="button button--primary" to="/about">
              Discover our mission
            </Link>
          </div>

          <div className="feature-list">
            <article className="feature-card">
              <strong>48% lower footprint</strong>
              <p>
                Compared with short-distance car commutes across the first year of use.
              </p>
            </article>
            <article className="feature-card">
              <strong>Modular service design</strong>
              <p>
                Battery, drivetrain, and electronics can be upgraded without replacing
                the frame.
              </p>
            </article>
            <article className="feature-card">
              <strong>Smarter cities</strong>
              <p>
                Built for congestion relief, quieter streets, and better everyday
                movement.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Customer reviews</p>
              <h2>Trusted by riders who care about performance and design.</h2>
            </div>
          </div>

          <div className="reviews-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.name}>
                <Stars rating={review.rating} />
                <p>{review.text}</p>
                <strong>{review.name}</strong>
                <span>{review.title}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container newsletter">
          <div>
            <p className="eyebrow">Stay charged</p>
            <h2>Get product drops, ride stories, and launch updates.</h2>
          </div>
          <form className="newsletter__form">
            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
            />
            <button className="button button--primary" type="submit">
              Join Newsletter
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
