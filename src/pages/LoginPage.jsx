import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from ?? "/account");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section page-top">
      <div className="container auth-shell">
        <form className="auth-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Login</p>
          <h1>Welcome back.</h1>
          <p className="summary-note">
            Sign in to review orders, track deliveries, and manage your VoltRush account.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
          <button className="button button--primary button--block" type="submit">
            {submitting ? "Signing in..." : "Login"}
          </button>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/signup">Create account</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
