export type OrderStatus = 'new' | 'ready' | 'delivering' | 'completed';
export type UserRole = 'sales' | 'shipper' | 'admin';

export interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  deliveryDate: string;
  deliveryTime: string;
  prepaid: number;
  collection: number;
  notes: string;
  status: OrderStatus;
  shipperId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipper {
  id: string;
  name: string;
  phone: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface DashboardStats {
  newOrders: number;
  readyOrders: number;
  deliveringOrders: number;
  completedOrders: number;
  totalCollection: number;
}