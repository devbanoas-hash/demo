import { create } from 'zustand';
import { Order, Product, Shipper, User, OrderStatus } from '@/types';
import { mockOrders, mockProducts, mockShippers, mockUsers } from '@/data/mockData';

interface OrderStore {
  orders: Order[];
  products: Product[];
  shippers: Shipper[];
  users: User[];
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  assignShipper: (orderId: string, shipperId: string) => void;
  deleteOrder: (id: string) => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Shipper actions
  addShipper: (shipper: Omit<Shipper, 'id'>) => void;
  updateShipper: (id: string, updates: Partial<Shipper>) => void;
  deleteShipper: (id: string) => void;
  
  // User actions
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useOrderStore = create<OrderStore>((set) => ({
  orders: mockOrders,
  products: mockProducts,
  shippers: mockShippers,
  users: mockUsers,

  addOrder: (order) => set((state) => ({
    orders: [...state.orders, {
      ...order,
      id: `ORD${String(state.orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }],
  })),

  updateOrder: (id, updates) => set((state) => ({
    orders: state.orders.map((o) =>
      o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
    ),
  })),

  updateOrderStatus: (id, status) => set((state) => ({
    orders: state.orders.map((o) =>
      o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ),
  })),

  assignShipper: (orderId, shipperId) => set((state) => ({
    orders: state.orders.map((o) =>
      o.id === orderId
        ? { ...o, shipperId, status: 'delivering' as OrderStatus, updatedAt: new Date().toISOString() }
        : o
    ),
  })),

  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter((o) => o.id !== id),
  })),

  addProduct: (product) => set((state) => ({
    products: [...state.products, { ...product, id: generateId() }],
  })),

  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id),
  })),

  addShipper: (shipper) => set((state) => ({
    shippers: [...state.shippers, { ...shipper, id: generateId() }],
  })),

  updateShipper: (id, updates) => set((state) => ({
    shippers: state.shippers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
  })),

  deleteShipper: (id) => set((state) => ({
    shippers: state.shippers.filter((s) => s.id !== id),
  })),

  addUser: (user) => set((state) => ({
    users: [...state.users, { ...user, id: generateId() }],
  })),

  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
  })),

  deleteUser: (id) => set((state) => ({
    users: state.users.filter((u) => u.id !== id),
  })),
}));