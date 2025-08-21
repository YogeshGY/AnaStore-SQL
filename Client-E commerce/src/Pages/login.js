import { useState } from "react";
import styles from "./login.module.css";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/auth";
import { useNavigate, Navigate } from "react-router-dom";
import { setUserDatas, getCartItems } from "../redux/cartSlice";
import cookies from "js-cookie";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);
  const userDatas = useSelector((state) => state.auth.userDatas);

  const token = cookies.get("jwtToken") ? true : false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      dispatch(setUserDatas(result));
      dispatch(getCartItems());
      navigate(result.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setErrorMessage(err || "Login failed");
    }
  };

  if (token && userDatas?.role) {
    return (
      <Navigate to={userDatas.role === "admin" ? "/admin" : "/"} replace />
    );
  }

  return (
    <div className={styles.loginpage_container}>
      <div className={styles.login_card}>
        <h2 className={styles.login_heading}>AnaStore</h2>
        <form className={styles.form_container} onSubmit={handleSubmit}>
          <label htmlFor="email" className={styles.input_label}>
            USER NAME
          </label>
          <input
            id="email"
            value={email}
            type="text"
            onChange={(e) => setEmail(e.target.value)}
            className={styles.login_input}
          />

          <label htmlFor="password" className={styles.input_label}>
            PASSWORD
          </label>
          <input
            id="password"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className={styles.login_input}
          />

          <button
            type="submit"
            className={styles.login_button}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {errorMessage && (
            <p className={styles.error_message}>{errorMessage}</p>
          )}
          {error && <p className={styles.error_message}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
