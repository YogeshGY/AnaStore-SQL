import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../redux/productSlice";
import LoaderComponent from "../Components/Loader";
import styles from "./productList.module.css";
import { useLocation, useNavigate } from "react-router";
import Header from "../Components/Header";
import Popup from "../Components/popup";
import { getCartItems } from "../redux/cartSlice";

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    items: products,
    loading,
    error,
  } = useSelector((state) => state.product);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPopup, setShowPopup] = useState(false);
  const [updateId, setUpdateId] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(getCartItems());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const addProduct = () => {
    setUpdateId(null);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const categories = [
    "All",
    ...new Set(products?.map((item) => item.category)),
  ];

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === "All" || prod.category === selectedCategory;

    const matchesSearch = (prod.title || "")
      .toLowerCase()
      .includes((debouncedSearchTerm || "").toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (loading) return <LoaderComponent />;
  if (error) return <p>Error: {error}</p>;

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
                selectedCategory === category
                  ? styles.activeCategory
                  : styles.categoryItem
              }`}
            >
              {category}
            </li>
          ))}
        </ul>
        {location.pathname === "/admin" && (
          <button
            type="button"
            className={styles.addtocart_button}
            onClick={addProduct}
          >
            Add Product
          </button>
        )}
      </div>

      {showPopup && <Popup onClose={closePopup} updateId={updateId} />}

      <ul className={styles.productList}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((prod) => {
            return (
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

                  <p className={styles.productRating}>Ratings: {prod.rating}</p>
                </div>
              </li>
            );
          })
        ) : (
          <p className={styles.noProductsFound}>No products found.</p>
        )}
      </ul>
    </div>
  );
};

export default ProductList;
