import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;
    if (originalConfig.url !== "/auth/refresh" && err.response) {
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;
        try {
          const refreshResponse = await axiosInstance.get("/auth/refresh");
          if (!refreshResponse.data?.authenticied)
            return Promise.reject(err);
          return axiosInstance(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
