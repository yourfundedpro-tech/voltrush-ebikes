import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

export default function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    price: 6500,
    range: 20,
    speed: 15,
  });
  const searchTerm = searchParams.get("search")?.toLowerCase().trim() ?? "";

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        [product.name, product.tagline, product.description].some((value) =>
          value.toLowerCase().includes(searchTerm),
        );

      return (
        matchesSearch &&
        product.price <= filters.price &&
        product.range >= filters.range &&
        product.speed >= filters.speed
      );
    });
  }, [filters, searchTerm]);

  return (
    <section className="section page-top">
      <div className="container catalog-layout">
        <aside className="filter-panel">
          <p className="eyebrow">Refine collection</p>
          <h2>Find the right machine.</h2>

          <label>
            Max price: <strong>${filters.price.toLocaleString()}</strong>
            <input
              type="range"
              min="3000"
              max="6500"
              step="100"
              value={filters.price}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  price: Number(event.target.value),
                }))
              }
            />
          </label>

          <label>
            Minimum range: <strong>{filters.range} mi</strong>
            <input
              type="range"
              min="20"
              max="100"
              step="2"
              value={filters.range}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  range: Number(event.target.value),
                }))
              }
            />
          </label>

          <label>
            Minimum speed: <strong>{filters.speed} mph</strong>
            <input
              type="range"
              min="15"
              max="60"
              step="1"
              value={filters.speed}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  speed: Number(event.target.value),
                }))
              }
            />
          </label>
        </aside>

        <div>
          <div className="section-heading catalog-heading">
            <div>
              <p className="eyebrow">Electric bike lineup</p>
              <h1>Premium e-bikes with real-world performance.</h1>
            </div>
            <span className="results-count">
              {filteredProducts.length} models available
            </span>
          </div>

          {searchTerm ? (
            <p className="search-note">Showing results for "{searchTerm}".</p>
          ) : null}

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
