import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "voltrush.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");

fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);

seedDatabase();
ensurePaymentRecords();

function seedDatabase() {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;

  if (userCount > 0) {
    return;
  }

  const passwordHash = bcrypt.hashSync("DemoPass123!", 10);
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, email_confirmed)
    VALUES (@name, @email, @password_hash, @email_confirmed)
  `);

  const demoUser = insertUser.run({
    name: "Avery Rider",
    email: "demo@voltrush.com",
    password_hash: passwordHash,
    email_confirmed: 1,
  });

  const secondUser = insertUser.run({
    name: "Jordan Watts",
    email: "jordan@voltrush.com",
    password_hash: passwordHash,
    email_confirmed: 1,
  });

  const insertOrder = db.prepare(`
    INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address, created_at)
    VALUES (@user_id, @order_number, @total_amount, @status, @shipping_address, @created_at)
  `);

  const orderOne = insertOrder.run({
    user_id: demoUser.lastInsertRowid,
    order_number: "VR-10428",
    total_amount: 4478.88,
    status: "shipped",
    shipping_address: "14 Redline Street, Bristol, BS1 4XE",
    created_at: "2026-04-14 10:22:00",
  });

  const orderTwo = insertOrder.run({
    user_id: demoUser.lastInsertRowid,
    order_number: "VR-10491",
    total_amount: 1127.52,
    status: "processing",
    shipping_address: "14 Redline Street, Bristol, BS1 4XE",
    created_at: "2026-04-22 16:48:00",
  });

  const orderThree = insertOrder.run({
    user_id: secondUser.lastInsertRowid,
    order_number: "VR-10502",
    total_amount: 5200,
    status: "delivered",
    shipping_address: "99 Torque Avenue, Leeds, LS1 7AA",
    created_at: "2026-04-18 09:15:00",
  });

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_name, product_color, quantity, unit_price)
    VALUES (@order_id, @product_name, @product_color, @quantity, @unit_price)
  `);

  [
    {
      order_id: orderOne.lastInsertRowid,
      product_name: "Sur-Ron Light Bee",
      product_color: "Black / Yellow",
      quantity: 1,
      unit_price: 3999,
    },
    {
      order_id: orderTwo.lastInsertRowid,
      product_name: "Swytch GO Conversion Kit",
      product_color: "Black Power Pack",
      quantity: 1,
      unit_price: 349,
    },
    {
      order_id: orderTwo.lastInsertRowid,
      product_name: "NIU KQi3 Max",
      product_color: "Space Grey",
      quantity: 1,
      unit_price: 999,
    },
    {
      order_id: orderThree.lastInsertRowid,
      product_name: "Sur-Ron Ultra Bee",
      product_color: "Pure Black",
      quantity: 1,
      unit_price: 5000,
    },
  ].forEach((item) => insertOrderItem.run(item));

  const insertTicket = db.prepare(`
    INSERT INTO support_tickets (user_id, subject, message, status, created_at)
    VALUES (@user_id, @subject, @message, @status, @created_at)
  `);

  insertTicket.run({
    user_id: demoUser.lastInsertRowid,
    subject: "Shipping update request",
    message: "Can you confirm whether my Light Bee is still on track for this week?",
    status: "open",
    created_at: "2026-04-23 12:30:00",
  });

  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, title, body, type, created_at)
    VALUES (@user_id, @title, @body, @type, @created_at)
  `);

  [
    {
      user_id: demoUser.lastInsertRowid,
      title: "Order VR-10428 shipped",
      body: "Your Sur-Ron Light Bee is on the way and has left the distribution center.",
      type: "order",
      created_at: "2026-04-15 08:00:00",
    },
    {
      user_id: demoUser.lastInsertRowid,
      title: "Order VR-10491 processing",
      body: "Your latest order is being packed and prepared for dispatch.",
      type: "order",
      created_at: "2026-04-22 17:15:00",
    },
    {
      user_id: secondUser.lastInsertRowid,
      title: "Order VR-10502 delivered",
      body: "Your Sur-Ron Ultra Bee was delivered successfully.",
      type: "order",
      created_at: "2026-04-21 14:10:00",
    },
  ].forEach((notification) => insertNotification.run(notification));
}

function ensurePaymentRecords() {
  const insertPayment = db.prepare(`
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
      transaction_reference,
      created_at
    )
    VALUES (
      @order_id,
      @provider,
      @method_type,
      @card_brand,
      @card_last4,
      @billing_name,
      @billing_email,
      @amount,
      @currency,
      @status,
      @transaction_reference,
      @created_at
    )
  `);

  const ordersWithoutPayments = db
    .prepare(
      `
        SELECT orders.id, orders.user_id, orders.total_amount, orders.created_at, users.name, users.email
        FROM orders
        JOIN users ON users.id = orders.user_id
        LEFT JOIN payments ON payments.order_id = orders.id
        WHERE payments.id IS NULL
      `,
    )
    .all();

  ordersWithoutPayments.forEach((order) => {
    insertPayment.run({
      order_id: order.id,
      provider: "VoltRush Pay",
      method_type: "card",
      card_brand: "visa",
      card_last4: "4242",
      billing_name: order.name,
      billing_email: order.email,
      amount: order.total_amount,
      currency: "USD",
      status: "paid",
      transaction_reference: `VRPAY-SEED-${order.id}`,
      created_at: order.created_at,
    });
  });
}
