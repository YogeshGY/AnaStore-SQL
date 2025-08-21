import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Yogesh_24@",
  database: "ecommerce",
  port: 3306,
});

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "defaultsecret";

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      {
        email: user.email,
        _id: user._id,
      },
      process.env.JWT_SECRET_KEY || "default_secret",
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

app.get("/user/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const [rows] = await db.query("SELECT * FROM user WHERE _id = ?", [_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.get("/user/:_id", async (req, res) => {
  try {
    const { _id } = req.params;

    const [userRows] = await db.query("SELECT * FROM user WHERE _id = ?", [
      _id,
    ]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [cartRows] = await db.query("SELECT * FROM cart WHERE user_id = ?", [
      _id,
    ]);

    res.status(200).json({
      user: {
        ...userRows[0],
        userDatas: {
          cartList: cartRows,
        },
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.get("/getCartitems/:_id", async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const [result] = await db.query("SELECT * FROM cart WHERE user_id=?", [
      _id,
    ]);

    res.status(200).json({
      message: "Cart fetched successfully",
      user: {
        _id,
        userDatas: { cartList: result },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/addCartItemInUserDetails/:_id", async (req, res) => {
  const { _id } = req.params;
  const cartItem = req.body;

  if (!cartItem || typeof cartItem !== "object" || Array.isArray(cartItem)) {
    return res
      .status(400)
      .json({ message: "Provide a valid cart item object" });
  }

  try {
    await db.query(
      `INSERT INTO cart (user_id, _id, title, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        _id,
        cartItem._id,
        cartItem.title,
        cartItem.price,
        cartItem.quantity,
        cartItem.image,
      ]
    );

    const [cartRows] = await db.query("SELECT * FROM cart WHERE user_id=?", [
      _id,
    ]);

    res.status(200).json({
      message: "Cart item added successfully",
      user: {
        _id,
        userDatas: { cartList: cartRows },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/updateQuantityInCart/:userId/:_id/:quantity", async (req, res) => {
  const { userId, _id, quantity } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE cart SET quantity=? WHERE user_id=? AND _id=?",
      [quantity, userId, _id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User or cart item not found" });
    }

    const [cartRows] = await db.query("SELECT * FROM cart WHERE user_id=?", [
      userId,
    ]);

    res.status(200).json({
      message: "Cart item quantity updated successfully",
      user: {
        _id: userId,
        userDatas: { cartList: cartRows },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/removeCartItem/:userId/cart/:_id", async (req, res) => {
  const { userId, _id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM cart WHERE user_id=? AND _id=?",
      [userId, _id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User or cart item not found" });
    }

    const [cartRows] = await db.query("SELECT * FROM cart WHERE user_id=?", [
      userId,
    ]);

    res.status(200).json({
      message: "Cart item removed successfully",
      user: {
        _id: userId,
        userDatas: { cartList: cartRows },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/EmptyUserCart/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM cart WHERE user_id=?", [id]);

    res.status(200).json({
      message: "All cart items removed successfully",
      user: {
        _id: id,
        userDatas: { cartList: [] },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

-app.post("/orders/:user_id", async (req, res) => {
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

app.get("/orders/user/:user_id", async (req, res) => {
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

app.get("/orders/:order_id", async (req, res) => {
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

app.put("/orders/:order_id/status", async (req, res) => {
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

app.post("/addProduct", async (req, res) => {
  const {
    title,
    price,
    description,
    category,
    image,
    inStock,
    inCart,
    quantity,
    rating,
  } = req.body;
  const _id = uuidv4();

  const sql = `
    INSERT INTO product
    (_id, title, price, description, category, image, inStock, inCart, quantity, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(sql, [
      _id,
      title,
      price,
      description,
      category,
      image,
      inStock,
      inCart,
      quantity,
      rating,
    ]);

    res.status(201).json({
      message: "Product added successfully",
      product: {
        _id,
        title,
        price,
        description,
        category,
        image,
        inStock,
        inCart,
        quantity,
        rating,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/addmanyproduct", async (req, res) => {
  const products = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    const values = products.map((p) => [
      uuidv4(),
      p.title,
      p.price,
      p.description,
      p.category,
      p.image,
      p.inStock,
      p.inCart || false,
      p.quantity || 0,
      p.rating,
    ]);

    await db.query(
      `INSERT INTO product (_id, title, price, description, category, image, inStock, inCart, quantity, rating)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ message: "Products added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/updateproduct/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ message: "Provide at least one field to update" });
  }

  try {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const [result] = await db.query(
      `UPDATE product SET ${fields} WHERE _id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [updatedProduct] = await db.query(
      "SELECT * FROM product WHERE _id = ?",
      [id]
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/deleteproduct/:id", async (req, res) => {
  try {
    const [result] = await db.query(`DELETE FROM product WHERE _id=?`, [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product deleted successfully", _id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/deleteManyProducts", async (req, res) => {
  try {
    await db.query(`DELETE FROM product`);
    res.status(200).json({ message: "All products deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM product");
    res.status(200).json({ product: rows });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

app.get("/products/:_id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM product WHERE _id=?", [
      req.params._id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
