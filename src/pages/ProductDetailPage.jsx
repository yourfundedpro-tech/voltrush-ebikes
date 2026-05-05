import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import BikeVisual from "../components/BikeVisual";
import ProductImage from "../components/ProductImage";
import Stars from "../components/Stars";
import { products } from "../data/products";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const product = products.find((item) => item.slug === slug);
  const [selectedColorId, setSelectedColorId] = useState(
    product?.colorOptions?.[0]?.id ?? null,
  );
  const imageShellRef = useRef(null);

  useEffect(() => {
    setSelectedColorId(product?.colorOptions?.[0]?.id ?? null);
  }, [product]);

  if (!product) {
    return (
      <section className="section page-top">
        <div className="container empty-state">
          <h1>Bike not found</h1>
          <Link className="button button--primary" to="/bikes">
            Back to collection
          </Link>
        </div>
      </section>
    );
  }

  const selectedColor =
    product.colorOptions?.find((option) => option.id === selectedColorId) ??
    null;
  const displayImage = selectedColor?.image ?? product.image;

  function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/signup", { state: { from: location.pathname } });
      return;
    }

    addToCart(
      {
        ...product,
        selectedColor: selectedColor?.name ?? product.color,
        image: displayImage,
      },
      {
        image: displayImage,
        fromRect: imageShellRef.current?.getBoundingClientRect() ?? null,
      },
    );
  }

  return (
    <section className="section page-top">
      <div className="container product-detail">
        <div className="card-panel product-detail__visual">
          {displayImage ? (
            <>
              <div className="product-detail__image-shell" ref={imageShellRef}>
                <ProductImage
                  className="product-detail__image"
                  src={displayImage}
                  alt={
                    selectedColor
                      ? `${product.name} in ${selectedColor.name}`
                      : product.name
                  }
                  name={product.name}
                  category={product.category}
                  accent={product.accent}
                  loading="eager"
                />
              </div>

              {product.colorOptions?.length ? (
                <div className="variant-strip" aria-label="Choose bike color">
                  {product.colorOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`variant-thumb ${
                        option.id === selectedColorId ? "is-active" : ""
                      }`}
                      type="button"
                      onClick={() => setSelectedColorId(option.id)}
                    >
                      <ProductImage
                        src={option.image}
                        alt={option.name}
                        name={`${product.name} ${option.name}`}
                        category={product.category}
                        accent={product.accent}
                        loading="lazy"
                      />
                      <span>{option.name}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <BikeVisual accent={product.accent} />
          )}
        </div>

        <div className="product-detail__copy">
          <p className="eyebrow">{product.brand ?? "VoltRush Series"}</p>
          <h1>{product.name}</h1>
          <p className="product-tagline">{product.tagline}</p>
          <p>{product.description}</p>

          {product.colorOptions?.length ? (
            <div className="color-selector">
              <div className="color-selector__header">
                <span>Color</span>
                <strong>{selectedColor?.name ?? product.color}</strong>
              </div>
              <div className="color-selector__dots" aria-label="Available colors">
                {product.colorOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`color-swatch ${
                      option.id === selectedColorId ? "is-active" : ""
                    }`}
                    style={{ "--swatch": option.hex }}
                    onClick={() => setSelectedColorId(option.id)}
                    aria-label={option.name}
                    title={option.name}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="spec-grid">
            <div>
              <span>Range</span>
              <strong>{product.range} miles</strong>
            </div>
            <div>
              <span>Top speed</span>
              <strong>{product.speed} mph</strong>
            </div>
            <div>
              <span>Motor</span>
              <strong>{product.motor}</strong>
            </div>
            <div>
              <span>Battery</span>
              <strong>{product.battery}</strong>
            </div>
            <div>
              <span>Frame</span>
              <strong>{product.frame}</strong>
            </div>
            <div>
              <span>Weight</span>
              <strong>{product.weight}</strong>
            </div>
          </div>

          <div className="price-row">
            <strong>${product.price.toLocaleString()}</strong>
            <button
              className="button button--primary"
              type="button"
              disabled={product.soldOut}
              onClick={handleAddToCart}
            >
              {product.soldOut ? "Sold Out" : "Add to Cart"}
            </button>
          </div>

          {product.soldOut ? (
            <p className="form-token">This model is currently sold out and unavailable to order.</p>
          ) : null}
          {!isAuthenticated && !product.soldOut ? (
            <p className="summary-note">
              You&apos;ll be asked to create an account before adding this bike to your basket.
            </p>
          ) : null}

          <div className="feature-badges">
            {product.features.map((feature) => (
              <span key={feature}>{feature}</span>
            ))}
          </div>

          <article className="inline-review">
            <Stars rating={5} />
            <p>{product.review.quote}</p>
            <strong>{product.review.author}</strong>
          </article>
        </div>
      </div>

      <div className="mobile-buybar">
        <div className="mobile-buybar__content container">
          <div className="mobile-buybar__info">
            <strong>{product.name}</strong>
            <span>
              ${product.price.toLocaleString()}
              {selectedColor?.name ? ` • ${selectedColor.name}` : ""}
            </span>
          </div>
          <button
            className="button button--primary"
            type="button"
            disabled={product.soldOut}
            onClick={handleAddToCart}
          >
            {product.soldOut ? "Sold Out" : "Buy Now"}
          </button>
        </div>
      </div>
    </section>
  );
}
