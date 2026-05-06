import "dotenv/config";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import path from "node:path";
import Stripe from "stripe";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { products } from "../src/data/products.js";

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "voltrush-dev-secret";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";
const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
const STRIPE_MERCHANT_COUNTRY = (process.env.STRIPE_MERCHANT_COUNTRY || "US").toUpperCase();
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_ENV = (process.env.PAYPAL_ENV || "sandbox").toLowerCase();
const PAYPAL_CURRENCY = (process.env.PAYPAL_CURRENCY || "GBP").toUpperCase();
const APP_URL = process.env.APP_URL || CLIENT_ORIGIN;
const PAYPAL_API_BASE =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@voltrush.com";
const OWNER_EMAIL = (process.env.OWNER_EMAIL || "").toLowerCase();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY)
  : null;
const productCatalog = new Map(products.map((product) => [String(product.id), product]));

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const createSessionToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: "30d",
  });

function buildPaymentSummary(paymentRow) {
  return {
    provider: paymentRow.provider,
    methodType: paymentRow.method_type,
    cardBrand: paymentRow.card_brand,
    cardLast4: paymentRow.card_last4,
    billingName: paymentRow.billing_name,
    billingEmail: paymentRow.billing_email,
    amount: paymentRow.amount,
    currency: paymentRow.currency,
    status: paymentRow.status,
    transactionReference: paymentRow.transaction_reference,
    createdAt: paymentRow.created_at,
  };
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function formatPayPalAmount(value) {
  return roundCurrency(value).toFixed(2);
}

function calculateOrderTotals(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  let itemCount = 0;
  let subtotal = 0;

  const normalizedItems = items.map((item) => {
    const product = productCatalog.get(String(item.id));
    const quantity = Number(item.quantity ?? 1);

    if (!product || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Cart contains an invalid product or quantity.");
    }

    itemCount += quantity;
    subtotal += product.price * quantity;

    const validColor = product.colorOptions?.find(
      (option) => option.name === (item.selectedColor ?? item.color),
    );

    return {
      id: product.id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      productColor: validColor?.name ?? product.color ?? null,
    };
  });

  const shipping = itemCount > 0 ? 120 : 0;
  const tax = subtotal * 0.12;
  const total = roundCurrency(subtotal + shipping + tax);

  return {
    itemCount,
    subtotal: roundCurrency(subtotal),
    shipping: roundCurrency(shipping),
    tax: roundCurrency(tax),
    total,
    amount: Math.round(total * 100),
    normalizedItems,
  };
}

function requireStripe(res) {
  if (!stripe || !STRIPE_PUBLISHABLE_KEY) {
    res.status(503).json({
      message:
        "Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to enable live checkout.",
    });
    return false;
  }

  return true;
}

function isPayPalConfigured() {
  return Boolean(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);
}

function requirePayPal(res) {
  if (!isPayPalConfigured()) {
    res.status(503).json({
      message:
        "PayPal is not configured yet. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to enable PayPal checkout.",
    });
    return false;
  }

  return true;
}

async function getPayPalAccessToken() {
  const credentials = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Unable to authenticate with PayPal.");
  }

  return data.access_token;
}

async function createPayPalOrder({ user, totals }) {
  const accessToken = await getPayPalAccessToken();
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `user-${user.id}`,
        custom_id: `vr-user-${user.id}`,
        amount: {
          currency_code: PAYPAL_CURRENCY,
          value: formatPayPalAmount(totals.total),
          breakdown: {
            item_total: {
              currency_code: PAYPAL_CURRENCY,
              value: formatPayPalAmount(totals.subtotal),
            },
            shipping: {
              currency_code: PAYPAL_CURRENCY,
              value: formatPayPalAmount(totals.shipping),
            },
            tax_total: {
              currency_code: PAYPAL_CURRENCY,
              value: formatPayPalAmount(totals.tax),
            },
          },
        },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
          brand_name: "VoltRush",
          user_action: "PAY_NOW",
          return_url: `${APP_URL}/paypal-return`,
          cancel_url: `${APP_URL}/checkout`,
        },
      },
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.id) {
    throw new Error(data.message || "Unable to create PayPal order.");
  }

  return data;
}

async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to capture PayPal order.");
  }

  return data;
}

