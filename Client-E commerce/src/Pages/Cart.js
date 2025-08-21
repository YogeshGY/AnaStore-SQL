import { useState, useEffect } from "react";
import Header from "../Components/Header";
import styles from "./cart.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getCartItems,
  removeItemCart,
  emptyCart,
  quantityUpdation,
} from "../redux/cartSlice";
import { orderHistory } from "../redux/yourOrderSlice";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import LoaderComponent from "../Components/Loader";

const Cart = () => {
  const [checkout, setCheckout] = useState(0);
  const { items, loading, error } = useSelector((state) => state.cart);
  const [currentQuantity, setCurrentQuantity] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = Cookies.get("userId");

  useEffect(() => {
    dispatch(getCartItems());
  }, [dispatch, userId]);

  useEffect(() => {
    const total = items.reduce(
      (acc, item) => acc + item.price * (item.quantity || 1),
      0
    );
    setCheckout(total);
  }, [items]);

  useEffect(() => {
    setCurrentQuantity(
      items.reduce((acc, item) => {
        acc[item._id] = Number(item.quantity) || 1;
        return acc;
      }, {})
    );
  }, [items]);

  const handleRemoveFromCart = (_id) => {
    dispatch(removeItemCart(_id));
  };

  const handleIncrementQuantity = (_id, quantity) => {
    setCurrentQuantity((prev) => ({ ...prev, [_id]: quantity + 1 }));

    dispatch(
      quantityUpdation({
        _id: _id,
        quantity: quantity + 1,
      })
    );
  };

  const handleDecrementQuantity = (_id, quantity) => {
    if (quantity > 1) {
      setCurrentQuantity((prev) => ({ ...prev, [_id]: quantity - 1 }));
      dispatch(
        quantityUpdation({
          _id,
          quantity: quantity - 1,
        })
      );
    } else {
      dispatch(removeItemCart(_id));
    }
  };

  const paymentDone = () => {
    alert("Payment Successful");
    dispatch(orderHistory(...items));
    console.log("details add in your cart");
    dispatch(emptyCart());
  };

  if (loading) return <LoaderComponent />;
  if (error) return <p className={styles.cart_container}>Error: {error}</p>;

  return (
    <div className={styles.cart_container}>
      <Header />
      {items.length > 0 && (
        <button
          type="button"
          className={styles.emptycart_button}
          onClick={() => dispatch(emptyCart())}
        >
          Empty Cart
        </button>
      )}
      {items.length > 0 && (
        <button
          className={styles.goToShopmore}
          type="button"
          onClick={() => {
            navigate("/");
          }}
        >
          Shop for More items
        </button>
      )}
      <ul className={styles.cartList}>
        {items.length > 0 ? (
          items.map((prod) => (
            <li key={prod._id} className={styles.cartCard}>
              <img
                src={prod.image}
                alt={prod.title}
                className={styles.cartImage}
                onClick={() => navigate(`/products/${prod._id}`)}
              />
              <div
                className={styles.cartDetails}
                onClick={() => navigate(`/products/${prod._id}`)}
              >
                <h2 className={styles.cartTitle}>{prod.title}</h2>
                <p className={styles.cartPrice}>${prod.price}</p>
              </div>
              <div className={styles.cartActions}>
                <button
                  type="button"
                  onClick={() =>
                    handleDecrementQuantity(prod._id, currentQuantity[prod._id])
                  }
                  className={styles.action_buttons}
                >
                  -
                </button>
                <p className={styles.quantity}>{currentQuantity[prod._id]}</p>

                <button
                  type="button"
                  onClick={() =>
                    handleIncrementQuantity(prod._id, currentQuantity[prod._id])
                  }
                  className={styles.action_buttons}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFromCart(prod._id)}
                className={styles.removecart_button}
              >
                Remove
              </button>
            </li>
          ))
        ) : (
          <p className={styles.emptyCart}>
            Your cart is empty <br /> Add Somthing into theCart !{" "}
            <button
              className={styles.goToShopButton}
              type="button"
              onClick={() => {
                navigate("/");
              }}
            >
              Go to Shop
            </button>
          </p>
        )}
      </ul>
      {checkout > 0 && (
        <div className={styles.checkout}>
          <h1>CheckOut</h1>
          <p>Total: ${checkout.toFixed(2)}</p>
          <button className={styles.proceedButton} onClick={paymentDone}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
