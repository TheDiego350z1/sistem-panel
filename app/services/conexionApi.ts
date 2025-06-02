import axios, { AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const ConexionApi = axios.create({
  baseURL: BASE_URL,
});

ConexionApi.interceptors.request.use(async (config) => {
  config.headers["Accept"] = "application/json";
  return config;
});

export { ConexionApi };