function getPayPalMethodDetails(order) {
  const purchaseUnit = order.purchase_units?.[0];
  const capture =
    purchaseUnit?.payments?.captures?.[0] ??
    purchaseUnit?.payments?.authorizations?.[0] ??
    null;
  const payer = order.payer ?? {};

  return {
    provider: "PayPal",
    methodType: "paypal",
    cardBrand: "paypal",
    cardLast4: "PPAL",
    transactionReference: capture?.id ?? order.id,
    status: capture?.status?.toLowerCase?.() === "completed" ? "paid" : "pending",
    amount: Number(capture?.amount?.value ?? purchaseUnit?.amount?.value ?? 0),
    currency: capture?.amount?.currency_code ?? purchaseUnit?.amount?.currency_code ?? PAYPAL_CURRENCY,
    billingName:
      [payer.name?.given_name, payer.name?.surname].filter(Boolean).join(" ") || "",
    billingEmail: payer.email_address ?? "",
  };
}

function createPaidOrderFromPayment({
  userId,
  customer,
  shippingAddress,
  totals,
  paymentDetails,
}) {
  const orderNumber = `VR-${Math.floor(10000 + Math.random() * 89999)}`;
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_name, product_color, quantity, unit_price)
    VALUES (?, ?, ?, ?, ?)
  `);

  const createOrder = db.transaction(() => {
    const orderResult = db
      .prepare(
        "INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address) VALUES (?, ?, ?, 'processing', ?)",
      )
      .run(userId, orderNumber, totals.total, shippingAddress.trim());

    totals.normalizedItems.forEach((item) => {
      insertItem.run(
        orderResult.lastInsertRowid,
        item.name,
        item.productColor,
        item.quantity,
        item.unitPrice,
      );
    });

    db.prepare(
      `
        INSERT INTO payments (
          order_id,
          provider,
          method_type,
          card_brand,
          card_last4,
          billing_name,
          billing_email,
          amount,
          currency,
          status,
          transaction_reference
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      orderResult.lastInsertRowid,
      paymentDetails.provider,
      paymentDetails.methodType,
      paymentDetails.cardBrand,
      paymentDetails.cardLast4,
      customer.fullName.trim(),
      customer.email.trim().toLowerCase(),
      paymentDetails.amount,
      paymentDetails.currency,
      paymentDetails.status,
      paymentDetails.transactionReference,
    );

    db.prepare(
      "INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)",
    ).run(
      userId,
      `Payment received for ${orderNumber}`,
      paymentDetails.provider === "PayPal"
        ? "Your PayPal payment has been approved successfully."
        : `Your ${paymentDetails.cardBrand.toUpperCase()} payment${paymentDetails.methodType === "apple_pay" ? " via Apple Pay" : ""} ending in ${paymentDetails.cardLast4} has been approved.`,
      "payment",
    );

    db.prepare(
      "INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)",
    ).run(
      userId,
      `Order ${orderNumber} created`,
      "Your order has been paid successfully and is now queued for fulfillment.",
      "order",
    );

    const createdOrder = db
      .prepare(
        "SELECT id, order_number, total_amount, status, shipping_address, created_at FROM orders WHERE id = ?",
      )
      .get(orderResult.lastInsertRowid);

    return {
      ...createdOrder,
      payment: buildPaymentSummary({
        provider: paymentDetails.provider,
        method_type: paymentDetails.methodType,
        card_brand: paymentDetails.cardBrand,
        card_last4: paymentDetails.cardLast4,
        billing_name: customer.fullName.trim(),
        billing_email: customer.email.trim().toLowerCase(),
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: paymentDetails.status,
        transaction_reference: paymentDetails.transactionReference,
        created_at: createdOrder.created_at,
      }),
    };
  });

  return createOrder();
}

function getStripeMethodDetails(paymentIntent) {
  const paymentMethod = paymentIntent.payment_method;
  const card = paymentMethod?.card;
  const walletType = card?.wallet?.type;

  return {
    provider: "Stripe",
    methodType: walletType === "apple_pay" ? "apple_pay" : paymentMethod?.type ?? "card",
    cardBrand: card?.brand ?? "card",
    cardLast4: card?.last4 ?? "----",
    transactionReference: paymentIntent.id,
    status: paymentIntent.status === "succeeded" ? "paid" : paymentIntent.status,
    amount: roundCurrency((paymentIntent.amount_received || paymentIntent.amount || 0) / 100),
    currency: (paymentIntent.currency || STRIPE_CURRENCY).toUpperCase(),
    billingName:
      paymentMethod?.billing_details?.name ??
      paymentIntent.shipping?.name ??
      paymentIntent.metadata?.customerName ??
      "",
    billingEmail:
      paymentMethod?.billing_details?.email ??
      paymentIntent.receipt_email ??
      paymentIntent.metadata?.customerEmail ??
      "",
  };
}

