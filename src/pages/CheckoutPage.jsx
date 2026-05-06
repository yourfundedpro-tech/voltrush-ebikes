import { useEffect, useMemo, useRef, useState } from "react";
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

const PAYPAL_STORAGE_KEY = "voltrush-paypal-checkout";

function buildShippingAddress(customerForm) {
  return `${customerForm.address}, ${customerForm.city}, ${customerForm.postcode}`;
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

async function finalizePaidOrder({
  paymentIntentId,
  customerForm,
  items,
}) {
  return apiRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      items,
      paymentIntentId,
      shippingAddress: buildShippingAddress(customerForm),
      customer: {
        fullName: customerForm.fullName,
        email: customerForm.email,
      },
    }),
  });
}

function StripeCheckoutForm({
  customerForm,
  setCustomerForm,
  items,
  clearCart,
  navigate,
  totals,
  walletMessage,
  walletHint,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletsReady, setWalletsReady] = useState([]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFeedback("");

    if (!stripe || !elements) {
      return;
    }

    if (
      !customerForm.fullName.trim() ||
      !customerForm.email.trim() ||
      !customerForm.address.trim() ||
      !customerForm.city.trim() ||
      !customerForm.postcode.trim()
    ) {
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
      await finalizePaidOrder({
        paymentIntentId: paymentIntent.id,
        customerForm,
        items,
      });
 
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

    if (
      !customerForm.fullName.trim() ||
      !customerForm.email.trim() ||
      !customerForm.address.trim() ||
      !customerForm.city.trim() ||
      !customerForm.postcode.trim()
    ) {
      const message = "Complete your shipping details before using Apple Pay or another wallet.";
      setError(message);
      event.paymentFailed({ reason: "invalid_shipping_address", message });
      return;
    }

    setIsSubmitting(true);

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
            country: "US",
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
              country: "US",
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
      await finalizePaidOrder({
        paymentIntentId: paymentIntent.id,
        customerForm,
        items,
      });

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
        </div>
      </div>

      <div className="checkout-block">
        <div className="checkout-block__header">
          <h2>Payment</h2>
          <span>Cards, wallets, and Apple Pay when supported</span>
        </div>

        <div className="stripe-note">
          <strong>Stripe checkout is active.</strong>
          <p>
            Apple Pay appears automatically on supported Apple devices and Safari
            once your domain is registered with Stripe.
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
        {isSubmitting ? "Processing..." : `Pay ${formatMoney(totals.total)}`}
      </button>
    </form>
  );
}

function PayPalButtonsPanel({
  customerForm,
  items,
  isAuthenticated,
  paypalConfigured,
  setPayPalError,
  clearCart,
  navigate,
  setPayPalBusy,
}) {
  const containerRef = useRef(null);
  const [paypalClientId, setPayPalClientId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      if (!paypalConfigured) {
        return;
      }

      try {
        const config = await apiRequest("/api/paypal/config", { method: "GET" });
        if (isMounted) {
          setPayPalClientId(config.clientId ?? "");
        }
      } catch (error) {
        if (isMounted) {
          setPayPalError(error.message || "Unable to load PayPal.");
        }
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [paypalConfigured, setPayPalError]);

  useEffect(() => {
    if (!paypalConfigured || !paypalClientId || !containerRef.current) {
      return;
    }

    let cancelled = false;

    async function mountButtons() {
      const existingScript = document.querySelector('script[data-paypal-sdk="true"]');

      if (!existingScript) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
            paypalClientId,
          )}&currency=GBP&intent=capture`;
          script.async = true;
          script.dataset.paypalSdk = "true";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Unable to load the PayPal SDK."));
          document.body.appendChild(script);
        });
      }

      if (cancelled || !window.paypal || !containerRef.current) {
        return;
      }

      containerRef.current.innerHTML = "";

      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          },
          onClick() {
            setPayPalError("");

            if (!isAuthenticated) {
              setPayPalError("Log in before starting PayPal checkout.");
              return false;
            }

            if (
              !customerForm.fullName.trim() ||
              !customerForm.email.trim() ||
              !customerForm.address.trim() ||
              !customerForm.city.trim() ||
              !customerForm.postcode.trim()
            ) {
              setPayPalError("Complete your customer and shipping details before using PayPal.");
              return false;
            }

            return true;
          },
          async createOrder() {
            setPayPalBusy(true);
            window.localStorage.setItem(
              PAYPAL_STORAGE_KEY,
              JSON.stringify({
                items,
                customerForm,
                savedAt: Date.now(),
              }),
            );

            const response = await apiRequest("/api/paypal/create-order", {
              method: "POST",
              body: JSON.stringify({ items }),
            });

            if (!response.orderId) {
              throw new Error("PayPal order ID was not returned.");
            }

            return response.orderId;
          },
          async onApprove(data) {
            await apiRequest("/api/paypal/capture-order", {
              method: "POST",
              body: JSON.stringify({
                orderId: data.orderID,
                items,
                shippingAddress: buildShippingAddress(customerForm),
                customer: {
                  fullName: customerForm.fullName,
                  email: customerForm.email,
                },
              }),
            });

            window.localStorage.removeItem(PAYPAL_STORAGE_KEY);
            clearCart();
            navigate("/account");
          },
          onCancel() {
            setPayPalBusy(false);
          },
          onError(error) {
            setPayPalBusy(false);
            setPayPalError(error?.message || "PayPal checkout failed. Please try again.");
          },
        })
        .render(containerRef.current);
    }

    mountButtons().catch((error) => {
      setPayPalBusy(false);
      setPayPalError(error.message || "Unable to start PayPal.");
    });

    return () => {
      cancelled = true;
    };
  }, [
    clearCart,
    customerForm,
    isAuthenticated,
    items,
    navigate,
    paypalClientId,
    paypalConfigured,
    setPayPalBusy,
    setPayPalError,
  ]);

  return <div className="paypal-button-container" ref={containerRef} />;
}

export default function CheckoutPage() {
  const { summary, items, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState("loading");
  const [setupError, setSetupError] = useState("");
  const [paypalConfigured, setPayPalConfigured] = useState(false);
  const [paypalBusy, setPayPalBusy] = useState(false);
  const [paypalError, setPayPalError] = useState("");
  const [serverTotals, setServerTotals] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    address: "",
    city: "",
    postcode: "",
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
        const paypalConfig = await apiRequest("/api/paypal/config", { method: "GET" });
        setPayPalConfigured(Boolean(paypalConfig.configured));

        const config = await apiRequest("/api/payments/config", { method: "GET" });

        if (!config.configured || !config.publishableKey) {
          setStatus("not-configured");
          setSetupError(
            "Stripe is not configured yet. Add your Stripe keys before taking live payments.",
          );
          return;
        }

        setStripePromise(loadStripe(config.publishableKey));

        const intent = await apiRequest("/api/payments/create-intent", {
          method: "POST",
          body: JSON.stringify({ items }),
        });

        setClientSecret(intent.clientSecret);
        setServerTotals(intent.totals);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
        setSetupError(error.message || "Unable to start Stripe checkout.");
      }
    }

    prepareStripeCheckout();
  }, [isAuthenticated, items]);

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
    total: summary.total,
  };

  const walletMessage = isLocalHost
    ? "Apple Pay needs your live HTTPS domain, so it will not fully appear on localhost."
    : "Apple Pay will appear automatically on supported Apple devices and Safari.";

  const walletHint = isLocalHost
    ? "Use your Railway live domain on Safari after registering that domain in Stripe payment method domains."
    : "";

  function startFallbackPayPal(event) {
    setPayPalError("");

    if (!isAuthenticated) {
      event.preventDefault();
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (
      !customerForm.fullName.trim() ||
      !customerForm.email.trim() ||
      !customerForm.address.trim() ||
      !customerForm.city.trim() ||
      !customerForm.postcode.trim()
    ) {
      event.preventDefault();
      setPayPalError("Complete your customer and shipping details before using PayPal.");
      return;
    }

    setPayPalBusy(true);
    window.localStorage.setItem(
      PAYPAL_STORAGE_KEY,
      JSON.stringify({
        items,
        customerForm,
        savedAt: Date.now(),
      }),
    );
  }

  const paypalCheckoutPayload = useMemo(
    () =>
      JSON.stringify({
        items,
        customerForm,
      }),
    [customerForm, items],
  );

  const showPayPalOnly = paypalConfigured;

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
            {paypalConfigured ? (
              <p className="form-success">
                PayPal checkout is active. Stripe is optional and is not configured on
                this machine right now.
              </p>
            ) : (
              <p className="form-error">{setupError}</p>
            )}
            {paypalConfigured ? (
              <>
                <div className="checkout-block">
                  <div className="checkout-block__header">
                    <h2>PayPal checkout</h2>
                    <span>Use your PayPal account or guest checkout</span>
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
                <div className="paypal-note">
                  <strong>PayPal is configured.</strong>
                  <p>
                    We will send you straight to PayPal and bring you back after payment.
                  </p>
                </div>
                {paypalError ? <p className="form-error">{paypalError}</p> : null}
                {paypalBusy ? <p className="summary-note">Opening PayPal...</p> : null}
                <PayPalButtonsPanel
                  customerForm={customerForm}
                  items={items}
                  isAuthenticated={isAuthenticated}
                  paypalConfigured={paypalConfigured}
                  setPayPalError={setPayPalError}
                  clearCart={clearCart}
                  navigate={navigate}
                  setPayPalBusy={setPayPalBusy}
                />
                <form
                  className="paypal-fallback-form"
                  method="post"
                  action="/api/paypal/start"
                  onSubmit={startFallbackPayPal}
                >
                  <input type="hidden" name="checkoutPayload" value={paypalCheckoutPayload} />
                  <button className="button button--primary button--block" type="submit" disabled={paypalBusy}>
                    {paypalBusy ? "Opening PayPal..." : `Pay ${formatMoney(totals.total)} with PayPal`}
                  </button>
                </form>
              </>
            ) : null}
          </div>
        ) : null}

        {status === "ready" && showPayPalOnly ? (
          <div className="checkout-payment-stack">
            <div className="checkout-form checkout-paypal-form">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">PayPal</p>
                  <h1>Pay quickly with PayPal.</h1>
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
                </div>
              </div>

              <div className="paypal-note">
                <strong>PayPal checkout is active.</strong>
                <p>
                  You will be redirected to PayPal, then brought back here after payment.
                </p>
              </div>
              {paypalError ? <p className="form-error">{paypalError}</p> : null}
              {paypalBusy ? <p className="summary-note">Opening PayPal...</p> : null}
              <PayPalButtonsPanel
                customerForm={customerForm}
                items={items}
                isAuthenticated={isAuthenticated}
                paypalConfigured={paypalConfigured}
                setPayPalError={setPayPalError}
                clearCart={clearCart}
                navigate={navigate}
                setPayPalBusy={setPayPalBusy}
              />
              <form
                className="paypal-fallback-form"
                method="post"
                action="/api/paypal/start"
                onSubmit={startFallbackPayPal}
              >
                <input type="hidden" name="checkoutPayload" value={paypalCheckoutPayload} />
                <button className="button button--primary button--block" type="submit" disabled={paypalBusy}>
                  {paypalBusy ? "Opening PayPal..." : `Pay ${formatMoney(totals.total)} with PayPal`}
                </button>
              </form>
            </div>
          </div>
        ) : null}

        {status === "ready" && !showPayPalOnly && stripePromise && elementsOptions ? (
          <div className="checkout-payment-stack">
            <div className="checkout-form checkout-paypal-form">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">PayPal</p>
                  <h1>Pay quickly with PayPal.</h1>
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
                </div>
              </div>

              <div className="paypal-note">
                <strong>PayPal checkout is active.</strong>
                <p>
                  You will be redirected to PayPal, then brought back here after payment.
                </p>
              </div>
              {paypalError ? <p className="form-error">{paypalError}</p> : null}
              {paypalBusy ? <p className="summary-note">Opening PayPal...</p> : null}
              <PayPalButtonsPanel
                customerForm={customerForm}
                items={items}
                isAuthenticated={isAuthenticated}
                paypalConfigured={paypalConfigured}
                setPayPalError={setPayPalError}
                clearCart={clearCart}
                navigate={navigate}
                setPayPalBusy={setPayPalBusy}
              />
              <form
                className="paypal-fallback-form"
                method="post"
                action="/api/paypal/start"
                onSubmit={startFallbackPayPal}
              >
                <input type="hidden" name="checkoutPayload" value={paypalCheckoutPayload} />
                <button className="button button--primary button--block" type="submit" disabled={paypalBusy}>
                  {paypalBusy ? "Opening PayPal..." : `Pay ${formatMoney(totals.total)} with PayPal`}
                </button>
              </form>
            </div>

            <Elements stripe={stripePromise} options={elementsOptions}>
              <StripeCheckoutForm
                customerForm={customerForm}
                setCustomerForm={setCustomerForm}
                items={items}
                clearCart={clearCart}
                navigate={navigate}
                totals={totals}
                walletMessage={walletMessage}
                walletHint={walletHint}
              />
            </Elements>
          </div>
        ) : null}

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
            {showPayPalOnly
              ? "PayPal will open in a secure redirect and bring you back after approval."
              : walletMessage}
          </p>
        </aside>
      </div>
    </section>
  );
}
