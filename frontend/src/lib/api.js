const API_BASE = "http://localhost:8000";

export async function fetchAPI(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || "API Error");
    }
    return res.json();
}

export const api = {
    fetchAPI,
    getProducts: () => fetchAPI("/products"),
    getShelfLayout: (rid) => fetchAPI(`/shelf-layout${rid ? `?retailer_id=${rid}` : ""}`),
    getAnalytics: () => fetchAPI("/analytics/performance"),
    getShelfRecs: (rid) => fetchAPI(`/optimization/shelf-recommendations${rid ? `?retailer_id=${rid}` : ""}`),

    // Users
    getUsers: () => fetchAPI("/users"),
    loginUser: (user_id) => fetchAPI("/users/login", {
        method: "POST",
        body: JSON.stringify({ user_id })
    }),
    getUserRecs: (user_id, rid) => fetchAPI(`/recommendations/${user_id}${rid ? `?retailer_id=${rid}` : ""}`),
    getUserOrders: (user_id) => fetchAPI(`/users/${user_id}/orders`),
    placeOrder: (user_id, retailer_id, items) => fetchAPI("/order", {
        method: "POST",
        body: JSON.stringify({ user_id, retailer_id, items })
    }),

    // Retailers
    getRetailers: () => fetchAPI("/retailers"),
    getRetailerProducts: (rid) => fetchAPI(`/retailers/${rid}/products`),
    getRetailerNotifs: (rid) => fetchAPI(`/retailers/${rid}/notifications`),

    // Fraud
    getFraudStatus: (oid) => fetchAPI(`/fraud/order/${oid}/status`),

    // Cart
    updateCart: (user_id, store_id, items) => fetchAPI("/cart/update", {
        method: "POST",
        body: JSON.stringify({ user_id, store_id, items })
    }),
    getCart: (user_id, store_id) => fetchAPI(`/cart/${user_id}/${store_id}`),
};
