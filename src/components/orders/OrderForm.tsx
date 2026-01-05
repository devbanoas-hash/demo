import { useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Order, OrderItem, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrderFormProps {
  order?: Order | null;
  onClose: () => void;
}

export function OrderForm({ order, onClose }: OrderFormProps) {
  const { products, addOrder, updateOrder } = useOrderStore();
  
  const [formData, setFormData] = useState({
    customerName: order?.customerName || '',
    customerPhone: order?.customerPhone || '',
    customerAddress: order?.customerAddress || '',
    deliveryDate: order?.deliveryDate || new Date().toISOString().split('T')[0],
    deliveryTime: order?.deliveryTime || '10:00',
    prepaid: order?.prepaid || 0,
    notes: order?.notes || '',
    status: order?.status || 'new' as OrderStatus,
  });

  const [items, setItems] = useState<OrderItem[]>(
    order?.items || [{ productId: '', productName: '', quantity: 1, price: 0 }]
  );

  const handleAddItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        productId: product.id,
        productName: product.name,
        quantity: newItems[index].quantity,
        price: product.price,
      };
      setItems(newItems);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const collection = totalAmount - formData.prepaid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(i => i.productId);
    if (validItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }

    const orderData = {
      ...formData,
      items: validItems,
      collection: Math.max(0, collection),
    };

    if (order) {
      updateOrder(order.id, orderData);
      toast.success('Đã cập nhật đơn hàng');
    } else {
      addOrder(orderData);
      toast.success('Đã tạo đơn hàng mới');
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Tên khách hàng *</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPhone">Số điện thoại *</Label>
          <Input
            id="customerPhone"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerAddress">Địa chỉ giao hàng *</Label>
        <Input
          id="customerAddress"
          value={formData.customerAddress}
          onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
          required
        />
      </div>

      {/* Delivery Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deliveryDate">Ngày giao *</Label>
          <Input
            id="deliveryDate"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryTime">Giờ giao *</Label>
          <Input
            id="deliveryTime"
            type="time"
            value={formData.deliveryTime}
            onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Products */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Sản phẩm *</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-1" /> Thêm
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Select
                value={item.productId}
                onValueChange={(value) => handleItemChange(index, value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {products.filter(p => p.active).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Tổng tiền</Label>
          <div className="h-10 px-3 py-2 bg-secondary rounded-md font-medium">
            {new Intl.NumberFormat('vi-VN').format(totalAmount)}đ
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="prepaid">Đã cọc</Label>
          <Input
            id="prepaid"
            type="number"
            min="0"
            value={formData.prepaid}
            onChange={(e) => setFormData({ ...formData, prepaid: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Thu khi giao</Label>
          <div className="h-10 px-3 py-2 bg-primary/10 rounded-md font-medium text-primary">
            {new Intl.NumberFormat('vi-VN').format(Math.max(0, collection))}đ
          </div>
        </div>
      </div>

      {/* Status (only for editing) */}
      {order && (
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as OrderStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Mới</SelectItem>
              <SelectItem value="ready">Sẵn sàng</SelectItem>
              <SelectItem value="delivering">Đang giao</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Yêu cầu đặc biệt, ghi tên trên bánh..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit">
          {order ? 'Cập nhật' : 'Tạo đơn'}
        </Button>
      </div>
    </form>
  );
}