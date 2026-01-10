import { useMemo, useEffect, useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { Order, OrderItem, ProductCategory, categoryLabels, UserRole } from '@/types';
import { 
  RefreshCw, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Cake, 
  IceCream, 
  ClipboardList,
  Package,
  DollarSign,
  HandMetal,
  Image as ImageIcon,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock current user role - in production this would come from auth
const CURRENT_USER_ROLE: UserRole = 'kitchen_lead'; // Change to 'kitchen_staff' to test view-only mode

export default function Production() {
  const { orders, products, updateOrderStatus } = useOrderStore();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeView, setActiveView] = useState<'banh_au' | 'banh_kem' | 'overview'>('overview');

  const canTakeAction = CURRENT_USER_ROLE === 'kitchen_lead' || CURRENT_USER_ROLE === 'admin';

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDateStr = (date: Date) => date.toISOString().split('T')[0];
  const today = formatDateStr(new Date());
  const tomorrow = formatDateStr(new Date(Date.now() + 86400000));
  const selectedDateStr = formatDateStr(selectedDate);

  // Filter orders for selected date (exclude already handed over for today/tomorrow default view)
  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => o.deliveryDate === selectedDateStr);
    
    // For today & tomorrow, show orders not yet handed over by default
    if (selectedDateStr === today || selectedDateStr === tomorrow) {
      result = result.filter(o => 
        o.status !== 'handed_over' && 
        o.status !== 'delivering' && 
        o.status !== 'completed' &&
        o.status !== 'draft'
      );
    }
    
    return result.sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime));
  }, [orders, selectedDateStr, today, tomorrow, lastRefresh]);

  // All orders for the selected date (for viewing all including completed)
  const allOrdersForDate = useMemo(() => {
    return orders
      .filter(o => o.deliveryDate === selectedDateStr && o.status !== 'draft')
      .sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime));
  }, [orders, selectedDateStr]);

  // Ready orders for handover summary
  const readyOrders = useMemo(() => {
    return orders.filter(o => o.status === 'ready');
  }, [orders]);

  // Summary calculations
  const summary = useMemo(() => {
    // Custom cakes
    const customCakes = filteredOrders.flatMap(o => 
      o.items.filter(item => item.productType === 'custom')
    );
    
    // Group Bánh Âu
    const banhAuMap = new Map<string, number>();
    filteredOrders.forEach(order => {
      order.items
        .filter(item => item.category === 'banh_au' || 
          (item.productType === 'available' && products.find(p => p.id === item.productId)?.category === 'banh_au'))
        .forEach(item => {
          const key = item.productName;
          banhAuMap.set(key, (banhAuMap.get(key) || 0) + item.quantity);
        });
    });

    // Group Bánh Kem
    const banhKemMap = new Map<string, number>();
    filteredOrders.forEach(order => {
      order.items
        .filter(item => item.category === 'banh_kem' || 
          (item.productType === 'available' && products.find(p => p.id === item.productId)?.category === 'banh_kem'))
        .forEach(item => {
          const key = item.productName;
          banhKemMap.set(key, (banhKemMap.get(key) || 0) + item.quantity);
        });
    });

    // Total handover amount (ready orders)
    const totalHandoverAmount = readyOrders.reduce((sum, o) => sum + o.collection, 0);

    return {
      customCakes,
      banhAu: Array.from(banhAuMap.entries()),
      banhKem: Array.from(banhKemMap.entries()),
      totalHandoverAmount,
      readyCount: readyOrders.length,
    };
  }, [filteredOrders, readyOrders, products]);

  // Filter items by category for views
  const getItemsByCategory = (order: Order, category: ProductCategory) => {
    return order.items.filter(item => {
      if (item.category === category) return true;
      if (item.productType === 'available' && item.productId) {
        const product = products.find(p => p.id === item.productId);
        return product?.category === category;
      }
      return false;
    });
  };

  const handleHandover = (orderId: string) => {
    updateOrderStatus(orderId, 'handed_over');
    toast.success('Đã bàn giao đơn hàng');
  };

  // Date navigation
  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = selectedDateStr === today;
  const isTomorrow = selectedDateStr === tomorrow;

  // Get display date label
  const getDateLabel = () => {
    if (isToday) return 'Hôm nay';
    if (isTomorrow) return 'Ngày mai';
    return selectedDate.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with date navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[200px]">
            <h2 className="text-xl font-bold">{getDateLabel()}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
              Về hôm nay
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!canTakeAction && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <EyeOff className="w-4 h-4" />
              Chế độ xem
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
            {lastRefresh.toLocaleTimeString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Cake className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Bánh Âu</p>
                <p className="text-2xl font-bold text-amber-900">
                  {summary.banhAu.reduce((sum, [_, qty]) => sum + qty, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500 rounded-lg">
                <IceCream className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-pink-700">Bánh Kem</p>
                <p className="text-2xl font-bold text-pink-900">
                  {summary.banhKem.reduce((sum, [_, qty]) => sum + qty, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Bánh đặt riêng</p>
                <p className="text-2xl font-bold text-purple-900">{summary.customCakes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Tiền bàn giao ({summary.readyCount} đơn)</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(summary.totalHandoverAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Summary Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Cake className="w-4 h-4 text-amber-600" />
              Chi tiết Bánh Âu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.banhAu.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có bánh Âu</p>
            ) : (
              <div className="space-y-1">
                {summary.banhAu.map(([name, qty]) => (
                  <div key={name} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span>{name}</span>
                    <span className="font-semibold text-amber-700">{qty}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <IceCream className="w-4 h-4 text-pink-600" />
              Chi tiết Bánh Kem
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.banhKem.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có bánh kem</p>
            ) : (
              <div className="space-y-1">
                {summary.banhKem.map(([name, qty]) => (
                  <div key={name} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span>{name}</span>
                    <span className="font-semibold text-pink-700">{qty}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Views */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="banh_au" className="flex items-center gap-2">
            <Cake className="w-4 h-4" />
            Bánh Âu
          </TabsTrigger>
          <TabsTrigger value="banh_kem" className="flex items-center gap-2">
            <IceCream className="w-4 h-4" />
            Bánh Kem
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Tổng quan đơn
          </TabsTrigger>
        </TabsList>

        {/* Bánh Âu View */}
        <TabsContent value="banh_au" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Cake className="w-5 h-5" />
                Khu vực Bánh Âu - {filteredOrders.length} đơn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.banhAu.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Không có sản phẩm Bánh Âu cho ngày này
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {summary.banhAu.map(([name, qty]) => (
                      <div key={name} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-full">
                            <Cake className="w-5 h-5 text-amber-600" />
                          </div>
                          <span className="font-medium">{name}</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-700">{qty}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bánh Kem View */}
        <TabsContent value="banh_kem" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <IceCream className="w-5 h-5" />
                Khu vực Bánh Kem - {filteredOrders.length} đơn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.banhKem.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Không có sản phẩm Bánh Kem cho ngày này
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {summary.banhKem.map(([name, qty]) => (
                      <div key={name} className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-pink-100 rounded-full">
                            <IceCream className="w-5 h-5 text-pink-600" />
                          </div>
                          <span className="font-medium">{name}</span>
                        </div>
                        <div className="text-2xl font-bold text-pink-700">{qty}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview by Order */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4">
            {allOrdersForDate.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Không có đơn hàng cho ngày này
                </CardContent>
              </Card>
            ) : (
              allOrdersForDate.map((order) => {
                const banhAuItems = getItemsByCategory(order, 'banh_au');
                const banhKemItems = getItemsByCategory(order, 'banh_kem');
                const isReady = order.status === 'ready';
                
                return (
                  <Card 
                    key={order.id} 
                    className={cn(
                      'cursor-pointer hover:shadow-md transition-shadow',
                      isReady && 'border-2 border-status-ready'
                    )}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{order.id}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="font-medium">{order.customerName}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {order.deliveryTime}
                          </div>
                        </div>
                        {isReady && canTakeAction && (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHandover(order.id);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <HandMetal className="w-4 h-4 mr-2" />
                            Bàn giao
                          </Button>
                        )}
                        {isReady && !canTakeAction && (
                          <Button variant="outline" disabled>
                            <Eye className="w-4 h-4 mr-2" />
                            Chờ bàn giao
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Bánh Âu */}
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1">
                            <Cake className="w-4 h-4" />
                            Bánh Âu
                          </p>
                          {banhAuItems.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Không có</p>
                          ) : (
                            <ul className="text-sm space-y-1">
                              {banhAuItems.map((item, i) => (
                                <li key={i} className="flex justify-between">
                                  <span className="truncate">{item.productName}</span>
                                  <span className="font-medium ml-2">x{item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Bánh Kem */}
                        <div className="p-3 bg-pink-50 rounded-lg">
                          <p className="text-sm font-medium text-pink-700 mb-2 flex items-center gap-1">
                            <IceCream className="w-4 h-4" />
                            Bánh Kem
                          </p>
                          {banhKemItems.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Không có</p>
                          ) : (
                            <ul className="text-sm space-y-1">
                              {banhKemItems.map((item, i) => (
                                <li key={i} className="flex justify-between">
                                  <span className="truncate">{item.productName}</span>
                                  <span className="font-medium ml-2">x{item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Chi tiết đơn hàng {selectedOrder.id}
                  <StatusBadge status={selectedOrder.status} />
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-lg">{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Clock className="w-4 h-4" />
                    Giao: {selectedOrder.deliveryTime} - {new Date(selectedOrder.deliveryDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Ghi chú đơn hàng
                    </p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Products by Category */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Bánh Âu */}
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-700 mb-3 flex items-center gap-2">
                      <Cake className="w-4 h-4" />
                      Bánh Âu
                    </h4>
                    {getItemsByCategory(selectedOrder, 'banh_au').length === 0 ? (
                      <p className="text-sm text-muted-foreground">Không có sản phẩm</p>
                    ) : (
                      <div className="space-y-2">
                        {getItemsByCategory(selectedOrder, 'banh_au').map((item, i) => (
                          <div key={i} className="text-sm">
                            <div className="flex justify-between font-medium">
                              <span>{item.productName}</span>
                              <span>x{item.quantity}</span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            )}
                            {item.images && item.images.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {item.images.map((img, idx) => (
                                  <div key={idx} className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bánh Kem */}
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <h4 className="font-medium text-pink-700 mb-3 flex items-center gap-2">
                      <IceCream className="w-4 h-4" />
                      Bánh Kem
                    </h4>
                    {getItemsByCategory(selectedOrder, 'banh_kem').length === 0 ? (
                      <p className="text-sm text-muted-foreground">Không có sản phẩm</p>
                    ) : (
                      <div className="space-y-2">
                        {getItemsByCategory(selectedOrder, 'banh_kem').map((item, i) => (
                          <div key={i} className="text-sm">
                            <div className="flex justify-between font-medium">
                              <span>{item.productName}</span>
                              <span>x{item.quantity}</span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            )}
                            {item.images && item.images.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {item.images.map((img, idx) => (
                                  <div key={idx} className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                {selectedOrder.status === 'ready' && canTakeAction && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleHandover(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    <HandMetal className="w-4 h-4 mr-2" />
                    Bàn giao đơn hàng này
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}