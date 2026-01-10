import { useMemo } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ClipboardList, 
  CheckCircle2, 
  Truck, 
  Package, 
  Banknote,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { orders, shippers } = useOrderStore();
  
  const today = new Date().toISOString().split('T')[0];
  
  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => o.deliveryDate === today);
    return {
      newOrders: todayOrders.filter(o => o.status === 'new').length,
      readyOrders: todayOrders.filter(o => o.status === 'ready').length,
      deliveringOrders: todayOrders.filter(o => o.status === 'delivering').length,
      completedOrders: todayOrders.filter(o => o.status === 'completed').length,
      totalCollection: todayOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.collection, 0),
      totalOrders: todayOrders.length,
    };
  }, [orders, today]);

  const recentOrders = useMemo(() => {
    return orders
      .filter(o => o.deliveryDate === today)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [orders, today]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Đơn mới"
          value={stats.newOrders}
          icon={ClipboardList}
          iconClassName="text-status-new"
          description="Chờ chuẩn bị"
        />
        <StatCard
          title="Sẵn sàng"
          value={stats.readyOrders}
          icon={Package}
          iconClassName="text-status-ready"
          description="Chờ giao"
        />
        <StatCard
          title="Đang giao"
          value={stats.deliveringOrders}
          icon={Truck}
          iconClassName="text-status-delivering"
          description="Trên đường"
        />
        <StatCard
          title="Hoàn thành"
          value={stats.completedOrders}
          icon={CheckCircle2}
          iconClassName="text-status-completed"
          description="Đã giao xong"
        />
        <StatCard
          title="Tiền thu"
          value={formatCurrency(stats.totalCollection)}
          icon={Banknote}
          iconClassName="text-primary"
          description="Hôm nay"
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Đơn hàng gần đây hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Chưa có đơn hàng nào hôm nay
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{order.deliveryTime}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(order.items.reduce((sum, i) => sum + i.price * i.quantity, 0))}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipper Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Tình trạng Shipper hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shippers.filter(s => s.active).map((shipper) => {
              const shipperOrders = orders.filter(
                o => o.shipperId === shipper.id && o.deliveryDate === today
              );
              const delivering = shipperOrders.filter(o => o.status === 'delivering').length;
              const completed = shipperOrders.filter(o => o.status === 'completed').length;
              const collected = shipperOrders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + o.collection, 0);

              return (
                <div key={shipper.id} className="p-4 bg-secondary/50 rounded-lg">
                  <p className="font-medium">{shipper.name}</p>
                  <p className="text-sm text-muted-foreground">{shipper.phone}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Đang giao:</span>
                      <span className="font-medium">{delivering}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hoàn thành:</span>
                      <span className="font-medium">{completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiền thu:</span>
                      <span className="font-medium text-primary">{formatCurrency(collected)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}