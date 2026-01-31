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
    getShelfLayout: () => fetchAPI("/shelf-layout"),
    getAnalytics: () => fetchAPI("/analytics/performance"),
    getShelfRecs: () => fetchAPI("/optimization/shelf-recommendations"),

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
};
