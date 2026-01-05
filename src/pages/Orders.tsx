import { useState, useMemo } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { OrderForm } from '@/components/orders/OrderForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Printer } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { toast } from 'sonner';

export default function Orders() {
  const { orders, deleteOrder } = useOrderStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.customerPhone.includes(search);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      deleteOrder(id);
      toast.success('Đã xóa đơn hàng');
    }
  };

  const handlePrint = (order: Order) => {
    // Simple print - opens print dialog
    const printContent = `
      <html>
        <head><title>Hóa đơn ${order.id}</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>TIỆM BÁNH VANI</h1>
          <h2>Hóa đơn: ${order.id}</h2>
          <p><strong>Khách hàng:</strong> ${order.customerName}</p>
          <p><strong>SĐT:</strong> ${order.customerPhone}</p>
          <p><strong>Địa chỉ:</strong> ${order.customerAddress}</p>
          <p><strong>Ngày giao:</strong> ${order.deliveryDate} ${order.deliveryTime}</p>
          <hr/>
          <h3>Sản phẩm:</h3>
          <ul>
            ${order.items.map(i => `<li>${i.productName} x${i.quantity} - ${formatCurrency(i.price * i.quantity)}</li>`).join('')}
          </ul>
          <hr/>
          <p><strong>Tổng:</strong> ${formatCurrency(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}</p>
          <p><strong>Đã cọc:</strong> ${formatCurrency(order.prepaid)}</p>
          <p><strong>Thu khi giao:</strong> ${formatCurrency(order.collection)}</p>
          ${order.notes ? `<p><strong>Ghi chú:</strong> ${order.notes}</p>` : ''}
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingOrder(null);
  };

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm theo mã, tên, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="new">Mới</SelectItem>
              <SelectItem value="ready">Sẵn sàng</SelectItem>
              <SelectItem value="delivering">Đang giao</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo đơn mới
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Ngày giao</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="text-right">Thu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.slice(0, 2).map((item, i) => (
                          <p key={i}>{item.productName} x{item.quantity}</p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-muted-foreground">+{order.items.length - 2} sản phẩm khác</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p>{order.deliveryDate}</p>
                      <p className="text-sm text-muted-foreground">{order.deliveryTime}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.items.reduce((sum, i) => sum + i.price * i.quantity, 0))}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatCurrency(order.collection)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handlePrint(order)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(order)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? `Sửa đơn ${editingOrder.id}` : 'Tạo đơn hàng mới'}
            </DialogTitle>
          </DialogHeader>
          <OrderForm order={editingOrder} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
}