import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoaderComponent from "../Components/Loader";
import styles from "./productdetail.module.css";
import Header from "../Components/Header";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

import {
  addItemCart,
  quantityUpdation,
  removeItemCart,
} from "../redux/cartSlice";
import { deleteProduct, updateProduct } from "../redux/productSlice";

const ProductDetails = () => {
  const { _id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateId, setUpdateId] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);
  const isAdmin = Cookies.get("userRole") === "admin";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3000/products/${_id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [_id]);

  useEffect(() => {
    if (!product) return;
    const found = items.find((item) => item._id === product._id);
    setCurrentQuantity(found ? found.quantity : 0);
  }, [product, items]);

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setPrice(product.price);
      setImage(product.image);
      setCategory(product.category);
      setInStock(product.inStock);
      setDescription(product.description);
      setRating(product.rating);
    }
  }, [product]);

  const addToCartItems = (item) => {
    setCurrentQuantity(1);
    dispatch(addItemCart({ ...item, quantity: 1 }));
  };

  const removeProduct = (_id) => {
    dispatch(deleteProduct(_id));
    alert("Product removed successfully. Go to home page");
    navigate("/admin");
  };

  const updateProductAdmin = (_id) => {
    setUpdateId(_id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
          alert("Product updated successfully");
        });
    }
  };

  const handleIncrementQuantity = (productId, quantity) => {
    setCurrentQuantity(quantity + 1);
    dispatch(
      quantityUpdation({
        _id: productId,
        quantity: quantity + 1,
      })
    );
  };

  const handleDecrementQuantity = (productId, quantity) => {
    if (quantity > 1) {
      setCurrentQuantity(quantity - 1);
      dispatch(
        quantityUpdation({
          _id: productId,
          quantity: quantity - 1,
        })
      );
    } else {
      setCurrentQuantity(0);
      dispatch(removeItemCart(productId));
    }
  };

  if (loading) return <LoaderComponent />;
  if (error) return <p className={styles.detailsContainer}>Error: {error}</p>;
  if (!product) return <p>Product not found</p>;

  const inCart = items.find((item) => item._id === product._id);

  return (
    <div className={styles.detailsContainer}>
      <Header />
      <div className={styles.details}>
        <img
          src={product.image}
          alt={product.title}
          className={styles.detailsImage}
        />
        <div className={styles.detailsContent}>
          {!isAdmin && (
            <>
              <h1>{product.title}</h1>
              <p className={styles.description}>{product.description}</p>
              <p className={styles.price}>Price: {product.price}$</p>
              <p className={styles.rating}>Rating: {product.rating}</p>
              <p className={product.inStock ? styles.stockin : styles.stockout}>
                {product.inStock
                  ? `Items Left: ${product.inStock}`
                  : "Out of Stock"}
              </p>
            </>
          )}

          {isAdmin && (
            <form onSubmit={handleSubmit} className={styles.updateForm}>
              <input
                type="text"
                placeholder="Product Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.updateTitle}
              />
              <input
                type="number"
                placeholder="Product Price in $"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={styles.updatedescription}
              />
              <input
                type="text"
                placeholder="Product Image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className={styles.updateprice}
              />
              <input
                type="text"
                placeholder="Product Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.updaterating}
              />
              <input
                type="number"
                placeholder="In stock Count"
                value={inStock}
                onChange={(e) => setInStock(e.target.value)}
                className={styles.updatestockin}
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.updatestockout}
              />
              <input
                type="number"
                placeholder="Rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className={styles.Updaterating}
              />
              <div className={styles.admin_button_functions}>
                <button
                  type="button"
                  className={styles.addtocart_button}
                  onClick={() => removeProduct(product._id)}
                >
                  Remove Product
                </button>
                <button
                  type="submit"
                  className={styles.addtocart_button}
                  onClick={() => updateProductAdmin(product._id)}
                >
                  Update Product
                </button>
              </div>
            </form>
          )}

          {!isAdmin && (
            <>
              {inCart ? (
                <div className={styles.ProductCartActions}>
                  <button
                    type="button"
                    onClick={() =>
                      handleDecrementQuantity(
                        product._id,
                        Number(currentQuantity)
                      )
                    }
                    className={styles.ProductCartaction_buttons}
                  >
                    -
                  </button>

                  <p className={styles.cartQuantity}>
                    In Cart: {currentQuantity}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleIncrementQuantity(
                        product._id,
                        Number(currentQuantity)
                      )
                    }
                    className={styles.ProductCartaction_buttons}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  className={styles.addtocart_button}
                  onClick={() => addToCartItems(product)}
                >
                  Add to Cart
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
