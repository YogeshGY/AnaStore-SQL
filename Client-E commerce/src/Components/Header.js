import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = cookies.get("jwtToken") ? true : false;
  const userRole = cookies.get("userRole");
  const { items } = useSelector((state) => state.cart);

  const handleLogout = () => {
    if (token) {
      cookies.remove("jwtToken");
      cookies.remove("userId");
      dispatch(logout());
      navigate("/login");
    } else {
      navigate("/");
    }
  };

  const cartItemCount = items.reduce(
    (total, item) => Number(total) + Number(item.quantity),
    0
  );

  return (
    <header className={styles.headerContainer}>
      <h1 onClick={() => navigate(userRole === "admin" ? "/admin" : "/")}>
        AS
      </h1>
      <nav>
        <ul>
          <li
            onClick={() => {
              navigate(userRole === "admin" ? "/admin" : "/");
            }}
          >
            Home
          </li>
          <li
            className={styles.cartLink}
            onClick={() => {
              navigate("/cart");
            }}
          >
            Cart
            {items.length > 0 && (
              <span className={styles.cartBadge}>{cartItemCount}</span>
            )}
          </li>
          <li className={styles.cartLink}
          onClick={()=>{navigate("/yourOrders")}}>Your Orders</li>
        </ul>
      </nav>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default Header;
