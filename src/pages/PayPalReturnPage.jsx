import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useCart } from "../state/CartContext";

const STORAGE_KEY = "voltrush-paypal-checkout";

export default function PayPalReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Confirming your PayPal payment...");

  useEffect(() => {
    async function finalizePayPalOrder() {
      const orderId = searchParams.get("token");

      if (!orderId) {
        setStatus("error");
        setMessage("PayPal did not return an order token.");
        return;
      }

      const savedCheckout = window.localStorage.getItem(STORAGE_KEY);

      if (!savedCheckout) {
        setStatus("error");
        setMessage("Your PayPal checkout details were not found. Please try again from checkout.");
        return;
      }

      try {
        const parsed = JSON.parse(savedCheckout);
        await apiRequest("/api/paypal/capture-order", {
          method: "POST",
          body: JSON.stringify({
            orderId,
            items: parsed.items,
            shippingAddress: `${parsed.customerForm.address}, ${parsed.customerForm.city}, ${parsed.customerForm.postcode}`,
            customer: {
              fullName: parsed.customerForm.fullName,
              email: parsed.customerForm.email,
            },
          }),
        });

        window.localStorage.removeItem(STORAGE_KEY);
        clearCart();
        setStatus("success");
        setMessage("PayPal approved your payment. Redirecting to your account...");
        window.setTimeout(() => navigate("/account"), 900);
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "PayPal payment could not be completed.");
      }
    }

    finalizePayPalOrder();
  }, [clearCart, navigate, searchParams]);

  return (
    <section className="section page-top">
      <div className="container auth-shell">
        <div className="auth-card">
          <p className="eyebrow">PayPal</p>
          <h1>Checkout return</h1>
          {status === "loading" ? (
            <p className="summary-note">{message}</p>
          ) : null}
          {status === "success" ? <p className="form-success">{message}</p> : null}
          {status === "error" ? <p className="form-error">{message}</p> : null}
          {status === "error" ? (
            <Link className="button button--primary" to="/checkout">
              Back to checkout
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
