import axios from "axios";

const server = import.meta.env.VITE_SERVER_URL

const api = axios.create({ baseURL: server });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
