import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setToken("");

    try {
      const data = await forgotPassword({ email });
      setMessage(data.message);
      setToken(data.resetToken ?? "");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="section page-top">
      <div className="container auth-shell">
        <form className="auth-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Reset Password</p>
          <h1>Forgot your password?</h1>
          <p className="summary-note">
            Enter your email and we&apos;ll help you reset your password.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className="form-success">{message}</p> : null}
          {token ? (
            <p className="form-token">
              Reset token: <code>{token}</code>
            </p>
          ) : null}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="button button--primary button--block" type="submit">
            Send Reset Instructions
          </button>
          <div className="auth-links">
            <Link to="/reset-password">Already have a token?</Link>
            <Link to="/login">Back to login</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
