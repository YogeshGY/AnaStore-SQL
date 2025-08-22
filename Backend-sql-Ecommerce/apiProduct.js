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

router.post("/addProduct", async (req, res) => {
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

router.post("/addManyProduct", async (req, res) => {
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

router.put("/updateProduct/:id", async (req, res) => {
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

router.delete("/deleteProduct/:id", async (req, res) => {
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

router.delete("/deleteManyProducts", async (req, res) => {
  try {
    await db.query(`DELETE FROM product`);
    res.status(200).json({ message: "All products deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM product");
    res.status(200).json({ product: rows });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

router.get("/products/:_id", async (req, res) => {
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

export default router;
