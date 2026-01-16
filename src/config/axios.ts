import axios from "axios";
import { getAuthStore } from "../store";
import { getTokenFromStorage, clearTokenFromStorage } from "../utils/tokenManager";

export const api = axios.create({
    // baseURL: import.meta.env.VITE_PUBLIC_API_URL || import.meta.env.VITE_API_URL,
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ensure FormData requests are sent with proper boundary by removing explicit content-type
api.interceptors.request.use((config) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        if (config.headers) {
            delete (config.headers as any)['Content-Type'];
        }
    }
    return config;
});

// Add Bearer token to all requests
// Priority: Zustand store (in-memory) > sessionStorage
api.interceptors.request.use(
    (config) => {
        // Get token from Zustand store (primary source - most secure)
        const authState = getAuthStore();
        let token = authState.accessToken;
        
        // Fallback to sessionStorage if not in store (e.g., on page refresh)
        if (!token) {
            token = getTokenFromStorage();
        }
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 Unauthorized responses
let isRedirecting = false;
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !isRedirecting) {
            isRedirecting = true;
            // Clear token from both Zustand store and sessionStorage
            const authStore = getAuthStore();
            authStore.logout();
            clearTokenFromStorage();
            // Also clear old localStorage token if exists (migration)
            try {
                localStorage.removeItem('accessToken');
            } catch (e) {
                // Ignore
            }
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            } else {
                isRedirecting = false;
            }
        }
        return Promise.reject(error);
    }
);