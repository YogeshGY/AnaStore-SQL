import React from "react";
import Lottie from "lottie-react";
import loaderIcon from "../loaderIcon.json";
import "./loader.css";

const LoaderComponent = () => {
  return (
    <div className="loader-container">
      <Lottie animationData={loaderIcon} loop={true} />
    </div>
  );
};

export default LoaderComponent;
