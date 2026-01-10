import { Order, Product, Shipper, User, Customer } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Bánh Bông Lan Trứng Muối', price: 280000, category: 'banh_au', active: true },
  { id: '2', name: 'Bánh Kem Dâu Tây', price: 350000, category: 'banh_kem', active: true },
  { id: '3', name: 'Bánh Su Kem', price: 15000, category: 'banh_au', active: true },
  { id: '4', name: 'Bánh Croissant', price: 35000, category: 'banh_au', active: true },
  { id: '5', name: 'Bánh Tiramisu', price: 320000, category: 'banh_kem', active: true },
  { id: '6', name: 'Bánh Mousse Chocolate', price: 380000, category: 'banh_kem', active: true },
  { id: '7', name: 'Bánh Cupcake', price: 25000, category: 'banh_au', active: true },
  { id: '8', name: 'Bánh Macaron (hộp 6)', price: 150000, category: 'banh_au', active: true },
  { id: '9', name: 'Bánh Kem Sinh Nhật', price: 450000, category: 'banh_kem', active: true },
  { id: '10', name: 'Bánh Kem Socola', price: 400000, category: 'banh_kem', active: true },
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
  { id: '4', name: 'Anh Tú', email: 'kitchen@vani.vn', role: 'kitchen_lead', active: true },
  { id: '5', name: 'Bảo Ngọc', email: 'staff@vani.vn', role: 'kitchen_staff', active: true },
];

