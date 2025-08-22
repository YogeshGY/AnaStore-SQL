import { Router } from "express";
import { createPool } from "mysql2";
import mysql from "mysql2/promise";

const router = Router();

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Yogesh_24@",
  database: "ecommerce",
  port: 3306,
});

router.get("/getCartitems/:_id", async (req, res) => {
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

router.put("/addCartItemInUserDetails/:_id", async (req, res) => {
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

router.put("/updateQuantityInCart/:userId/:_id/:quantity", async (req, res) => {
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

router.delete("/removeCartItem/:userId/cart/:_id", async (req, res) => {
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

router.delete("/EmptyUserCart/:id", async (req, res) => {
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

export default router;
