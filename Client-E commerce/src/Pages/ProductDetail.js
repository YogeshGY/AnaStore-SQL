import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoaderComponent from "../Components/Loader";
import styles from "./productdetail.module.css";
import Header from "../Components/Header";
import { useDispatch, useSelector } from "react-redux";
import Popup from "../Components/popup";
import Cookies from "js-cookie";

import {
  addItemCart,
  quantityUpdation,
  removeItemCart,
} from "../redux/cartSlice";
import { deleteProduct } from "../redux/productSlice";

const ProductDetails = () => {
  const { _id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(0);

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
    if (!product) return;
    const found = items.find((item) => item._id === product._id);
    setCurrentQuantity(found ? found.quantity : 0);
  }, [product, items]);

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
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
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
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Product not found</p>;

  const inCart = items.find((item) => item._id === product._id);

  return (
    <div className={styles.detailsContainer}>
      <Header />
      {showPopup && <Popup onClose={closePopup} updateId={updateId} />}
      <div className={styles.details}>
        <img
          src={product.image}
          alt={product.title}
          className={styles.detailsImage}
        />
        <div className={styles.detailsContent}>
          <h1>{product.title}</h1>
          <p className={styles.description}>{product.description}</p>
          <p className={styles.price}>Price: {product.price}$</p>
          <p className={styles.rating}>Rating: {product.rating}</p>
          <p className={product.inStock ? styles.stockin : styles.stockout}>
            {product.inStock
              ? `Items Left: ${product.inStock}`
              : "Out of Stock"}
          </p>

          {inCart && !isAdmin ? (
            <div className={styles.ProductCartActions}>
              <button
                type="button"
                onClick={() =>
                  handleDecrementQuantity(product._id, Number(currentQuantity))
                }
                className={styles.ProductCartaction_buttons}
              >
                -
              </button>

              <p className={styles.cartQuantity}>In Cart: {currentQuantity}</p>

              <button
                type="button"
                onClick={() =>
                  handleIncrementQuantity(product._id, Number(currentQuantity))
                }
                className={styles.ProductCartaction_buttons}
              >
                +
              </button>
            </div>
          ) : !isAdmin ? (
            <button
              className={styles.addtocart_button}
              onClick={() => addToCartItems(product)}
            >
              Add to Cart
            </button>
          ) : (
            <div className={styles.admin_button_functions}>
              <button
                className={styles.addtocart_button}
                onClick={() => removeProduct(product._id)}
              >
                Remove Product
              </button>
              <button
                type="button"
                className={styles.addtocart_button}
                onClick={() => updateProductAdmin(product._id)}
              >
                Update Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
