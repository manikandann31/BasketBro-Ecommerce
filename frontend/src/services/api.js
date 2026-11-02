import axios from "axios";

const api = axios.create({
    // The fallback keeps local development working even when .env is absent.
    // Vercel/other deployments can override this with VITE_API_BASE_URL.
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

api.interceptors.request.use(
    (config) => {
        const requestPath = config.url || "";
        const method = (config.method || "get").toLowerCase();
        const isWriteMethod = ["post", "put", "patch", "delete"].includes(method);

        // Product reads are public. Product mutations are admin-only, even though
        // their REST paths are /products/... rather than /admin/products/...
        const isAdminRequest =
            requestPath.includes("/admin/") ||
            (isWriteMethod && /^\/?products(?:\/|$)/.test(requestPath));
        const isCustomerRequest =
            requestPath.startsWith("/support/") || requestPath.startsWith("/orders");
        const token = isAdminRequest
            ? sessionStorage.getItem("adminToken")
            : isCustomerRequest
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
