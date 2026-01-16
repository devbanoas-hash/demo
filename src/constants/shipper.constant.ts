export type TShipperStatus = 'free' | 'delivering' | 'busy' | 'offline';

export const shipperStatusLabels: Record<TShipperStatus, string> = {
    free: 'Tự do',
    delivering: 'Đang giao hàng',
    busy: 'Bận',
    offline: 'Offline',
};