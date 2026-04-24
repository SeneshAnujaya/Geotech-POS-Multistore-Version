import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastNotification = () => (
  <ToastContainer
    toastStyle={{ color: "white", backgroundColor: "#00263d" }}
    closeButton={{ color: "white" }}
    theme="dark"
  />
);

export const showErrorToast = (message) => {
  toast.error(message, {
    closeOnClick: true,
  });
};

export const showSuccessToast = (message) => {
  toast.success(message, {
    closeOnClick: true,
  });
};

export const showWarningToast = (message) => {
  toast.warning(message, {
    closeOnClick: true,
  });
};

export default ToastNotification;
