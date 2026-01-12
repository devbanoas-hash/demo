import { Order, statusLabels, categoryLabels } from '@/types';
import { useOrderStore } from '@/store/orderStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { Store, Truck, User, Clock, CreditCard, History, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function OrderDetailDialog({ order, open, onClose }: OrderDetailDialogProps) {
  const { shippers } = useOrderStore();
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  
  const formatDateTime = (isoString: string) => {
    try {
      return format(new Date(isoString), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
    } catch {
      return isoString;
    }
  };

  const getAddressDisplay = () => {
    if (!order) return '';
    if (order.deliveryMethod === 'pickup') return 'Nhận tại cửa hàng';
    if (order.deliveryAddress) {
      const { street, ward, district, city } = order.deliveryAddress;
      return `${street}, ${ward}, ${district}, ${city}`;
    }
    return '';
  };

  const getShipperName = () => {
    if (!order?.shipperId) return 'Chưa phân công';
    const shipper = shippers.find(s => s.id === order.shipperId);
    return shipper?.name || 'Không xác định';
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      customerName: 'Tên khách hàng',
      customerPhone: 'Số điện thoại',
      deliveryDate: 'Ngày giao',
      deliveryTime: 'Giờ giao',
      totalAmount: 'Tổng tiền',
      deliveryMethod: 'Hình thức giao',
      status: 'Trạng thái',
    };
    return labels[field] || field;
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết đơn hàng {order.id}</span>
            <StatusBadge status={order.status} />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="gap-2">
              <FileText className="w-4 h-4" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Thanh toán
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Lịch sử
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4 mt-4">
            {/* Order metadata */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span className="font-medium">{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">NV nhận đơn:</span>
                <span className="font-medium">{order.createdByName || 'Không xác định'}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2">
              <h4 className="font-semibold">Khách hàng</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-muted-foreground">Tên:</span> {order.customerName}</p>
                <p><span className="text-muted-foreground">SĐT:</span> {order.customerPhone}</p>
              </div>
            </div>

            <Separator />

            {/* Delivery Info */}
            <div className="space-y-2">
              <h4 className="font-semibold">Giao hàng</h4>
              <div className="flex items-center gap-2 text-sm">
                {order.deliveryMethod === 'pickup' ? (
                  <Store className="w-4 h-4" />
                ) : (
                  <Truck className="w-4 h-4" />
                )}
                <span>{order.deliveryMethod === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao đến nhà'}</span>
              </div>
              {order.deliveryMethod === 'delivery' && (
                <p className="text-sm text-muted-foreground">{getAddressDisplay()}</p>
              )}
              <p className="text-sm">
                <span className="text-muted-foreground">Thời gian:</span> {order.deliveryDate} - {order.deliveryTime}
              </p>
              {order.shipperId && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Shipper:</span> {getShipperName()}
                </p>
              )}
            </div>

            <Separator />

            {/* Products */}
            <div className="space-y-2">
              <h4 className="font-semibold">Sản phẩm</h4>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                    <div>
                      <span>{item.productName} x{item.quantity}</span>
                      {item.productType === 'custom' && (
                        <Badge variant="outline" className="ml-2 text-xs">Đặt riêng</Badge>
                      )}
                      {item.category && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {categoryLabels[item.category]}
                        </Badge>
                      )}
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Payment Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span>{formatCurrency(order.items.reduce((sum, i) => sum + i.price * i.quantity, 0))}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí giao hàng:</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã thanh toán:</span>
                <span>{formatCurrency(order.prepaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Còn lại:</span>
                <span className="text-primary">{formatCurrency(order.collection)}</span>
              </div>
            </div>

            {/* Photo Note */}
            {order.photoNote && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold">Ghi chú chụp ảnh</h4>
                  <p className="text-sm p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    {order.photoNote}
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="payments" className="mt-4">
            {order.paymentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có giao dịch thanh toán nào
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Hình thức</TableHead>
                    <TableHead>Người ghi nhận</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.paymentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell className="font-medium text-primary">{formatCurrency(log.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.employeeName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Edit History Tab */}
          <TabsContent value="history" className="mt-4">
            {order.editLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có lịch sử chỉnh sửa
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trường</TableHead>
                    <TableHead>Giá trị cũ</TableHead>
                    <TableHead>Giá trị mới</TableHead>
                    <TableHead>Người sửa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.editLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>{getFieldLabel(log.field)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.oldValue}</TableCell>
                      <TableCell className="text-sm font-medium">{log.newValue}</TableCell>
                      <TableCell>{log.employeeName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
