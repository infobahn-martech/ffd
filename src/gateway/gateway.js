import axios from 'axios';

const url = import.meta.env.VITE_API_ENDPOINT;

const Gateway = axios.create({
  baseURL: `${url}api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

Gateway.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Gateway.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const decryptedAccessToken = token;
    if (decryptedAccessToken)
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${decryptedAccessToken}`,
      };
    return config;
  },
  (error) => {
    console.log('Interceptor error:', error);

    return Promise.reject(error);
  }
);

export default Gateway;