function setSessionCookie(res, user) {
  res.cookie("voltrush_token", createSessionToken(user), {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    maxAge: SESSION_MAX_AGE_MS,
  });
}

function clearSessionCookie(res) {
  res.clearCookie("voltrush_token");
}

function getUserByEmail(email) {
  return db
    .prepare("SELECT id, name, email, password_hash, email_confirmed, created_at FROM users WHERE email = ?")
    .get(email.toLowerCase());
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailConfirmed: Boolean(user.email_confirmed),
    createdAt: user.created_at,
    isOwner: Boolean(OWNER_EMAIL && user.email?.toLowerCase() === OWNER_EMAIL),
  };
}

function isOwnerUser(userLike) {
  return Boolean(OWNER_EMAIL && userLike?.email?.toLowerCase() === OWNER_EMAIL);
}

function ownerOnlyMiddleware(req, res, next) {
  if (!isOwnerUser(req.user)) {
    return res.status(403).json({ message: "Owner access required." });
  }

  return next();
}

function authMiddleware(req, res, next) {
  const token = req.cookies.voltrush_token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/payments/config", (_req, res) => {
  res.json({
    configured: Boolean(stripe && STRIPE_PUBLISHABLE_KEY),
    publishableKey: STRIPE_PUBLISHABLE_KEY || null,
    currency: STRIPE_CURRENCY,
    merchantCountry: STRIPE_MERCHANT_COUNTRY,
  });
});

app.get("/api/paypal/config", (_req, res) => {
  res.json({
    configured: isPayPalConfigured(),
    environment: PAYPAL_ENV,
    currency: PAYPAL_CURRENCY,
  });
});

app.get("/api/auth/session", (req, res) => {
  const token = req.cookies.voltrush_token;

  if (!token) {
    return res.json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db
      .prepare("SELECT id, name, email, email_confirmed, created_at FROM users WHERE id = ?")
      .get(decoded.id);

    return res.json({ user: user ? sanitizeUser(user) : null });
  } catch {
    clearSessionCookie(res);
    return res.json({ user: null });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long." });
  }

  if (getUserByEmail(email)) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, email_confirmed) VALUES (?, ?, ?, ?)",
    )
    .run(name.trim(), email.toLowerCase().trim(), passwordHash, 0);

  const user = db
    .prepare("SELECT id, name, email, email_confirmed, created_at FROM users WHERE id = ?")
    .get(result.lastInsertRowid);

  setSessionCookie(res, user);

  return res.status(201).json({
    user: sanitizeUser(user),
    confirmation: isProduction
      ? "Your account has been created successfully."
      : "Your account has been created successfully.",
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email ?? "");

  if (!user || !bcrypt.compareSync(password ?? "", user.password_hash)) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  setSessionCookie(res, user);
  return res.json({ user: sanitizeUser(user) });
});

app.post("/api/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = getUserByEmail(email ?? "");

  if (isProduction) {
    return res.json({
      message: `Password reset requests are handled by support right now. Please contact ${SUPPORT_EMAIL}.`,
    });
  }

  if (!user) {
    return res.json({
      message: "If that email exists, a reset token has been generated.",
    });
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);
  db.prepare(
    "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
  ).run(user.id, token, expiresAt);

  return res.json({
    message: "Password reset token created for local testing.",
    resetToken: token,
  });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { token, password } = req.body;

  if (!token?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "Token and new password are required." });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long." });
  }

  const resetRecord = db
    .prepare("SELECT id, user_id, expires_at FROM password_resets WHERE token = ?")
    .get(token.trim());

  if (!resetRecord || new Date(resetRecord.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ message: "Reset token is invalid or expired." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    resetRecord.user_id,
  );
  db.prepare("DELETE FROM password_resets WHERE id = ?").run(resetRecord.id);

  const user = db
    .prepare("SELECT id, name, email, email_confirmed, created_at FROM users WHERE id = ?")
    .get(resetRecord.user_id);

  setSessionCookie(res, user);
  return res.json({ user: sanitizeUser(user) });
});

