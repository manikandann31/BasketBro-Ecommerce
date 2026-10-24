import api from "./api";

export const getProducts = () => {
    return api.get("/products");
};

export const getProductById = (id) => {
    return api.get(`/products/id/${id}`);
};

export const getProductsPaged = (
    page = 0,
    size = 6,
    sort = "id,asc"
) => {
    return api.get("/products/paged", {
        params: {
            page,
            size,
            sort,
        },
    });
};
export const deleteProduct = (id) => {
    return api.delete(`/products/${id}`);
};

export const searchProducts = (
    keyword = "",
    categoryId = "",
    page = 0,
    size = 6,
    sort = "id,asc"
) => {
    return api.get("/products/search", {
        params: {
            keyword,
            categoryId: categoryId || undefined,
            page,
            size,
            sort,
        },
    });
};