import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "../state/AuthContext";

function formatMoney(value) {
  return `$${Number(value).toLocaleString()}`;
}

function formatPaymentLabel(payment) {
  if (!payment) {
    return "Pending payment";
  }

  const brand = payment.cardBrand ? payment.cardBrand.toUpperCase() : "CARD";
  return `${brand} ending ${payment.cardLast4}`;
}

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({
    orders: [],
    notifications: [],
    supportTickets: [],
  });
  const [supportForm, setSupportForm] = useState({ subject: "", message: "" });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const data = await apiRequest("/api/account/dashboard", { method: "GET" });
      setDashboard(data);
    }

    loadDashboard();
  }, []);

  async function handleSupportSubmit(event) {
    event.preventDefault();
    setFeedback("");

    const data = await apiRequest("/api/support", {
      method: "POST",
      body: JSON.stringify(supportForm),
    });

    setDashboard((current) => ({
      ...current,
      supportTickets: [data.ticket, ...current.supportTickets],
    }));
    setSupportForm({ subject: "", message: "" });
    setFeedback("Support request submitted.");
  }

  return (
    <section className="section page-top">
      <div className="container account-dashboard">
        <div className="account-dashboard__intro">
          <p className="eyebrow">My Account</p>
          <h1>Welcome back, {user?.name ?? "Rider"}.</h1>
          <p className="summary-note">
            Review orders, track progress, and contact support from one place.
          </p>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Orders</h2>
              <span>{dashboard.orders.length} total</span>
            </div>
            {dashboard.orders.map((order) => (
              <div className="dashboard-item" key={order.id}>
                <div className="dashboard-item__row">
                  <strong>{order.order_number}</strong>
                  <span className={`status-pill status-pill--${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <p>{formatMoney(order.total_amount)}</p>
                <div className="dashboard-item__row">
                  <span className="dashboard-meta">{formatPaymentLabel(order.payment)}</span>
                  {order.payment ? (
                    <span className={`status-pill status-pill--${order.payment.status}`}>
                      {order.payment.status}
                    </span>
                  ) : null}
                </div>
                <ul className="dashboard-inline-list">
                  {order.items.map((item) => (
                    <li key={`${order.id}-${item.product_name}`}>
                      {item.product_name}
                      {item.product_color ? ` (${item.product_color})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Tracking</h2>
              <span>Order updates</span>
            </div>
            {dashboard.notifications.map((notification) => (
              <div className="dashboard-item" key={notification.id}>
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
                <span className="dashboard-meta">{notification.created_at}</span>
              </div>
            ))}
          </article>

          <article className="dashboard-card dashboard-card--wide">
            <div className="dashboard-card__header">
              <h2>Support</h2>
              <span>Submit a ticket</span>
            </div>
            {feedback ? <p className="form-success">{feedback}</p> : null}
            <form className="support-form" onSubmit={handleSupportSubmit}>
              <input
                type="text"
                placeholder="Subject"
                value={supportForm.subject}
                onChange={(event) =>
                  setSupportForm((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
              />
              <textarea
                rows="5"
                placeholder="How can we help?"
                value={supportForm.message}
                onChange={(event) =>
                  setSupportForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
              />
              <button className="button button--primary" type="submit">
                Send Support Request
              </button>
            </form>

            <div className="ticket-list">
              {dashboard.supportTickets.map((ticket) => (
                <div className="dashboard-item" key={ticket.id}>
                  <div className="dashboard-item__row">
                    <strong>{ticket.subject}</strong>
                    <span className={`status-pill status-pill--${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p>{ticket.message}</p>
                  <span className="dashboard-meta">{ticket.created_at}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
