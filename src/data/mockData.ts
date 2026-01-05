import { Order, Product, Shipper, User } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Bánh Bông Lan Trứng Muối', price: 280000, active: true },
  { id: '2', name: 'Bánh Kem Dâu Tây', price: 350000, active: true },
  { id: '3', name: 'Bánh Su Kem', price: 15000, active: true },
  { id: '4', name: 'Bánh Croissant', price: 35000, active: true },
  { id: '5', name: 'Bánh Tiramisu', price: 320000, active: true },
  { id: '6', name: 'Bánh Mousse Chocolate', price: 380000, active: true },
  { id: '7', name: 'Bánh Cupcake', price: 25000, active: true },
  { id: '8', name: 'Bánh Macaron (hộp 6)', price: 150000, active: true },
];

export const mockShippers: Shipper[] = [
  { id: '1', name: 'Nguyễn Văn An', phone: '0901234567', active: true },
  { id: '2', name: 'Trần Văn Bình', phone: '0902345678', active: true },
  { id: '3', name: 'Lê Văn Cường', phone: '0903456789', active: true },
];

export const mockUsers: User[] = [
  { id: '1', name: 'Admin Vani', email: 'admin@vani.vn', role: 'admin', active: true },
  { id: '2', name: 'Ngọc Anh', email: 'sales@vani.vn', role: 'sales', active: true },
  { id: '3', name: 'Minh Thư', email: 'sales2@vani.vn', role: 'sales', active: true },
];

const today = new Date().toISOString().split('T')[0];

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    customerName: 'Chị Hương',
    customerPhone: '0912345678',
    customerAddress: '123 Nguyễn Huệ, Q.1, TP.HCM',
    items: [
      { productId: '1', productName: 'Bánh Bông Lan Trứng Muối', quantity: 1, price: 280000 },
      { productId: '3', productName: 'Bánh Su Kem', quantity: 10, price: 15000 },
    ],
    deliveryDate: today,
    deliveryTime: '10:00',
    prepaid: 200000,
    collection: 230000,
    notes: 'Giao trước 10h sáng',
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD002',
    customerName: 'Anh Tuấn',
    customerPhone: '0923456789',
    customerAddress: '456 Lê Lợi, Q.3, TP.HCM',
    items: [
      { productId: '2', productName: 'Bánh Kem Dâu Tây', quantity: 1, price: 350000 },
    ],
    deliveryDate: today,
    deliveryTime: '14:00',
    prepaid: 350000,
    collection: 0,
    notes: 'Sinh nhật - ghi tên "Happy Birthday Minh"',
    status: 'ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD003',
    customerName: 'Cô Mai',
    customerPhone: '0934567890',
    customerAddress: '789 Hai Bà Trưng, Q.1, TP.HCM',
    items: [
      { productId: '5', productName: 'Bánh Tiramisu', quantity: 1, price: 320000 },
      { productId: '7', productName: 'Bánh Cupcake', quantity: 6, price: 25000 },
    ],
    deliveryDate: today,
    deliveryTime: '16:00',
    prepaid: 0,
    collection: 470000,
    notes: '',
    status: 'delivering',
    shipperId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD004',
    customerName: 'Chị Lan',
    customerPhone: '0945678901',
    customerAddress: '321 Võ Văn Tần, Q.3, TP.HCM',
    items: [
      { productId: '6', productName: 'Bánh Mousse Chocolate', quantity: 1, price: 380000 },
    ],
    deliveryDate: today,
    deliveryTime: '09:00',
    prepaid: 380000,
    collection: 0,
    notes: '',
    status: 'completed',
    shipperId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD005',
    customerName: 'Anh Dũng',
    customerPhone: '0956789012',
    customerAddress: '654 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
    items: [
      { productId: '8', productName: 'Bánh Macaron (hộp 6)', quantity: 3, price: 150000 },
    ],
    deliveryDate: today,
    deliveryTime: '11:00',
    prepaid: 200000,
    collection: 250000,
    notes: 'Quà tặng - gói đẹp',
    status: 'completed',
    shipperId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];