export const mockCustomers: Customer[] = [
  {
    id: 'CUS001',
    name: 'Chị Hương',
    phone: '0912345678',
    addresses: [
      { street: '123 Nguyễn Huệ', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP.HCM' },
    ],
    orderIds: ['ORD001'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CUS002',
    name: 'Anh Tuấn',
    phone: '0923456789',
    addresses: [
      { street: '456 Lê Lợi', ward: 'Phường 1', district: 'Quận 3', city: 'TP.HCM' },
    ],
    orderIds: ['ORD002'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CUS003',
    name: 'Cô Mai',
    phone: '0934567890',
    addresses: [
      { street: '789 Hai Bà Trưng', ward: 'Phường Bến Thành', district: 'Quận 1', city: 'TP.HCM' },
    ],
    orderIds: ['ORD003'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CUS004',
    name: 'Chị Lan',
    phone: '0945678901',
    addresses: [
      { street: '321 Võ Văn Tần', ward: 'Phường 5', district: 'Quận 3', city: 'TP.HCM' },
    ],
    orderIds: ['ORD004'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CUS005',
    name: 'Anh Dũng',
    phone: '0956789012',
    addresses: [
      { street: '654 Điện Biên Phủ', ward: 'Phường 15', district: 'Quận Bình Thạnh', city: 'TP.HCM' },
    ],
    orderIds: ['ORD005'],
    createdAt: new Date().toISOString(),
  },
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    customerId: 'CUS001',
    customerName: 'Chị Hương',
    customerPhone: '0912345678',
    deliveryMethod: 'delivery',
    deliveryAddress: { street: '123 Nguyễn Huệ', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP.HCM' },
    deliveryFee: 30000,
    items: [
      { id: '1', productType: 'available', productId: '1', productName: 'Bánh Bông Lan Trứng Muối', quantity: 2, price: 280000, category: 'banh_au' },
      { id: '2', productType: 'available', productId: '3', productName: 'Bánh Su Kem', quantity: 10, price: 15000, category: 'banh_au' },
    ],
    deliveryDate: today,
    deliveryTime: '10:00',
    totalAmount: 740000,
    prepaid: 200000,
    collection: 540000,
    paymentMethod: 'cash',
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD002',
    customerId: 'CUS002',
    customerName: 'Anh Tuấn',
    customerPhone: '0923456789',
    deliveryMethod: 'pickup',
    deliveryFee: 0,
    items: [
      { id: '1', productType: 'available', productId: '2', productName: 'Bánh Kem Dâu Tây', quantity: 1, price: 350000, category: 'banh_kem' },
      { id: '2', productType: 'available', productId: '9', productName: 'Bánh Kem Sinh Nhật', quantity: 1, price: 450000, category: 'banh_kem' },
    ],
    deliveryDate: today,
    deliveryTime: '14:00',
    totalAmount: 800000,
    prepaid: 800000,
    collection: 0,
    paymentMethod: 'transfer',
    status: 'ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD003',
    customerId: 'CUS003',
    customerName: 'Cô Mai',
    customerPhone: '0934567890',
    deliveryMethod: 'delivery',
    deliveryAddress: { street: '789 Hai Bà Trưng', ward: 'Phường Bến Thành', district: 'Quận 1', city: 'TP.HCM' },
    deliveryFee: 25000,
    items: [
      { id: '1', productType: 'available', productId: '5', productName: 'Bánh Tiramisu', quantity: 1, price: 320000, category: 'banh_kem' },
      { id: '2', productType: 'custom', productName: 'Bánh kem sinh nhật tùy chỉnh', quantity: 1, price: 500000, category: 'banh_kem', description: 'Bánh kem 2 tầng, màu hồng pastel, ghi chữ Happy Birthday', images: [] },
      { id: '3', productType: 'available', productId: '4', productName: 'Bánh Croissant', quantity: 5, price: 35000, category: 'banh_au' },
    ],
    deliveryDate: today,
    deliveryTime: '16:00',
    totalAmount: 1020000,
    prepaid: 400000,
    collection: 620000,
    paymentMethod: 'cash',
    status: 'new',
    notes: 'Giao hàng trước 4h chiều, gọi điện trước 30 phút',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD004',
    customerId: 'CUS004',
    customerName: 'Chị Lan',
    customerPhone: '0945678901',
    deliveryMethod: 'pickup',
    deliveryFee: 0,
    items: [
      { id: '1', productType: 'available', productId: '6', productName: 'Bánh Mousse Chocolate', quantity: 2, price: 380000, category: 'banh_kem' },
    ],
    deliveryDate: today,
    deliveryTime: '09:00',
    totalAmount: 760000,
    prepaid: 760000,
    collection: 0,
    paymentMethod: 'transfer',
    status: 'handed_over',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD005',
    customerId: 'CUS005',
    customerName: 'Anh Dũng',
    customerPhone: '0956789012',
    deliveryMethod: 'delivery',
    deliveryAddress: { street: '654 Điện Biên Phủ', ward: 'Phường 15', district: 'Quận Bình Thạnh', city: 'TP.HCM' },
    deliveryFee: 35000,
    items: [
      { id: '1', productType: 'available', productId: '8', productName: 'Bánh Macaron (hộp 6)', quantity: 3, price: 150000, category: 'banh_au' },
      { id: '2', productType: 'available', productId: '10', productName: 'Bánh Kem Socola', quantity: 1, price: 400000, category: 'banh_kem' },
    ],
    deliveryDate: today,
    deliveryTime: '11:00',
    totalAmount: 885000,
    prepaid: 400000,
    collection: 485000,
    paymentMethod: 'cash',
    status: 'delivering',
    shipperId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD006',
    customerName: 'Khách mới',
    customerPhone: '0967890123',
    deliveryMethod: 'pickup',
    deliveryFee: 0,
    items: [
      { id: '1', productType: 'available', productId: '4', productName: 'Bánh Croissant', quantity: 5, price: 35000, category: 'banh_au' },
      { id: '2', productType: 'available', productId: '7', productName: 'Bánh Cupcake', quantity: 10, price: 25000, category: 'banh_au' },
    ],
    deliveryDate: today,
    deliveryTime: '08:00',
    totalAmount: 425000,
    prepaid: 0,
    collection: 425000,
    paymentMethod: 'cash',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD007',
    customerName: 'Chị Thảo',
    customerPhone: '0978901234',
    deliveryMethod: 'delivery',
    deliveryAddress: { street: '99 Cách Mạng Tháng 8', ward: 'Phường 5', district: 'Quận 3', city: 'TP.HCM' },
    deliveryFee: 30000,
    items: [
      { id: '1', productType: 'available', productId: '2', productName: 'Bánh Kem Dâu Tây', quantity: 2, price: 350000, category: 'banh_kem' },
      { id: '2', productType: 'available', productId: '1', productName: 'Bánh Bông Lan Trứng Muối', quantity: 1, price: 280000, category: 'banh_au' },
    ],
    deliveryDate: tomorrow,
    deliveryTime: '10:00',
    totalAmount: 1010000,
    prepaid: 500000,
    collection: 510000,
    paymentMethod: 'cash',
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD008',
    customerName: 'Anh Phong',
    customerPhone: '0989012345',
    deliveryMethod: 'pickup',
    deliveryFee: 0,
    items: [
      { id: '1', productType: 'custom', productName: 'Bánh kem 3 tầng đặc biệt', quantity: 1, price: 1200000, category: 'banh_kem', description: 'Bánh 3 tầng, trang trí hoa hồng, màu trắng hồng', images: [] },
    ],
    deliveryDate: tomorrow,
    deliveryTime: '15:00',
    totalAmount: 1200000,
    prepaid: 600000,
    collection: 600000,
    paymentMethod: 'transfer',
    status: 'new',
    notes: 'Khách VIP, cần làm đẹp',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Location data for Vietnam
export const cities = ['TP.HCM', 'Hà Nội', 'Đà Nẵng'];

export const districts: Record<string, string[]> = {
  'TP.HCM': ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Quận Bình Thạnh', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Gò Vấp'],
  'Hà Nội': ['Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Đống Đa', 'Quận Cầu Giấy', 'Quận Thanh Xuân'],
  'Đà Nẵng': ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn'],
};

export const wards: Record<string, string[]> = {
  'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Đa Kao'],
  'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'],
  'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 13', 'Phường 15', 'Phường 17'],
  'Quận Phú Nhuận': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'],
};