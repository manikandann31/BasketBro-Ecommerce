import api from "./api";

export const adminLogin = (username, password) => {
    return api.post("/auth/login", {
        username,
        password
    });
};