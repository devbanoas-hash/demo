import { useAppData } from '@/contexts/AppDataContext';
import { useOrderStore } from '@/store/orderStore';

/**
 * Custom hook for order management
 * Flow: Hook -> Context -> Store -> UI
 * Data is already fetched by AppDataContext on app initialization
 */
export function useOrders() {
  const { 
    orders, 
    isLoading,
    createOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
  } = useAppData();

  return {
    orders,
    isLoading,
    fetchOrders: refreshOrders,
    create: createOrder,
    update: updateOrder,
    delete: deleteOrder,
  };
}
