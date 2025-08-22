import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import productRout from "./apiProduct.js";
import userRout from "./apiUser.js";
import cartRout from "./apiCari.js";
import orderRout from "./apiOrders.js";

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

app.use("", productRout);
app.use("", userRout);
app.use("", cartRout);
app.use("", orderRout);
