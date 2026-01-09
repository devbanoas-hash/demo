import { useMemo, useEffect, useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatus, Order } from '@/types';
import { Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function TodayOrders() {
  const { orders, updateOrderStatus } = useOrderStore();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const today = new Date().toISOString().split('T')[0];

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const todayOrders = useMemo(() => {
    return orders.filter(o => o.deliveryDate === today);
  }, [orders, today, lastRefresh]);

  const groupedOrders = useMemo(() => {
    const groups: Record<OrderStatus, Order[]> = {
      draft: [],
      new: [],
      ready: [],
      delivering: [],
      completed: [],
    };
    todayOrders.forEach(order => {
      groups[order.status].push(order);
    });
    // Sort by delivery time
    Object.keys(groups).forEach(key => {
      groups[key as OrderStatus].sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime));
    });
    return groups;
  }, [todayOrders]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success('Đã cập nhật trạng thái');
  };

  const getAddressDisplay = (order: Order) => {
    if (order.deliveryMethod === 'pickup') return 'Nhận tại cửa hàng';
    if (order.deliveryAddress) {
      return `${order.deliveryAddress.street}, ${order.deliveryAddress.ward}`;
    }
    return '';
  };

  const statusConfig: Record<OrderStatus, { title: string; nextStatus?: OrderStatus; nextLabel?: string; bgClass: string }> = {
    draft: { title: 'Đơn nháp', nextStatus: 'new', nextLabel: 'Xác nhận', bgClass: 'bg-muted/50 border-muted-foreground/30' },
    new: { title: 'Đơn mới', nextStatus: 'ready', nextLabel: 'Sẵn sàng', bgClass: 'bg-status-new/10 border-status-new/30' },
    ready: { title: 'Sẵn sàng giao', bgClass: 'bg-status-ready/10 border-status-ready/30' },
    delivering: { title: 'Đang giao', nextStatus: 'completed', nextLabel: 'Hoàn thành', bgClass: 'bg-status-delivering/10 border-status-delivering/30' },
    completed: { title: 'Đã hoàn thành', bgClass: 'bg-status-completed/10 border-status-completed/30' },
  };

  // Show only active statuses for today view (not draft)
  const activeStatuses: OrderStatus[] = ['new', 'ready', 'delivering', 'completed'];

  return (
    <div className="space-y-4">
      {/* Refresh indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tổng: {todayOrders.length} đơn hàng
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-4 h-4" />
          Tự động làm mới: {lastRefresh.toLocaleTimeString('vi-VN')}
        </div>
      </div>

      {/* Status Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeStatuses.map((status) => (
          <Card key={status} className={`border ${statusConfig[status].bgClass}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                {statusConfig[status].title}
                <span className="text-lg font-bold">{groupedOrders[status].length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
              {groupedOrders[status].length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Không có đơn
                </p>
              ) : (
                groupedOrders[status].map((order) => (
                  <div key={order.id} className="p-3 bg-card rounded-lg shadow-sm border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{order.id}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {order.deliveryTime}
                      </div>
                    </div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground truncate">{getAddressDisplay(order)}</p>
                    <div className="mt-2 text-sm">
                      {order.items.slice(0, 2).map((item, i) => (
                        <p key={i} className="truncate">{item.productName} x{item.quantity}</p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-muted-foreground">+{order.items.length - 2} khác</p>
                      )}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-primary">
                        Thu: {formatCurrency(order.collection)}
                      </span>
                      {statusConfig[status].nextStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(order.id, statusConfig[status].nextStatus!)}
                        >
                          {statusConfig[status].nextLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
