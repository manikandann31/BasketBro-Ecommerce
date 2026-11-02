import axios from "axios";

const api = axios.create({
    // The fallback keeps local development working even when .env is absent.
    // Vercel/other deployments can override this with VITE_API_BASE_URL.
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

api.interceptors.request.use(
    (config) => {
        const requestPath = config.url || "";
        const isAdminRequest = requestPath.includes("/admin/");
        const token = isAdminRequest
            ? localStorage.getItem("adminToken")
            : requestPath.startsWith("/support/")
                ? localStorage.getItem("customerToken")
                : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;