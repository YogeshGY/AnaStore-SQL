import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import LoaderComponent from "./Components/Loader";
import "./App.css";
import ProtectedRoute from "./protectedRoute";

const ProductList = React.lazy(() => import("./Pages/ProductList"));
const Login = React.lazy(() => import("./Pages/login"));
const ProductDetails = React.lazy(() => import("./Pages/ProductDetail"));
const Cart = React.lazy(() => import("./Pages/Cart"));
const OrderItemList = React.lazy(() => import("./Pages/yourOrder"));

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<LoaderComponent />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route exact path="/" element={<ProductList />} />
              <Route exact path="/admin" element={<ProductList />} />
              <Route exact path="/products/:_id" element={<ProductDetails />} />
              <Route exact path="/cart" element={<Cart />} />
              <Route exact path="/yourOrders" element={<OrderItemList />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
