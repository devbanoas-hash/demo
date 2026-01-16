import { useAppData } from '@/contexts/AppDataContext';

/**
 * Custom hook for customers management
 * Flow: Hook -> Context -> Store -> UI
 * Data is already fetched by AppDataContext on app initialization
 */
export function useCustomers() {
  const {
    customers,
    isLoading,
    createCustomer,
    refreshCustomers,
  } = useAppData();

  return {
    customers,
    isLoading,
    fetchCustomers: refreshCustomers,
    createCustomer,
  };
}
