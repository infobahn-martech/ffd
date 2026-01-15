import axios from "axios";

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

// ✅ Optional: handle 401 globally
Gateway.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 globally if needed
    // if (error?.response?.status === 401) { ...logout / redirect... }
    return Promise.reject(error);
  }
);

export default Gateway;
