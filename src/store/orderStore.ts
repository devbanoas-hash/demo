import { create } from 'zustand';
import { Order, Product, Shipper, User, Customer, OrderStatus, PaymentLog, EditLog, PaymentMethod } from '@/types';
import { mockOrders, mockProducts, mockShippers, mockUsers, mockCustomers } from '@/data/mockData';

interface OrderStore {
  orders: Order[];
  products: Product[];
  shippers: Shipper[];
  users: User[];
  customers: Customer[];
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'paymentLogs' | 'editLogs'>) => string;
  updateOrder: (id: string, updates: Partial<Order>, employeeId?: string, employeeName?: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  confirmOrder: (id: string, prepaidAmount: number) => void;
  assignShipper: (orderId: string, shipperId: string) => void;
  deleteOrder: (id: string) => void;
  
  // Payment log actions
  addPaymentLog: (orderId: string, log: Omit<PaymentLog, 'id' | 'createdAt'>) => void;
  
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

  // Customer actions
  findCustomerByPhone: (phone: string) => Customer | undefined;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'orderIds'>) => string;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addOrderToCustomer: (customerId: string, orderId: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: mockOrders,
  products: mockProducts,
  shippers: mockShippers,
  users: mockUsers,
  customers: mockCustomers,

  addOrder: (order) => {
    const newId = `ORD${String(get().orders.length + 1).padStart(3, '0')}`;
    set((state) => ({
      orders: [...state.orders, {
        ...order,
        id: newId,
        paymentLogs: [],
        editLogs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
    }));
    return newId;
  },

  updateOrder: (id, updates, employeeId, employeeName) => set((state) => ({
    orders: state.orders.map((o) => {
      if (o.id === id) {
        const editLogs = [...o.editLogs];
        
        // Track changes if employee info provided
        if (employeeId && employeeName) {
          const trackableFields = ['customerName', 'customerPhone', 'deliveryDate', 'deliveryTime', 'totalAmount', 'deliveryMethod'];
          
          trackableFields.forEach(field => {
            if (updates[field as keyof Order] !== undefined && updates[field as keyof Order] !== o[field as keyof Order]) {
              editLogs.push({
                id: generateId(),
                field,
                oldValue: String(o[field as keyof Order] || ''),
                newValue: String(updates[field as keyof Order]),
                employeeId,
                employeeName,
                createdAt: new Date().toISOString(),
              });
            }
          });

          // Check if total amount changed (for pending approval)
          if (updates.totalAmount !== undefined && updates.totalAmount !== o.totalAmount) {
            // Mark as pending for manager approval
            updates.status = 'pending';
          }
        }

        return { ...o, ...updates, editLogs, updatedAt: new Date().toISOString() };
      }
      return o;
    }),
  })),

  updateOrderStatus: (id, status) => set((state) => ({
    orders: state.orders.map((o) =>
      o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ),
  })),

  confirmOrder: (id, prepaidAmount) => set((state) => ({
    orders: state.orders.map((o) => {
      if (o.id === id) {
        const collection = o.totalAmount - prepaidAmount;
        return { 
          ...o, 
          status: 'new' as OrderStatus, 
          prepaid: prepaidAmount,
          collection: Math.max(0, collection),
          updatedAt: new Date().toISOString() 
        };
      }
      return o;
    }),
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

  addPaymentLog: (orderId, log) => set((state) => ({
    orders: state.orders.map((o) => {
      if (o.id === orderId) {
        const newLog: PaymentLog = {
          ...log,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        const newPrepaid = o.prepaid + log.amount;
        const newCollection = Math.max(0, o.totalAmount - newPrepaid);
        
        return {
          ...o,
          prepaid: newPrepaid,
          collection: newCollection,
          paymentLogs: [...o.paymentLogs, newLog],
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    }),
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

  findCustomerByPhone: (phone) => {
    return get().customers.find((c) => c.phone === phone);
  },

  addCustomer: (customer) => {
    const newId = `CUS${String(get().customers.length + 1).padStart(3, '0')}`;
    set((state) => ({
      customers: [...state.customers, {
        ...customer,
        id: newId,
        orderIds: [],
        createdAt: new Date().toISOString(),
      }],
    }));
    return newId;
  },

  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
  })),

  addOrderToCustomer: (customerId, orderId) => set((state) => ({
    customers: state.customers.map((c) =>
      c.id === customerId ? { ...c, orderIds: [...c.orderIds, orderId] } : c
    ),
  })),
}));
