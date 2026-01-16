import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { getAllOrder, createOrder, updateOrder, deleteOrder } from '@/services/order.service';
import { getAllCustomer, createCustomer } from '@/services/customer.service';
import { getAllUser } from '@/services/user.service';
import { getAllCake } from '@/services/cake.service';
import { getAllShipper } from '@/services/shipper.service';
import { IOrder } from '@/types/order';
import { ICustomer } from '@/types/customer';
import { IUser } from '@/types/user';
import { ICake } from '@/types/cake';
import { IShipper } from '@/types/shipper';
import { toast } from 'sonner';
import { connectSocket, disconnectSocket, getSocket } from '@/config/socket';
import { LoadingModal } from '@/components/ui/LoadingModal';

interface AppDataContextType {
  // Data
  orders: IOrder[];
  customers: ICustomer[];
  users: IUser[];
  cakes: ICake[];
  shippers: IShipper[];
  
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  
  // Order actions
  createOrder: (order: IOrder) => Promise<{ success: boolean; data?: IOrder; error?: string }>;
  updateOrder: (orderId: string, updates: Partial<IOrder>) => Promise<{ success: boolean; data?: IOrder; error?: string }>;
  deleteOrder: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  refreshOrders: () => Promise<void>;
  
  // Customer actions
  createCustomer: (customer: ICustomer) => Promise<{ success: boolean; data?: ICustomer; error?: string }>;
  refreshCustomers: () => Promise<void>;
  
  // Refresh all data
  refreshAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}

interface AppDataProviderProps {
  children: ReactNode;
}

