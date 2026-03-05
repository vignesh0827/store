const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const getHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const apiSvc = {
    login: async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }
        return response.json();
    },
    signup: async (username, password, role) => {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Signup failed');
        }
        return response.json();
    },
    get: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },
    post: async (endpoint, data, options = {}) => {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { ...getHeaders(isFormData), ...options.headers },
            body: isFormData ? data : JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || `API Error: ${response.statusText}`);
        }
        return response.json();
    },
    delete: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },
    put: async (endpoint, data, options = {}) => {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: { ...getHeaders(isFormData), ...options.headers },
            body: isFormData ? data : JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || `API Error: ${response.statusText}`);
        }
        return response.json();
    },
    // Wastage
    getWastages: async () => {
        const response = await fetch(`${API_BASE_URL}/wastage/`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch wastage records");
        return response.json();
    },
    addWastage: async (record) => {
        const response = await fetch(`${API_BASE_URL}/wastage/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(record)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add wastage record');
        }
        return response.json();
    }
};
