/**
 * Token management utilities
 * Handles storing and retrieving authentication tokens from sessionStorage
 */

export const getTokenFromStorage = (): string | null => {
  try {
    return sessionStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error getting token from storage:', error);
    return null;
  }
};

export const setTokenToStorage = (token: string): void => {
  try {
    sessionStorage.setItem('accessToken', token);
  } catch (error) {
    console.error('Error setting token to storage:', error);
  }
};

export const clearTokenFromStorage = (): void => {
  try {
    sessionStorage.removeItem('accessToken');
  } catch (error) {
    console.error('Error clearing token from storage:', error);
  }
};
