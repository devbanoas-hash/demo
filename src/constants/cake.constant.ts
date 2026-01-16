export type TCakeType = 'european' | 'cream_cake';

export const cakeTypeLabels: Record<TCakeType, string> = {
  european: 'Bánh Âu',
  cream_cake: 'Bánh Kem',
};

export type TCakeStatus = 'available' | 'unavailable';

export const cakeStatusLabels: Record<TCakeStatus, string> = {
  available: 'Có sẵn',
  unavailable: 'Hết hàng',
};
