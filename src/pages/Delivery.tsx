import { useMemo, useState, useEffect } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck, CheckCircle2, Package, Banknote, RefreshCw, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/types';

export default function Delivery() {
  const { orders, shippers, assignShipper, updateOrderStatus } = useOrderStore();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const today = new Date().toISOString().split('T')[0];

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  const todayOrders = useMemo(() => {
    return orders.filter(o => o.deliveryDate === today);
  }, [orders, today, lastRefresh]);

  // Only show delivery orders (not pickup)
  const deliveryOrders = todayOrders.filter(o => o.deliveryMethod === 'delivery');
  const readyOrders = deliveryOrders.filter(o => o.status === 'ready');
  const deliveringOrders = deliveryOrders.filter(o => o.status === 'delivering');
  const completedOrders = todayOrders.filter(o => o.status === 'completed');

  const totalCollected = completedOrders.reduce((sum, o) => sum + o.collection, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getAddressDisplay = (order: Order) => {
    if (order.deliveryAddress) {
      return `${order.deliveryAddress.street}, ${order.deliveryAddress.ward}, ${order.deliveryAddress.district}`;
    }
    return '';
  };

  const handleAssignShipper = (orderId: string, shipperId: string) => {
    assignShipper(orderId, shipperId);
    toast.success('Đã phân công shipper');
  };

  const handleComplete = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    toast.success('Đã hoàn thành đơn hàng');
  };

  const getShipperName = (shipperId?: string) => {
    if (!shipperId) return 'Chưa phân công';
    const shipper = shippers.find(s => s.id === shipperId);
    return shipper?.name || 'Không xác định';
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-status-ready" />
              <div>
                <p className="text-2xl font-bold">{readyOrders.length}</p>
                <p className="text-sm text-muted-foreground">Chờ giao</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-status-delivering" />
              <div>
                <p className="text-2xl font-bold">{deliveringOrders.length}</p>
                <p className="text-sm text-muted-foreground">Đang giao</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-status-completed" />
              <div>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
                <p className="text-sm text-muted-foreground">Hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Banknote className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalCollected)}</p>
                <p className="text-sm text-muted-foreground">Đã thu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh indicator */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-4 h-4" />
          Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ready to Deliver */}
        <Card>
          <CardHeader className="bg-status-ready/10">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-5 h-5" />
              Chờ giao ({readyOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {readyOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Không có đơn chờ giao</p>
            ) : (
              readyOrders.map((order) => (
                <div key={order.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{order.id}</span>
                    <span className="text-sm">{order.deliveryTime}</span>
                  </div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  <p className="text-sm text-muted-foreground truncate">{getAddressDisplay(order)}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="font-medium text-primary">{formatCurrency(order.collection)}</span>
                  </div>
                  <div className="mt-2">
                    <Select onValueChange={(value) => handleAssignShipper(order.id, value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn Shipper" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippers.filter(s => s.active).map((shipper) => (
                          <SelectItem key={shipper.id} value={shipper.id}>
                            {shipper.name} - {shipper.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Delivering */}
        <Card>
          <CardHeader className="bg-status-delivering/10">
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="w-5 h-5" />
              Đang giao ({deliveringOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {deliveringOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Không có đơn đang giao</p>
            ) : (
              deliveringOrders.map((order) => (
                <div key={order.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{order.id}</span>
                    <span className="text-sm">{order.deliveryTime}</span>
                  </div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{getAddressDisplay(order)}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Shipper</p>
                      <p className="text-sm font-medium">{getShipperName(order.shipperId)}</p>
                    </div>
                    <span className="font-medium text-primary">{formatCurrency(order.collection)}</span>
                  </div>
                  <Button
                    className="w-full mt-2"
                    size="sm"
                    onClick={() => handleComplete(order.id)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Hoàn thành
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader className="bg-status-completed/10">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="w-5 h-5" />
              Hoàn thành ({completedOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {completedOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Chưa có đơn hoàn thành</p>
            ) : (
              completedOrders.map((order) => (
                <div key={order.id} className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{order.id}</span>
                    <div className="flex items-center gap-2">
                      {order.deliveryMethod === 'pickup' && <Store className="w-4 h-4 text-muted-foreground" />}
                      <StatusBadge status="completed" />
                    </div>
                  </div>
                  <p className="font-medium">{order.customerName}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-sm">{order.deliveryMethod === 'pickup' ? 'Nhận tại cửa hàng' : getShipperName(order.shipperId)}</p>
                    <span className="font-medium text-primary">{formatCurrency(order.collection)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