export function AppDataProvider({ children }: AppDataProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const {
    orders,
    customers,
    users,
    cakes,
    shippers,
    setOrders,
    setCustomers,
    setUsers,
    setCakes,
    setShippers,
    addOrder,
    updateOrder: updateOrderStore,
    deleteOrder: deleteOrderStore,
    addCustomer,
    setLoading,
  } = useOrderStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch all data
  const fetchAllData = async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    try {
      const [ordersData, customersData, usersData, cakesData, shippersData] = await Promise.all([
        getAllOrder().catch(err => {
          console.error('Error fetching orders:', err);
          return [];
        }),
        getAllCustomer().catch(err => {
          console.error('Error fetching customers:', err);
          return [];
        }),
        getAllUser().catch(err => {
          console.error('Error fetching users:', err);
          return [];
        }),
        getAllCake().catch(err => {
          console.error('Error fetching cakes:', err);
          return [];
        }),
        getAllShipper().catch(err => {
          console.error('Error fetching shippers:', err);
          return [];
        }),
      ]);

      setOrders(ordersData);
      setCustomers(customersData);
      setUsers(usersData);
      setCakes(cakesData);
      setShippers(shippersData);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching all data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      fetchAllData();
    }
  }, [isAuthenticated, isInitialized]);

  // Setup socket connection and listeners for real-time updates
  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect socket khi logout
      disconnectSocket();
      return;
    }

    try {
      // Connect socket
      const socket = connectSocket();

      // Listen for order:created event
      socket.on('order:created', (data: { order: IOrder; message: string }) => {
        console.log('Socket: order:created', data);
        // Thêm order mới vào store
        addOrder(data.order);
        // Hiển thị toast notification
        toast.success(data.message || 'Đơn hàng mới đã được tạo');
      });

      // Listen for order:updated event
      socket.on('order:updated', (data: { order: IOrder; message: string }) => {
        console.log('Socket: order:updated', data);
        // Cập nhật order trong store
        updateOrderStore(data.order.order_id, data.order);
        // Hiển thị toast notification
        toast.success(data.message || 'Đơn hàng đã được cập nhật');
      });

      // Listen for order:deleted event
      socket.on('order:deleted', (data: { order_id: string; order: IOrder; message: string }) => {
        console.log('Socket: order:deleted', data);
        // Xóa order khỏi store
        deleteOrderStore(data.order_id);
        // Hiển thị toast notification
        toast.success(data.message || 'Đơn hàng đã được xóa');
      });

      // Listen for shipper:response event (khi shipper phản hồi qua Telegram)
      socket.on('shipper:response', (data: { 
        order_id: string; 
        status: 'accept' | 'reject' | 'cancel' | 'delivered';
        order: IOrder;
        shipper_name: string;
        cancel_reason?: string;
        message: string;
      }) => {
        console.log('[AppDataContext] Received shipper:response event:', data);
        console.log('[AppDataContext] Order ID:', data.order_id);
        console.log('[AppDataContext] Status:', data.status);
        console.log('[AppDataContext] Message:', data.message);
        
        try {
          // Cập nhật order trong store
          updateOrderStore(data.order_id, data.order);
          console.log('[AppDataContext] Order updated in store');
          
          // Hiển thị toast notification
          if (data.status === 'delivered' || data.status === 'accept') {
            console.log('[AppDataContext] Showing success toast:', data.message);
            toast.success(data.message);
          } else {
            console.log('[AppDataContext] Showing error toast:', data.message);
            toast.error(data.message);
          }
        } catch (error) {
          console.error('[AppDataContext] Error handling shipper:response:', error);
        }
      });

      // Cleanup function
      return () => {
        socket.off('order:created');
        socket.off('order:updated');
        socket.off('order:deleted');
        socket.off('shipper:response');
      };
    }
    catch (error) {
      console.error('Failed to setup socket listeners:', error);
    }
  }, [isAuthenticated, addOrder, updateOrderStore, deleteOrderStore]);

  // Order actions
  const handleCreateOrder = async (order: IOrder) => {
    setLoading('orders', true);
    try {
      const result = await createOrder(order);
      if (result.success && result.data) {
        addOrder(result.data);
        toast.success(result.message || 'Tạo đơn hàng thành công!');
        return { success: true, data: result.data };
      } else {
        toast.error(result.message || 'Tạo đơn hàng thất bại');
        return { success: false, error: result.message || 'Tạo đơn hàng thất bại' };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Tạo đơn hàng thất bại';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('orders', false);
    }
  };

  const handleUpdateOrder = async (orderId: string, updates: Partial<IOrder>) => {
    setLoading('orders', true);
    try {
      const result = await updateOrder(orderId, updates);
      if (result.success && result.data) {
        updateOrderStore(orderId, result.data);
        toast.success(result.message || 'Cập nhật đơn hàng thành công!');
        return { success: true, data: result.data };
      } else {
        toast.error(result.message || 'Cập nhật đơn hàng thất bại');
        return { success: false, error: result.message || 'Cập nhật đơn hàng thất bại' };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Cập nhật đơn hàng thất bại';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('orders', false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setLoading('orders', true);
    try {
      const result = await deleteOrder(orderId);
      if (result.deletedId) {
        deleteOrderStore(orderId);
        toast.success('Xóa đơn hàng thành công!');
        return { success: true };
      } else {
        toast.error('Xóa đơn hàng thất bại');
        return { success: false, error: 'Xóa đơn hàng thất bại' };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Xóa đơn hàng thất bại';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('orders', false);
    }
  };

  const refreshOrders = async () => {
    setLoading('orders', true);
    try {
      const data = await getAllOrder();
      setOrders(data);
    } catch (error: any) {
      console.error('Error refreshing orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading('orders', false);
    }
  };

  // Customer actions
  const handleCreateCustomer = async (customer: ICustomer) => {
    setLoading('customers', true);
    try {
      const result = await createCustomer(customer);
      if (result.success && result.data) {
        addCustomer(result.data);
        toast.success(result.message || 'Tạo khách hàng thành công');
        return { success: true, data: result.data };
      }
      toast.error(result.message || 'Tạo khách hàng thất bại');
      return { success: false, error: result.message || 'Tạo khách hàng thất bại' };
    } catch (error: any) {
      toast.error(error.message || 'Tạo khách hàng thất bại');
      return { success: false, error: error.message || 'Tạo khách hàng thất bại' };
    } finally {
      setLoading('customers', false);
    }
  };

  const refreshCustomers = async () => {
    setLoading('customers', true);
    try {
      const data = await getAllCustomer();
      setCustomers(data);
    } catch (error: any) {
      console.error('Error refreshing customers:', error);
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading('customers', false);
    }
  };

  // Refresh all data
  const refreshAll = async () => {
    await fetchAllData();
  };

  const value: AppDataContextType = {
    orders,
    customers,
    users,
    cakes,
    shippers,
    isLoading,
    isInitialized,
    createOrder: handleCreateOrder,
    updateOrder: handleUpdateOrder,
    deleteOrder: handleDeleteOrder,
    refreshOrders,
    createCustomer: handleCreateCustomer,
    refreshCustomers,
    refreshAll,
  };

  return (
    <AppDataContext.Provider value={value}>
      {/* Loading Modal khi fetch data lần đầu */}
      <LoadingModal 
        open={isLoading && !isInitialized} 
      />
      {children}
    </AppDataContext.Provider>
  );
}
