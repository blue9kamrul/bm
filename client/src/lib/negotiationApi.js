import axios from 'axios';

const negotiationApi = axios.create({
  baseURL: import.meta.env.VITE_NEGOTIATION_API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

negotiationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

negotiationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Negotiation API Error:', error);
    return Promise.reject(error);
  }
);

export default negotiationApi;