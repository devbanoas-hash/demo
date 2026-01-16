/**
 * Central export point for all stores
 * This allows axios config to import the auth store
 */

export { useAuthStore } from './authStore';
export { useOrderStore } from './orderStore';

// Export store instances for non-React usage (e.g., axios interceptors)
import { useAuthStore } from './authStore';

// Get store state without hook (for use in interceptors)
export const getAuthStore = () => useAuthStore.getState();
