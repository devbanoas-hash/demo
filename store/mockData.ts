
import { Order, Shipper, Product } from '../types';

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

export const MOCK_SHIPPERS: Shipper[] = [
  { id: 'nam', name: 'Nam', phone: '0901234567', active: true, districts: ['Quận 1', 'Quận 3'] },
  { id: 'hieu', name: 'Hiếu', phone: '0902223334', active: true, districts: ['Quận Bình Thạnh', 'Quận Phú Nhuận'] },
  { id: 'bao', name: 'Bảo', phone: '0905556667', active: true, districts: ['Quận 7', 'Nhà Bè'] },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'P01', name: 'Bánh Kem Dâu Tây', price: 450000, kitchen: 'cream', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=150&q=80' },
  { id: 'P02', name: 'Bánh Mousse Chanh Leo', price: 425000, kitchen: 'cream', image: 'https://images.unsplash.com/photo-1543506155-857d441112b3?w=150&q=80' },
  { id: 'P03', name: 'Bánh Su Kem (Hộp 10)', price: 85000, kitchen: 'pastry', image: 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=150&q=80' },
  { id: 'P04', name: 'Bánh Tiramisu', price: 520000, kitchen: 'cream', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=150&q=80' },
  { id: 'P05', name: 'Bánh Croissant (Cái)', price: 35000, kitchen: 'pastry', image: 'https://images.unsplash.com/photo-1555507036-ab1f40388085?w=150&q=80' },
  { id: 'P06', name: 'Bông Lan Trứng Muối', price: 150000, kitchen: 'pastry', image: 'https://images.unsplash.com/photo-1626388946764-28ccf2e622b7?w=150&q=80' },
  { id: 'P07', name: 'Macaron (Hộp 6)', price: 180000, kitchen: 'pastry', image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=150&q=80' },
];

// Helper to fill legacy fields
const fillLegacy = (order: Partial<Order>) => {
  if (order.items && order.items.length > 0) {
    order.productName = order.items.map(i => i.productName + (i.quantity > 1 ? ` x${i.quantity}` : '')).join(', ');
    order.quantity = order.items.reduce((s, i) => s + i.quantity, 0);
    order.kitchen = order.items[0].kitchen;
  }
  return order as Order;
};

export const MOCK_ORDERS: Order[] = [
  fillLegacy({
    id: 'VANI-001',
    customerName: 'Anh Dũng', // Cleaned name
    customerPhone: '0912345678',
    deliveryMethod: 'delivery',
    deliveryAddress: { street: '654 Điện Biên Phủ', ward: 'Phường 15', district: 'Quận Bình Thạnh' },
    deliveryDate: todayStr,
    deliveryTime: '09:00',
    status: 'in_production',
    collection: 485000,
    deposit: 0,
    totalAmount: 485000,
    createdAt: todayStr,
    paymentHistory: [],
    items: [
      { id: 'i1', productId: 'P01', productName: 'Bánh Kem Dâu Tây', quantity: 1, price: 450000, kitchen: 'cream', note: 'Viết chữ: Happy Birthday Dũng' }
    ],
    notes: 'Viết chữ: Happy Birthday Dũng',
    requiresPhoto: true
  }),
  fillLegacy({
    id: 'VANI-009',
    customerName: 'Chị Hà', // Cleaned name
    customerPhone: '0901239876',
    deliveryMethod: 'delivery',
    deliveryAddress: { street: '12 Nguyễn Thị Minh Khai', ward: 'Phường Đa Kao', district: 'Quận 1' },
    deliveryDate: todayStr,
    deliveryTime: '10:15',
    status: 'in_production',
    collection: 850000,
    deposit: 0,
    totalAmount: 85000,
    createdAt: todayStr,
    paymentHistory: [],
    items: [
       { id: 'i2', productId: 'P02', productName: 'Bánh Mousse Chanh Leo', quantity: 2, price: 425000, kitchen: 'cream' }
    ],
    notes: 'Giao gấp, khách đang chờ',
    requiresPhoto: true
  }),
  fillLegacy({
    id: 'VANI-002',
    customerName: 'Chị Lan',
    customerPhone: '0987654321',
    deliveryMethod: 'pickup',
    deliveryDate: todayStr,
    deliveryTime: '10:00',
    status: 'waiting_delivery',
    collection: 250000,
    deposit: 600000,
    totalAmount: 850000,
    createdAt: todayStr,
    paymentHistory: [
        { id: 'pay1', timestamp: new Date(new Date().getTime() - 86400000).toISOString(), amount: 600000, method: 'transfer', receiver: 'Admin', note: 'Cọc trước' }
    ],
    items: [
        { id: 'i3', productId: 'P03', productName: 'Bánh Su Kem', quantity: 10, price: 85000, kitchen: 'pastry' }
    ]
  }),
  fillLegacy({
    id: 'VANI-003',
    customerName: 'Hoàng Nam',
    customerPhone: '0933445566',
    deliveryMethod: 'delivery',
    deliveryAddress: { street: '123 Lê Lợi', ward: 'Phường Bến Thành', district: 'Quận 1' },
    deliveryDate: todayStr,
    deliveryTime: '11:00',
    status: 'delivering',
    shipperId: 'nam',
    collection: 720000,
    deposit: 0,
    totalAmount: 720000,
    createdAt: todayStr,
    paymentHistory: [],
    items: [
        { id: 'i4', productId: 'P04', productName: 'Bánh Tiramisu', quantity: 1, price: 520000, kitchen: 'cream' }
    ]
  }),
  fillLegacy({
    id: 'VANI-005',
    customerName: 'Minh Thư',
    customerPhone: '0909090909',
    deliveryMethod: 'delivery',
    deliveryAddress: { street: 'Thảo Điền', ward: 'Thảo Điền', district: 'Thủ Đức' },
    deliveryDate: todayStr,
    deliveryTime: '16:00',
    status: 'in_production',
    collection: 350000,
    deposit: 0,
    totalAmount: 350000,
    createdAt: todayStr,
    paymentHistory: [],
    items: [
        { id: 'i5', productId: 'P05', productName: 'Bánh Croissant', quantity: 5, price: 35000, kitchen: 'pastry', note: 'Nướng vỏ giòn' },
        { id: 'i6', productId: 'P06', productName: 'Bông Lan Trứng Muối', quantity: 1, price: 175000, kitchen: 'pastry' }
    ],
    notes: 'Nướng vỏ giòn'
  }),
  fillLegacy({
    id: 'VANI-006',
    customerName: 'Store Stock',
    customerPhone: '-',
    deliveryMethod: 'pickup',
    deliveryDate: todayStr,
    deliveryTime: '08:00',
    status: 'in_production',
    collection: 0,
    deposit: 0,
    totalAmount: 0,
    createdAt: todayStr,
    paymentHistory: [],
    items: [
        { id: 'i7', productId: 'P06', productName: 'Bông Lan Trứng Muối', quantity: 2, price: 150000, kitchen: 'pastry' }
    ],
    isStoreOrder: true,
  }),
  fillLegacy({
    id: 'VANI-007',
    customerName: 'Khách VIP Tuấn',
    customerPhone: '0911223344',
    deliveryMethod: 'delivery',
    deliveryAddress: { street: 'Landmark 81', ward: 'P22', district: 'Bình Thạnh' },
    deliveryDate: tomorrowStr,
    deliveryTime: '10:00',
    status: 'in_production',
    collection: 1500000,
    deposit: 500000,
    totalAmount: 2000000,
    createdAt: todayStr,
    paymentHistory: [
         { id: 'pay2', timestamp: new Date().toISOString(), amount: 500000, method: 'transfer', receiver: 'Admin', note: 'Cọc bánh tầng' }
    ],
    items: [
        { id: 'i8', productId: 'custom', productName: 'Bánh Kem Sinh Nhật 3 Tầng', quantity: 1, price: 2000000, kitchen: 'cream' }
    ],
    notes: 'Size lớn, trang trí hoa tươi',
    requiresPhoto: true
  }),
  fillLegacy({
    id: 'VANI-008',
    customerName: 'Chị Mai',
    customerPhone: '0988776655',
    deliveryMethod: 'pickup',
    deliveryDate: todayStr,
    deliveryTime: '18:00',
    status: 'in_production',
    collection: 600000,
    deposit: 600000,
    totalAmount: 1200000,
    createdAt: todayStr,
    paymentHistory: [
         { id: 'pay3', timestamp: new Date().toISOString(), amount: 600000, method: 'cash', receiver: 'Ngọc Anh', note: 'Tiền mặt tại quầy' }
    ],
    items: [
         { id: 'i9', productId: 'custom', productName: 'Set Bánh Âu Mix', quantity: 1, price: 1200000, kitchen: 'custom' }
    ],
    notes: 'Hộp quà tặng ruy băng đỏ'
  }),
  // DRAFT ORDER
  fillLegacy({
    id: 'DRAFT-001',
    customerName: 'Chị Sương',
    customerPhone: '0909111222',
    deliveryMethod: 'delivery',
    deliveryDate: tomorrowStr,
    deliveryTime: '14:00',
    status: 'draft',
    collection: 0,
    deposit: 0,
    totalAmount: 450000,
    createdAt: todayStr,
    paymentHistory: [],
    items: [
        { id: 'i10', productId: 'P01', productName: 'Bánh Kem Dâu Tây', quantity: 1, price: 450000, kitchen: 'cream' }
    ]
  })
];
