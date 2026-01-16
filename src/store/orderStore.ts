import { create } from 'zustand';
import { IOrder } from '@/types/order';
import { IUser } from '@/types/user';
import { ICustomer } from '@/types/customer';
import { ICake } from '@/types/cake';
import { TOrderStatus } from '@/constants/order.constant';
import { IShipper } from '@/types/shipper';

interface OrderStore {
  orders: IOrder[];
  cakes: ICake[];
  shippers: IShipper[];
  users: IUser[];
  customers: ICustomer[];
  
  // Loading states
  isLoading: {
    orders: boolean;
    cakes: boolean;
    customers: boolean; 
    users: boolean;
  };
  
  // Order actions - Local state updates
  setOrders: (orders: IOrder[]) => void;
  addOrder: (order: IOrder) => void;
  updateOrderStatus: (id: string, status: TOrderStatus) => void;
  updateOrder: (id: string, updates: Partial<IOrder> | IOrder) => void;
  deleteOrder: (id: string) => void;
  
  // Cake actions - Local state updates
  setCakes: (cakes: ICake[]) => void;
  addCake: (cake: ICake) => void;
  updateCake: (id: string, updates: Partial<ICake>) => void;
  deleteCake: (id: string) => void;
  
  // Shipper actions - Local state updates
  setShippers: (shippers: IShipper[]) => void;
  addShipper: (shipper: IShipper) => void;
  updateShipper: (id: string, updates: Partial<IShipper>) => void;
  deleteShipper: (id: string) => void;
  
  // User actions - Local state updates
  setUsers: (users: IUser[]) => void;
  addUser: (user: IUser) => void;
  updateUser: (id: string, updates: Partial<IUser>) => void;
  deleteUser: (id: string) => void;

  // Customer actions - Local state updates
  setCustomers: (customers: ICustomer[]) => void;
  addCustomer: (customer: ICustomer) => void;
  findCustomerByPhone: (phone: string) => ICustomer | undefined;
  
  // Loading state actions
  setLoading: (key: keyof OrderStore['isLoading'], value: boolean) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  cakes: [],
  shippers: [],
  users: [],
  customers: [],
  isLoading: {
    orders: false,
    cakes: false,
    customers: false,
    users: false,
  },

  // Order actions
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  updateOrderStatus: (id, status) => set((state) => ({
    orders: state.orders.map((o) =>
      o.order_id === id ? { ...o, status, updated_at: new Date().toISOString() } : o
    ),
  })),
  updateOrder: (id, updates) => set((state) => ({
    orders: state.orders.map((o) =>
      o.order_id === id ? { ...(typeof updates === 'object' && 'order_id' in updates ? updates as IOrder : { ...o, ...updates }), updated_at: new Date().toISOString() } : o
    ),
  })),
  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter((o) => o.order_id !== id),
  })),

  // Cake actions
  setCakes: (cakes) => set({ cakes }),
  addCake: (cake) => set((state) => ({ cakes: [...state.cakes, cake] })),
  updateCake: (id, updates) => set((state) => ({
    cakes: state.cakes.map((c) => (c.cake_id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c)),
  })),
  deleteCake: (id) => set((state) => ({
    cakes: state.cakes.filter((c) => c.cake_id !== id),
  })),

  // Shipper actions
  setShippers: (shippers) => set({ shippers }),
  addShipper: (shipper) => set((state) => ({ shippers: [...state.shippers, shipper] })),
  updateShipper: (id, updates) => set((state) => ({
    shippers: state.shippers.map((s) => (s.shipper_phone_number === id ? { ...s, ...updates } : s)),
  })),
  deleteShipper: (id) => set((state) => ({
    shippers: state.shippers.filter((s) => s.shipper_phone_number !== id),
  })),

  // User actions
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((u) => (u.user_id === id ? { ...u, ...updates, updated_at: new Date().toISOString() } : u)),
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter((u) => u.user_id !== id),
  })),

  // Customer actions
  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
  findCustomerByPhone: (phone) => {
    return get().customers.find((c) => c.customer_phone_number === phone);
  },

  // Loading state actions
  setLoading: (key, value) => set((state) => ({
    isLoading: { ...state.isLoading, [key]: value },
  })),
}));
