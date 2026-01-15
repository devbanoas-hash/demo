
export type OrderStatus = 
  | 'draft' // Nháp
  | 'new'   // Mới
  | 'in_production' 
  | 'ready_to_handover' 
  | 'waiting_delivery' 
  | 'delivering' 
  | 'completed' 
  | 'issue_needed' 
  | 'waiting_processing';

export type DeliveryMethod = 'pickup' | 'delivery';

export type KitchenType = 'pastry' | 'cream' | 'custom'; // Bếp Âu | Bếp Kem | Đặt riêng

export interface Shipper {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  districts: string[];
}

export interface DeliveryAddress {
  street: string;
  ward: string;
  district: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string; // Legacy single image
  images?: string[]; // New: Multiple images support
  note?: string;
  kitchen?: KitchenType;
}

export interface PaymentRecord {
  id: string;
  timestamp: string;
  amount: number;
  method: 'cash' | 'transfer';
  receiver: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: DeliveryAddress;
  deliveryDate: string;
  deliveryTime: string; // Format "HH:mm"
  status: OrderStatus;
  
  // Payment & Totals
  collection: number; // Tiền thu hộ (Remaining)
  totalAmount?: number; // Tổng tiền đơn hàng
  deposit?: number; // Đã cọc
  shippingFee?: number; // Phí ship
  paymentMethod?: 'cash' | 'transfer';
  paymentReceiver?: string; // Người nhận tiền
  paymentHistory?: PaymentRecord[]; // Lịch sử thanh toán
  
  shipperId?: string;
  isExternalShip?: boolean;
  issueReason?: string;
  completedAt?: string;
  createdAt: string;
  paymentRecorded?: boolean;
  
  // Product Details (New Structure)
  items?: OrderItem[];

  // Legacy Fields (kept for backward compatibility with Production/Delivery pages)
  productName?: string;
  quantity?: number;
  kitchen?: KitchenType;
  notes?: string; // Miêu tả bánh/Ghi chú
  requiresPhoto?: boolean; // Yêu cầu chụp hình
  isStoreOrder?: boolean; // Đơn cho cửa hàng hay đơn khách
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  kitchen: KitchenType;
}
