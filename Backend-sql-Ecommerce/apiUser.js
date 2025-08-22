import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "defaultsecret";

const router = Router();

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Yogesh_24@",
  database: "ecommerce",
  port: 3306,
});

router.post("/register", async (req, res) => {
  const _id = uuidv4();
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "name, Email, and Password are all required",
      });
    }

    const [row] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
    if (row.length > 0) {
      return res.status(401).json({ message: "Email already exists" });
    }

    await db.query(
      "INSERT INTO user (_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [_id, name, email, password, "user"]
    );

    return res.json({
      message: "User created successfully",
      user: {
        _id,
        name,
        email,
        role: "user",
        password,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
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

router.get("/user/:_id", async (req, res) => {
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

export default router;