app.post("/api/payments/create-intent", authMiddleware, async (req, res) => {
  if (!requireStripe(res)) {
    return;
  }

  try {
    const totals = calculateOrderTotals(req.body.items);

    if (!totals) {
      return res.status(400).json({ message: "Cart must contain at least one item." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totals.amount,
      currency: STRIPE_CURRENCY,
      payment_method_types: ["card"],
      receipt_email: req.user.email,
      metadata: {
        userId: String(req.user.id),
        customerName: req.user.name,
        customerEmail: req.user.email,
        itemCount: String(totals.itemCount),
      },
    });

    return res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totals: {
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to create payment." });
  }
});

app.post("/api/paypal/create-order", authMiddleware, async (req, res) => {
  if (!requirePayPal(res)) {
    return;
  }

  try {
    const totals = calculateOrderTotals(req.body.items);

    if (!totals) {
      return res.status(400).json({ message: "Cart must contain at least one item." });
    }

    const order = await createPayPalOrder({ user: req.user, totals });
    const approveLink = order.links?.find((link) => link.rel === "payer-action")?.href;

    return res.status(201).json({
      orderId: order.id,
      approveLink: approveLink ?? null,
      totals: {
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to start PayPal checkout." });
  }
});

app.post("/api/paypal/capture-order", authMiddleware, async (req, res) => {
  if (!requirePayPal(res)) {
    return;
  }

  const { orderId, items, shippingAddress, customer } = req.body;

  if (!orderId?.trim()) {
    return res.status(400).json({ message: "PayPal order ID is required." });
  }

  if (!customer?.fullName?.trim() || !customer?.email?.trim()) {
    return res.status(400).json({ message: "Customer name and email are required." });
  }

  if (!shippingAddress?.trim()) {
    return res.status(400).json({ message: "Shipping address is required." });
  }

  let totals;

  try {
    totals = calculateOrderTotals(items);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Invalid cart." });
  }

  if (!totals) {
    return res.status(400).json({ message: "Order must contain at least one item." });
  }

  try {
    const existingPayment = db
      .prepare(
        `
          SELECT orders.id, orders.order_number, orders.total_amount, orders.status, orders.shipping_address, orders.created_at
          FROM payments
          JOIN orders ON orders.id = payments.order_id
          WHERE payments.transaction_reference = ?
        `,
      )
      .get(orderId.trim());

    if (existingPayment) {
      return res.json({ order: existingPayment });
    }

    const order = await capturePayPalOrder(orderId.trim());
    const purchaseUnit = order.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0] ?? null;

    if (!capture || capture.status !== "COMPLETED") {
      return res.status(400).json({
        message: "PayPal payment has not completed yet. Please try again in a moment.",
      });
    }

    const paidAmount = Number(capture.amount?.value ?? 0);

    if (roundCurrency(paidAmount) !== roundCurrency(totals.total)) {
      return res.status(400).json({
        message: "PayPal payment amount does not match the current cart total.",
      });
    }

    const paypalPayment = getPayPalMethodDetails(order);
    const createdOrder = createPaidOrderFromPayment({
      userId: req.user.id,
      customer,
      shippingAddress,
      totals,
      paymentDetails: paypalPayment,
    });

    return res.status(201).json({ order: createdOrder });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Unable to capture PayPal payment.",
    });
  }
});

app.get("/api/account/dashboard", authMiddleware, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, email_confirmed, created_at FROM users WHERE id = ?")
    .get(req.user.id);

  const orderRows = db
    .prepare(
      "SELECT id, order_number, total_amount, status, shipping_address, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(req.user.id);

  const orders = orderRows.map((order) => ({
    ...order,
    payment: (() => {
      const payment = db
        .prepare(
          `
            SELECT provider, method_type, card_brand, card_last4, billing_name, billing_email, amount, currency, status, transaction_reference, created_at
            FROM payments
            WHERE order_id = ?
          `,
        )
        .get(order.id);

      return payment ? buildPaymentSummary(payment) : null;
    })(),
    items: db
      .prepare(
        "SELECT product_name, product_color, quantity, unit_price FROM order_items WHERE order_id = ?",
      )
      .all(order.id),
  }));

  const tickets = db
    .prepare(
      "SELECT id, subject, message, status, created_at FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(req.user.id);

  const notifications = db
    .prepare(
      "SELECT id, title, body, type, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(req.user.id);

  const managedOrders = isOwnerUser(user)
    ? db
        .prepare(
          `
            SELECT
              orders.id,
              orders.order_number,
              orders.total_amount,
              orders.status,
              orders.shipping_address,
              orders.created_at,
              users.name AS customer_name,
              users.email AS customer_email
            FROM orders
            JOIN users ON users.id = orders.user_id
            ORDER BY orders.created_at DESC
          `,
        )
        .all()
        .map((order) => ({
          ...order,
          items: db
            .prepare(
              "SELECT product_name, product_color, quantity, unit_price FROM order_items WHERE order_id = ?",
            )
            .all(order.id),
        }))
    : [];

  res.json({
    user: sanitizeUser(user),
    orders,
    supportTickets: tickets,
    notifications,
    managedOrders,
  });
});

app.post("/api/admin/orders/:orderId/update", authMiddleware, ownerOnlyMiddleware, (req, res) => {
  const { orderId } = req.params;
  const { status, message } = req.body;
  const normalizedStatus = String(status ?? "").trim().toLowerCase();
  const trimmedMessage = String(message ?? "").trim();
  const allowedStatuses = new Set(["processing", "shipped", "delivered", "open"]);

  if (!allowedStatuses.has(normalizedStatus)) {
    return res.status(400).json({ message: "Please choose a valid order status." });
  }

  if (!trimmedMessage) {
    return res.status(400).json({ message: "Please enter an update message for the customer." });
  }

  const order = db
    .prepare(
      `
        SELECT orders.id, orders.user_id, orders.order_number
        FROM orders
        WHERE orders.id = ?
      `,
    )
    .get(orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(normalizedStatus, order.id);
  db.prepare(
    "INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)",
  ).run(
    order.user_id,
    `Order ${order.order_number} update`,
    trimmedMessage,
    "order",
  );

  return res.json({ success: true });
});

app.post("/api/support", authMiddleware, (req, res) => {
  const { subject, message } = req.body;

  if (!subject?.trim() || !message?.trim()) {
    return res.status(400).json({ message: "Subject and message are required." });
  }

  const result = db
    .prepare(
      "INSERT INTO support_tickets (user_id, subject, message, status) VALUES (?, ?, ?, 'open')",
    )
    .run(req.user.id, subject.trim(), message.trim());

  const ticket = db
    .prepare(
      "SELECT id, subject, message, status, created_at FROM support_tickets WHERE id = ?",
    )
    .get(result.lastInsertRowid);

  res.status(201).json({ ticket });
});

app.post("/api/orders", authMiddleware, (req, res) => {
  if (!requireStripe(res)) {
    return;
  }

  const { items, shippingAddress, customer, paymentIntentId } = req.body;

  if (!paymentIntentId?.trim()) {
    return res.status(400).json({ message: "Payment confirmation is required." });
  }

  if (!customer?.fullName?.trim() || !customer?.email?.trim()) {
    return res.status(400).json({ message: "Customer name and email are required." });
  }

  if (!shippingAddress?.trim()) {
    return res.status(400).json({ message: "Shipping address is required." });
  }

  let totals;

  try {
    totals = calculateOrderTotals(items);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Invalid cart." });
  }

  if (!totals) {
    return res.status(400).json({ message: "Order must contain at least one item." });
  }

  stripe.paymentIntents
    .retrieve(paymentIntentId.trim(), {
      expand: ["payment_method"],
    })
    .then((paymentIntent) => {
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: "Payment has not completed yet. Please finish the Stripe checkout first.",
        });
      }

      if (Number(paymentIntent.amount_received || paymentIntent.amount) !== totals.amount) {
        return res.status(400).json({
          message: "Paid amount does not match the current cart total.",
        });
      }

      const existingPayment = db
        .prepare(
          `
            SELECT orders.id, orders.order_number, orders.total_amount, orders.status, orders.shipping_address, orders.created_at
            FROM payments
            JOIN orders ON orders.id = payments.order_id
            WHERE payments.transaction_reference = ?
          `,
        )
        .get(paymentIntent.id);

      if (existingPayment) {
        return res.json({ order: existingPayment });
      }

      const stripePayment = getStripeMethodDetails(paymentIntent);
      const createdOrder = createPaidOrderFromPayment({
        userId: req.user.id,
        customer,
        shippingAddress,
        totals,
        paymentDetails: stripePayment,
      });

      return res.status(201).json({ order: createdOrder });
    })
    .catch((error) =>
      res.status(400).json({
        message: error.message || "Unable to verify Stripe payment.",
      }),
    );
});

app.use(express.static(distPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  return res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`VoltRush API running on http://localhost:${PORT}`);
});
