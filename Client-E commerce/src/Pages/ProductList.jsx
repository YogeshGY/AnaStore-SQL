import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProducts,
  searchProduct,
  getCategory,
} from "../redux/productSlice";
import LoaderComponent from "../Components/Loader";
import styles from "./productList.module.css";
import { useNavigate } from "react-router";
import Header from "../Components/Header";
import Popup from "../Components/popup";
import { getCartItems } from "../redux/cartSlice";
import { FaStar } from "react-icons/fa";

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPopup, setShowPopup] = useState(false);

  const {
    items: products,
    categories,
    loading,
    error,
  } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(getCategory());
    dispatch(getCartItems());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      dispatch(searchProduct({ searchTerm: debouncedSearchTerm }));
    } else {
      dispatch(fetchProducts());
    }
  }, [debouncedSearchTerm, dispatch]);

  const closePopup = () => {
    setShowPopup(false);
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (loading) return <LoaderComponent />;
  if (error) return <p className={styles.product_container}>Error: {error}</p>;

  return (
    <div className={styles.product_container}>
      <Header />
      <div className={styles.filterContainer}>
        <input
          type="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <ul className={styles.categoryList}>
          {categories.map((category, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedCategory(category)}
              className={`${styles.categoryItem} ${
                selectedCategory === category ? styles.activeCategory : ""
              }`}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>

      {showPopup && <Popup onClose={closePopup} updateId={true} />}

      <ul className={styles.productList}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((prod) => (
            <li
              key={prod._id}
              className={styles.productCard}
              onClick={() => navigate(`/products/${prod._id}`)}
            >
              <img
                src={prod.image}
                alt={prod.title}
                className={styles.productImage}
              />
              <div className={styles.productDetails}>
                <h2 className={styles.productTitle}>{prod.title}</h2>
                <p className={styles.productPrice}>Price: {prod.price}$</p>
                <p className={styles.productRating}>
                  Ratings: {parseFloat(prod.rating)}
                  <FaStar />
                </p>
              </div>
            </li>
          ))
        ) : (
          <p className={styles.noProductsFound}>No products found.</p>
        )}
      </ul>
    </div>
  );
};

export default ProductList;
