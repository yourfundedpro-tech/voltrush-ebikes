import { Link } from "react-router-dom";
import BikeVisual from "./BikeVisual";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }) {
  return (
    <Link
      className="product-card product-card--link"
      to={`/bikes/${product.slug}`}
      aria-label={`View ${product.name}`}
    >
      <div className="product-card__sale-badge">{product.salePercent}% OFF</div>

      {product.image ? (
        <div className="product-card__image-wrap">
          <ProductImage
            className="product-card__image"
            src={product.image}
            alt={product.name}
            name={product.name}
            category={product.category}
            accent={product.accent}
            loading="lazy"
          />
        </div>
      ) : (
        <BikeVisual accent={product.accent} compact />
      )}

      <div className="product-card__body">
        <p className="product-card__meta">
          {product.range} mi range • {product.speed} mph
        </p>
        <p className="product-card__category">{product.category}</p>
        <h3>{product.name}</h3>
        <p>{product.tagline}</p>

        {product.colorOptions?.length ? (
          <div className="product-card__swatches" aria-label={`${product.name} colors`}>
            {product.colorOptions.map((option) => (
              <span
                key={option.id}
                className="color-dot"
                title={option.name}
                style={{ "--swatch": option.hex }}
              />
            ))}
          </div>
        ) : null}

        <div className="product-card__footer">
          <div className="price-stack">
            <strong>${product.price.toLocaleString()}</strong>
            <span>${product.originalPrice.toLocaleString()}</span>
          </div>
          <span className="product-card__cta">View Item</span>
        </div>
      </div>
    </Link>
  );
}
