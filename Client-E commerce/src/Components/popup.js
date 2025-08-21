import React, { useState } from "react";
import styles from "./popup.module.css";
import { addProductAdmin } from "../redux/productSlice";
import { useDispatch } from "react-redux";
import { updateProduct } from "../redux/productSlice";

const Popup = ({ onClose, updateId }) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      title,
      price,
      image,
      category,
      inStock,
      description,
      rating,
    };
    const updatedData = {};
    if (title) updatedData.title = title;
    if (price) updatedData.price = price;
    if (image) updatedData.image = image;
    if (category) updatedData.category = category;
    if (inStock) updatedData.inStock = inStock;
    if (description) updatedData.description = description;
    if (rating) updatedData.rating = rating;

    if (updateId) {
      dispatch(updateProduct({ _id: updateId, updatedData }))
        .unwrap()
        .then(() => {
          onClose();
        });
    } else {
      dispatch(addProductAdmin(newProduct))
        .unwrap()
        .then(() => {
          alert("Product added successfully");
          onClose();
        });
    }

    setTitle("");
    setPrice("");
    setImage("");
    setCategory("");
    setInStock("");
    setDescription("");
    setRating("");
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2 className={styles.popupHeading}>
          {updateId ? "Update Product" : "Add New Product"}
        </h2>
        <form onSubmit={handleSubmit} className={styles.popupForm}>
          <input
            type="text"
            placeholder="Product Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.popupInput}
          />
          <input
            type="number"
            placeholder="Product Price in $"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={styles.popupInput}
          />
          <input
            type="text"
            placeholder="Product Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={styles.popupInput}
          />
          <input
            type="text"
            placeholder="Product Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.popupInput}
          />
          <input
            type="number"
            placeholder="In stock Count"
            value={inStock}
            onChange={(e) => setInStock(e.target.value)}
            className={styles.popupInput}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.popupInput}
          />
          <input
            type="number"
            placeholder="Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className={styles.popupInput}
          />

          {updateId ? (
            <button type="submit" className={styles.addProduct_button}>
              Update Product
            </button>
          ) : (
            <button type="submit" className={styles.addProduct_button}>
              Add Product
            </button>
          )}
          <button
            type="button"
            className={styles.close_popup}
            onClick={onClose}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default Popup;
