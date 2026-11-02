import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
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