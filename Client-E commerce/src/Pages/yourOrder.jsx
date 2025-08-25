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
  if (error) return <p className={styles.order_container}>Error: {error}</p>;

  const orderList = orderedItems || [];

  return (
    <div className={styles.order_container}>
      <Header />
      <ul className={styles.orderList}>
        {orderList.length > 0 ? (
          orderList.map((order, index) => {
            const date = new Date(order.created_at);
            const formattedDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <li
                key={index}
                className={styles.orderCard}
                onClick={() => navigate(`/products/${order._id}`)}
              >
                <img
                  src={order.image}
                  alt={order.title}
                  className={styles.orderImage}
                />
                <div className={styles.orderDetails}>
                  <h2 className={styles.orderTitle}>{order.title}</h2>
                  <p className={styles.orderPrice}>Price: {order.price}$</p>
                  <p className={styles.orderStatus}>Status: {order.status}</p>
                  <p className={styles.orderDate}>
                    Date: {formattedDate} at {formattedTime}
                  </p>
                </div>
              </li>
            );
          })
        ) : (
          <p className={styles.noordersFound}>No Ordered items found.</p>
        )}
      </ul>
    </div>
  );
};

export default OrderItemList;
