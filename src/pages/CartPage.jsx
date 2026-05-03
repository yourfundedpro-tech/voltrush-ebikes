import { Link } from "react-router-dom";
import { useCart } from "../state/CartContext";

export default function CartPage() {
  const { items, summary, updateQuantity } = useCart();

  return (
    <section className="section page-top">
      <div className="container checkout-layout">
        <div className="cart-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Shopping cart</p>
              <h1>Your ride lineup</h1>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <p>Your cart is empty.</p>
              <Link className="button button--primary" to="/bikes">
                Browse bikes
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item__media">
                  <div className="cart-item__image-wrap">
                    <img className="cart-item__image" src={item.image} alt={item.name} />
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.tagline}</p>
                    {item.selectedColor ? (
                      <p className="cart-item__variant">Color: {item.selectedColor}</p>
                    ) : null}
                  </div>
                </div>
                <div className="cart-item__actions">
                  <span>${item.price.toLocaleString()}</span>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.id, Number(event.target.value))
                    }
                    aria-label={`${item.name} quantity`}
                  />
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="summary-card">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${summary.subtotal.toLocaleString()}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>${summary.shipping.toLocaleString()}</strong>
          </div>
          <div className="summary-row">
            <span>Estimated tax</span>
            <strong>${Math.round(summary.tax).toLocaleString()}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>${Math.round(summary.total).toLocaleString()}</strong>
          </div>
          <Link className="button button--primary button--block" to="/checkout">
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
