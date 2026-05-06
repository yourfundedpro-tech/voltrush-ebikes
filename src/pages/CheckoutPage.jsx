import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";

function buildShippingAddress(customerForm) {
  return `${customerForm.address}, ${customerForm.city}, ${customerForm.postcode}`;
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function InfoRow({ label, value }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function CheckoutPage() {
  const { summary, items, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferDetails, setTransferDetails] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    address: "",
    city: "",
    postcode: "",
  });

  useEffect(() => {
    setCustomerForm((current) => ({
      ...current,
      fullName: user?.name ?? current.fullName,
      email: user?.email ?? current.email,
    }));
  }, [user]);

  useEffect(() => {
    async function prepareCheckout() {
      if (!isAuthenticated) {
        setStatus("login-required");
        return;
      }

      if (items.length === 0) {
        setStatus("empty");
        return;
      }

      try {
        const config = await apiRequest("/api/bank-transfer/config", { method: "GET" });
        setTransferDetails(config);
        setStatus("ready");
      } catch (requestError) {
        setStatus("error");
        setError(requestError.message || "Unable to load bank transfer details.");
      }
    }

    prepareCheckout();
  }, [isAuthenticated, items]);

  const totals = useMemo(
    () => ({
      subtotal: summary.subtotal,
      shipping: summary.shipping,
      tax: summary.tax,
      total: summary.total,
    }),
    [summary.shipping, summary.subtotal, summary.tax, summary.total],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFeedback("");

    if (
      !customerForm.fullName.trim() ||
      !customerForm.email.trim() ||
      !customerForm.address.trim() ||
      !customerForm.city.trim() ||
      !customerForm.postcode.trim()
    ) {
      setError("Complete your customer and shipping details before placing the order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiRequest("/api/orders/bank-transfer", {
        method: "POST",
        body: JSON.stringify({
          items,
          shippingAddress: buildShippingAddress(customerForm),
          customer: {
            fullName: customerForm.fullName,
            email: customerForm.email,
          },
        }),
      });

      setPlacedOrder(data.order);
      setTransferDetails(data.transferDetails);
      setFeedback("Order placed. Send the bank transfer using the reference below.");
      clearCart();
    } catch (requestError) {
      setError(requestError.message || "Unable to place your bank transfer order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section page-top">
      <div className="container checkout-layout">
        {status === "login-required" ? (
          <div className="checkout-form">
            <p className="form-error">Log in before placing a bank transfer order.</p>
            <button
              className="button button--primary"
              type="button"
              onClick={() => navigate("/login", { state: { from: "/checkout" } })}
            >
              Login to Continue
            </button>
          </div>
        ) : null}

        {status === "empty" ? (
          <div className="checkout-form">
            <p className="form-error">Your cart is empty.</p>
            <button className="button button--primary" type="button" onClick={() => navigate("/bikes")}>
              Shop Products
            </button>
          </div>
        ) : null}

        {status === "loading" ? (
          <div className="checkout-form">
            <p className="summary-note">Loading bank transfer checkout...</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="checkout-form">
            <p className="form-error">{error}</p>
          </div>
        ) : null}

        {status === "ready" ? (
          <>
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Checkout</p>
                  <h1>Finish with bank transfer.</h1>
                </div>
              </div>

              <div className="checkout-block">
                <div className="checkout-block__header">
                  <h2>Customer details</h2>
                  <span>Used for delivery and payment matching</span>
                </div>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={customerForm.fullName}
                    onChange={(event) =>
                      setCustomerForm((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={customerForm.email}
                    onChange={(event) =>
                      setCustomerForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={customerForm.address}
                    onChange={(event) =>
                      setCustomerForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={customerForm.city}
                    onChange={(event) =>
                      setCustomerForm((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Postcode"
                    value={customerForm.postcode}
                    onChange={(event) =>
                      setCustomerForm((current) => ({
                        ...current,
                        postcode: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="checkout-block">
                <div className="checkout-block__header">
                  <h2>Bank transfer details</h2>
                  <span>Send your payment after placing the order</span>
                </div>
                <div className="bank-transfer-grid">
                  <InfoRow label="Account name" value={transferDetails?.accountName ?? "VoltRush"} />
                  <InfoRow label="Bank" value={transferDetails?.bankName ?? "Business account"} />
                  <InfoRow label="Sort code" value={transferDetails?.sortCode ?? "--"} />
                  <InfoRow label="Account number" value={transferDetails?.accountNumber ?? "--"} />
                  {transferDetails?.iban ? (
                    <InfoRow label="IBAN" value={transferDetails.iban} />
                  ) : null}
                  <InfoRow
                    label="Reference"
                    value={placedOrder?.transferDetails?.reference ?? "Generated after order placement"}
                  />
                </div>
              </div>

              <div className="bank-transfer-note">
                <strong>How it works</strong>
                <p>
                  Place the order first, then send the total by bank transfer using the exact reference we
                  give you. Your dashboard will show the order as awaiting transfer until payment is
                  received.
                </p>
              </div>

              {error ? <p className="form-error">{error}</p> : null}
              {feedback ? <p className="form-success">{feedback}</p> : null}

              {placedOrder ? (
                <div className="bank-transfer-confirmation">
                  <strong>{placedOrder.order_number} is now reserved.</strong>
                  <p>
                    Send {formatMoney(placedOrder.total_amount)} with reference{" "}
                    <strong>{placedOrder.transferDetails.reference}</strong>. Once the transfer arrives, the
                    order will move into processing.
                  </p>
                  <button className="button button--primary button--block" type="button" onClick={() => navigate("/account")}>
                    View My Account
                  </button>
                </div>
              ) : (
                <button className="button button--primary button--block" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Placing order..." : `Place order for ${formatMoney(totals.total)}`}
                </button>
              )}
            </form>

            <aside className="summary-card">
              <h2>Checkout summary</h2>
              <p>{items.length} item(s) in order</p>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{formatMoney(totals.subtotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <strong>{formatMoney(totals.shipping)}</strong>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <strong>{formatMoney(totals.tax)}</strong>
              </div>
              <div className="summary-row summary-row--total">
                <span>Total due today</span>
                <strong>{formatMoney(totals.total)}</strong>
              </div>
              <p className="summary-note">
                This checkout now uses bank transfer only. No PayPal or card provider is required.
              </p>
            </aside>
          </>
        ) : null}
      </div>
    </section>
  );
}
