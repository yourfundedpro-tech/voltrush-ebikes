import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      await resetPassword({
        token: form.token,
        password: form.password,
      });
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
          <p className="eyebrow">New Password</p>
          <h1>Set a new password.</h1>
          {error ? <p className="form-error">{error}</p> : null}
          <input
            type="text"
            placeholder="Reset token"
            value={form.token}
            onChange={(event) =>
              setForm((current) => ({ ...current, token: event.target.value }))
            }
          />
          <input
            type="password"
            placeholder="New password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
          />
          <button className="button button--primary button--block" type="submit">
            {submitting ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </section>
  );
}
