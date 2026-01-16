export type TOrderPaymentMethod = 'cash' | 'bank_transfer';

export const orderPaymentMethodLabels: Record<TOrderPaymentMethod, string> = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
};

export type TOrderFulfillmentMethod = 'store_pickup' | 'home_delivery';

export const orderFulfillmentMethodLabels: Record<TOrderFulfillmentMethod, string> = {
  store_pickup: 'Nhận tại cửa hàng',
  home_delivery: 'Giao tại nhà',
};

export type TOrderStatus = 'draft' | 'created' | 'in_production' | 'ready' | 'ready_to_deliver' | 'out_for_delivery' | 'delivery_failed' | 'completed';

export const orderStatusLabels: Record<TOrderStatus, string> = {
  draft: 'Nháp',
  created: 'Mới',
  in_production: 'Đang sản xuất',
  ready: 'Chờ giao',
  ready_to_deliver: 'Sẵn sàng giao',
  out_for_delivery: 'Đang giao',
  delivery_failed: 'Lỗi giao hàng',
  completed: 'Hoàn thành',
};