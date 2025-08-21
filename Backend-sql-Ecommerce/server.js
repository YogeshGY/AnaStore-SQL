import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

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

app.listen(3000, () => console.log("Server running on port 3000"));

// ✅ Add product
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
    const [result] = await db.query(sql, [
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
      productId: _id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add many products
app.post("/addmanyproduct", async (req, res) => {
  const products = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    const values = products.map((p) => [
      p.title,
      p.price,
      p.description,
      p.category,
      p.image,
      p.inStock,
      p.inCart || false,
      p.rating,
      p.quantity || 0,
    ]);

    await db.query(
      `INSERT INTO product (title, price, description, category, image, inStock, inCart, rating, quantity)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ message: "Products added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Update product
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
      .map((key) => `${key}=?`)
      .join(", ");
    const values = Object.values(updates);

    const [result] = await db.query(
      `UPDATE product SET ${fields} WHERE _id=?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Delete single product
app.delete("/deleteproduct/:id", async (req, res) => {
  try {
    const [result] = await db.query(`DELETE FROM product WHERE _id=?`, [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Delete all products
app.delete("/deleteManyProducts", async (req, res) => {
  try {
    const [result] = await db.query(`DELETE FROM product`);
    res.status(200).json({ message: "Products deleted successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Get all products
app.get("/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM product");
    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Products not found no products in the DB" });
    }
    res.status(200).json({ product: rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});

//  Get product by ID
app.get("/products/:_id", async (req, res) => {
  try {
    const [product] = await db.query(`SELECT * FROM product WHERE _id=?`, [
      req.params._id,
    ]);
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product: product[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
