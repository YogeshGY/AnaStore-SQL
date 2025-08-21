import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import LoaderComponent from "../Components/Loader";
import styles from "./yourOrdrs.module.css";
import { useNavigate } from "react-router";
import Header from "../Components/Header";
import { getorderItems } from "../redux/yourOrderSlice";

const OrderItemList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderedItems, loading, error } = useSelector(
    (state) => state.yourOrders
  );

  useEffect(() => {
    dispatch(getorderItems());
  }, [dispatch]);

  if (loading) return <LoaderComponent />;
  if (error) return <p>Error: {error}</p>;

  const orderList = orderedItems.yourOrders || [];

  return (
    <div className={styles.order_container}>
      <Header />
      <ul className={styles.orderList}>
        {orderList.length > 0 ? (
          orderList.map((order, index) => (
            <li
              key={index}
              className={styles.orderCard}
              onClick={() => navigate(`/orderucts/${order._id}`)}
            >
              <img
                src={order.image}
                alt={order.title}
                className={styles.orderImage}
              />
              <div className={styles.orderDetails}>
                <h2 className={styles.orderTitle}>{order.title}</h2>
                <p className={styles.orderPrice}>Price: {order.price}$</p>
                <p className={styles.orderRating}>Ratings: {order.rating}</p>
              </div>
            </li>
          ))
        ) : (
          <p className={styles.noordersFound}>No Ordered items found.</p>
        )}
      </ul>
    </div>
  );
};

export default OrderItemList;
