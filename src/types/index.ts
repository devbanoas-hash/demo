export type OrderStatus = 'draft' | 'new' | 'ready' | 'delivering' | 'completed';
export type UserRole = 'sales' | 'shipper' | 'admin';
export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'transfer';
export type ProductType = 'available' | 'custom';

export interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface OrderItem {
  id: string;
  productType: ProductType;
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
  // For custom cakes
  description?: string;
  images?: string[];
}

export interface DeliveryAddress {
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  addresses: DeliveryAddress[];
  orderIds: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: DeliveryAddress;
  deliveryFee: number;
  items: OrderItem[];
  deliveryDate: string;
  deliveryTime: string;
  totalAmount: number;
  prepaid: number;
  collection: number;
  paymentMethod: PaymentMethod;
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
  draftOrders: number;
  newOrders: number;
  readyOrders: number;
  deliveringOrders: number;
  completedOrders: number;
  totalCollection: number;
}
