import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const data = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setNotice(data.confirmation ?? "");
      navigate("/account");
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
          <p className="eyebrow">Sign Up</p>
          <h1>Create your VoltRush account.</h1>
          <p className="summary-note">
            Save orders, track deliveries, and contact support from one dashboard.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          {notice ? <p className="form-success">{notice}</p> : null}
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
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
          <input
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
          />
          <button className="button button--primary button--block" type="submit">
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
          <div className="auth-links">
            <Link to="/login">Already have an account?</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
