import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";

function buildShippingAddress(customerForm) {
  return `${customerForm.address}, ${customerForm.city}, ${customerForm.postcode}, ${customerForm.country}`;
}

function formatMoney(value, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function StripeCheckoutForm({
  customerForm,
  setCustomerForm,
  items,
  clearCart,
  navigate,
  totals,
  promoCode,
  promoFeedback,
  onPromoCodeChange,
  onApplyPromoCode,
  walletMessage,
  walletHint,
  currency,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletsReady, setWalletsReady] = useState([]);

  async function finalizePaidOrder(paymentIntentId) {
    return apiRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        items,
        paymentIntentId,
        promoCode,
        shippingAddress: buildShippingAddress(customerForm),
        customer: {
          fullName: customerForm.fullName,
          email: customerForm.email,
        },
      }),
    });
  }

  function customerDetailsValid() {
    return (
      customerForm.fullName.trim() &&
      customerForm.email.trim() &&
      customerForm.address.trim() &&
      customerForm.city.trim() &&
      customerForm.postcode.trim() &&
      customerForm.country.trim()
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFeedback("");

    if (!stripe || !elements) {
      return;
    }

    if (!customerDetailsValid()) {
      setError("Complete your customer and shipping details before paying.");
      return;
    }

    setIsSubmitting(true);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        receipt_email: customerForm.email.trim(),
        payment_method_data: {
          billing_details: {
            name: customerForm.fullName.trim(),
            email: customerForm.email.trim(),
            address: {
              line1: customerForm.address.trim(),
              city: customerForm.city.trim(),
              postal_code: customerForm.postcode.trim(),
              country: customerForm.country.trim().slice(0, 2).toUpperCase(),
            },
          },
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message || "Payment could not be completed.");
      setIsSubmitting(false);
      return;
    }

    if (!paymentIntent?.id || paymentIntent.status !== "succeeded") {
      setError("Payment is still pending. Please try again in a moment.");
      setIsSubmitting(false);
      return;
    }

    try {
      await finalizePaidOrder(paymentIntent.id);
      clearCart();
      setFeedback("Payment approved through Stripe. Redirecting to your account...");
      setTimeout(() => navigate("/account"), 900);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExpressConfirm(event) {
    setError("");
    setFeedback("");

    if (!stripe || !elements) {
      event.paymentFailed({ message: "Stripe is still loading." });
      return;
    }

    if (!customerDetailsValid()) {
      const message = "Complete your shipping details before using Apple Pay or another wallet.";
      setError(message);
      event.paymentFailed({ reason: "invalid_shipping_address", message });
      return;
    }

    setIsSubmitting(true);

    const countryCode = customerForm.country.trim().slice(0, 2).toUpperCase();

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        receipt_email: customerForm.email.trim(),
        shipping: {
          name: customerForm.fullName.trim(),
          address: {
            line1: customerForm.address.trim(),
            city: customerForm.city.trim(),
            postal_code: customerForm.postcode.trim(),
            country: countryCode,
          },
        },
        payment_method_data: {
          billing_details: {
            name: customerForm.fullName.trim(),
            email: customerForm.email.trim(),
            address: {
              line1: customerForm.address.trim(),
              city: customerForm.city.trim(),
              postal_code: customerForm.postcode.trim(),
              country: countryCode,
            },
          },
        },
      },
    });

    if (stripeError) {
      const message = stripeError.message || "Wallet payment could not be completed.";
      setError(message);
      event.paymentFailed({ message });
      setIsSubmitting(false);
      return;
    }

    if (!paymentIntent?.id || paymentIntent.status !== "succeeded") {
      const message = "Wallet payment is still pending. Please try again.";
      setError(message);
      event.paymentFailed({ message });
      setIsSubmitting(false);
      return;
    }

    try {
      await finalizePaidOrder(paymentIntent.id);
      clearCart();
      setFeedback(
        event.expressPaymentType === "apple_pay"
          ? "Apple Pay approved. Redirecting to your account..."
          : "Wallet payment approved. Redirecting to your account...",
      );
      setTimeout(() => navigate("/account"), 900);
    } catch (requestError) {
      const message = requestError.message || "Order could not be completed after payment.";
      setError(message);
      event.paymentFailed({ message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Pay securely with Stripe.</h1>
        </div>
      </div>

      <div className="checkout-block">
        <div className="checkout-block__header">
          <h2>Customer details</h2>
          <span>Used for delivery and receipt emails</span>
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
          <input
            type="text"
            placeholder="Country"
            value={customerForm.country}
            onChange={(event) =>
              setCustomerForm((current) => ({
                ...current,
                country: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="checkout-block">
        <div className="checkout-block__header">
          <h2>Promo code</h2>
          <span>Use HAPPY to bring the total down to 150</span>
        </div>
        <div className="promo-code-row">
          <input
            type="text"
            placeholder="Enter discount code"
            value={promoCode}
            onChange={(event) => onPromoCodeChange(event.target.value)}
          />
          <button className="button button--ghost" type="button" onClick={onApplyPromoCode}>
            Apply
          </button>
        </div>
        {promoFeedback ? <p className="summary-note">{promoFeedback}</p> : null}
      </div>

      <div className="checkout-block">
        <div className="checkout-block__header">
          <h2>Payment</h2>
          <span>Cards, wallets, and Apple Pay when supported</span>
        </div>

        <div className="stripe-note">
          <strong>Stripe checkout is active.</strong>
          <p>
            Apple Pay appears automatically on supported Apple devices and Safari once your domain is
            registered with Stripe.
          </p>
        </div>

        <div className="express-checkout-shell">
          <div className="express-checkout-shell__header">
            <strong>Fast checkout</strong>
            <span>
              {walletsReady.includes("applePay") ? "Apple Pay is available on this device." : walletMessage}
            </span>
          </div>

          {walletHint ? <p className="express-checkout-shell__hint">{walletHint}</p> : null}

          <ExpressCheckoutElement
            onConfirm={handleExpressConfirm}
            onReady={(event) => {
              setWalletsReady(event.availablePaymentMethods ? Object.keys(event.availablePaymentMethods) : []);
            }}
            options={{
              layout: {
                maxColumns: 1,
                maxRows: 2,
                overflow: "auto",
              },
              buttonTheme: {
                applePay: "white-outline",
                googlePay: "white",
              },
              buttonHeight: 52,
            }}
          />
        </div>

        <PaymentElement
          options={{
            layout: "accordion",
            fields: {
              billingDetails: {
                name: "never",
                email: "never",
                address: "never",
              },
            },
          }}
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {feedback ? <p className="form-success">{feedback}</p> : null}

      <button className="button button--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : `Pay ${formatMoney(totals.total, currency)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { summary, items, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState("loading");
  const [setupError, setSetupError] = useState("");
  const [serverTotals, setServerTotals] = useState(null);
  const [currency, setCurrency] = useState("GBP");
  const [promoCode, setPromoCode] = useState("");
  const [promoFeedback, setPromoFeedback] = useState("");
  const [customerForm, setCustomerForm] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    address: "",
    city: "",
    postcode: "",
    country: "",
  });
  const isLocalHost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  useEffect(() => {
    setCustomerForm((current) => ({
      ...current,
      fullName: user?.name ?? current.fullName,
      email: user?.email ?? current.email,
    }));
  }, [user]);

  useEffect(() => {
    async function prepareStripeCheckout() {
      if (!isAuthenticated) {
        setStatus("login-required");
        return;
      }

      if (items.length === 0) {
        setStatus("empty");
        return;
      }

      setStatus("loading");
      setSetupError("");

      try {
        const config = await apiRequest("/api/payments/config", { method: "GET" });

        if (!config.configured || !config.publishableKey) {
          setStatus("not-configured");
          setSetupError(
            "Stripe is not configured yet. Add your Stripe keys before taking live payments.",
          );
          return;
        }

        setStripePromise(loadStripe(config.publishableKey));
        setCurrency(String(config.currency || "gbp").toUpperCase());

        const intent = await apiRequest("/api/payments/create-intent", {
          method: "POST",
          body: JSON.stringify({ items, promoCode }),
        });

        setClientSecret(intent.clientSecret);
        setServerTotals(intent.totals);
        setCurrency(String(intent.currency || config.currency || "gbp").toUpperCase());
        setStatus("ready");
      } catch (error) {
        setStatus("error");
        setSetupError(error.message || "Unable to start Stripe checkout.");
      }
    }

    prepareStripeCheckout();
  }, [isAuthenticated, items, promoCode]);

  const elementsOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#ff3030",
                colorBackground: "#111111",
                colorText: "#f5f5f5",
                colorDanger: "#ff8b8b",
                borderRadius: "16px",
                fontFamily: "Space Grotesk, Segoe UI, sans-serif",
              },
            },
          }
        : null,
    [clientSecret],
  );

  const totals = serverTotals ?? {
    subtotal: summary.subtotal,
    shipping: summary.shipping,
    tax: summary.tax,
    discount: 0,
    total: summary.total,
  };

  const walletMessage = isLocalHost
    ? "Apple Pay needs your live HTTPS domain, so it will not fully appear on localhost."
    : "Apple Pay will appear automatically on supported Apple devices and Safari.";

  const walletHint = isLocalHost
    ? "Use your Railway live domain on Safari after registering that domain in Stripe payment method domains."
    : "";

  function applyPromoCode() {
    if (promoCode.trim().toUpperCase() === "HAPPY") {
      setPromoFeedback("Promo code HAPPY applied. Total due today is now 150.");
      return;
    }

    setPromoFeedback("That promo code is not valid.");
  }

  return (
    <section className="section page-top">
      <div className="container checkout-layout">
        {status === "login-required" ? (
          <div className="checkout-form">
            <p className="form-error">Log in before starting Stripe checkout.</p>
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
            <p className="summary-note">Preparing secure Stripe checkout...</p>
          </div>
        ) : null}

        {status === "error" || status === "not-configured" ? (
          <div className="checkout-form">
            <p className="form-error">{setupError}</p>
          </div>
        ) : null}

        {status === "ready" && stripePromise && elementsOptions ? (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <StripeCheckoutForm
              customerForm={customerForm}
              setCustomerForm={setCustomerForm}
              items={items}
              clearCart={clearCart}
              navigate={navigate}
              totals={totals}
              promoCode={promoCode}
              promoFeedback={promoFeedback}
              onPromoCodeChange={setPromoCode}
              onApplyPromoCode={applyPromoCode}
              walletMessage={walletMessage}
              walletHint={walletHint}
              currency={currency}
            />
          </Elements>
        ) : null}

        <aside className="summary-card">
          <h2>Checkout summary</h2>
          <p>{items.length} item(s) in order</p>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatMoney(totals.subtotal, currency)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{formatMoney(totals.shipping, currency)}</strong>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <strong>{formatMoney(totals.tax, currency)}</strong>
          </div>
          {totals.discount > 0 ? (
            <div className="summary-row">
              <span>Promo discount</span>
              <strong>-{formatMoney(totals.discount, currency)}</strong>
            </div>
          ) : null}
          <div className="summary-row summary-row--total">
            <span>Total due today</span>
            <strong>{formatMoney(totals.total, currency)}</strong>
          </div>
          <p className="summary-note">
            Apple Pay availability depends on device, browser, and Stripe domain registration.
          </p>
        </aside>
      </div>
    </section>
  );
}
