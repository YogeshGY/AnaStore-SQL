import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import mysql from "mysql2/promise";

const router = Router();

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Yogesh_24@",
  database: "ecommerce",
  port: 3306,
});

router.post("/orders/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const orderItems = req.body;

  if (!orderItems || typeof orderItems !== "object") {
    return res.status(400).json({ message: "Provide valid order data" });
  }

  const items = Array.isArray(orderItems) ? orderItems : [orderItems];

  try {
    const values = items.map((item) => [
      user_id,
      item._id,
      item.title,
      item.price,
      item.quantity,
      item.image,
      item.status || "pending",
      new Date(),
    ]);

    await db.query(
      `INSERT INTO orders 
      (user_id, _id, title, price, quantity, image, status, created_at) 
      VALUES ?`,
      [values]
    );

    res.status(201).json({ message: "Order(s) added successfully" });
  } catch (error) {
    console.error("Error adding orders:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/orders/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC",
      [user_id]
    );

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/orders/:order_id", async (req, res) => {
  const { order_id } = req.params;

  try {
    const [order] = await db.query("SELECT * FROM orders WHERE order_id=?", [
      order_id,
    ]);

    if (order.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order: order[0] });
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/orders/:order_id/status", async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE orders SET status=? WHERE order_id=?",
      [status, order_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
