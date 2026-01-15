import axios from "axios";
import useAlertReducer from "../store/AlertReducer";

const BASE = import.meta.env.VITE_API_ENDPOINT;
// Example: https://infobahn.asia/sedres/   OR  https://infobahn.asia/sedres/api/

const normalizeBaseUrl = (base) => {
  if (!base) return "";
  // ensure ends with /
  return base.endsWith("/") ? base : `${base}/`;
};

const baseURL = (() => {
  const b = normalizeBaseUrl(BASE);
  // If env already contains /api, don’t add again
  if (b.endsWith("/api/")) return b;
  if (b.endsWith("/api")) return `${b}/`;
  return `${b}api/`;
})();

const Gateway = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// ✅ Attach token
Gateway.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle responses and show backend messages via toaster
Gateway.interceptors.response.use(
  (response) => {
    // Show success message from backend if available
    if (response?.data?.message) {
      const { success } = useAlertReducer.getState();
      success(response.data.message);
    }
    return response;
  },
  (error) => {
    // Show error message from backend
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "An error occurred. Please try again.";

    const { error: showError } = useAlertReducer.getState();
    showError(errorMessage);

    // Handle 401 globally if needed
    // if (error?.response?.status === 401) { ...logout / redirect... }
    return Promise.reject(error);
  }
);

export default Gateway;
