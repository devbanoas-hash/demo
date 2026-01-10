import { useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ConfirmOrderDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function ConfirmOrderDialog({ order, open, onClose }: ConfirmOrderDialogProps) {
  const { confirmOrder } = useOrderStore();
  const [prepaidAmount, setPrepaidAmount] = useState(order?.prepaid || 0);

  const handleConfirm = () => {
    if (!order) return;
    
    confirmOrder(order.id, prepaidAmount);
    toast.success('Đã xác nhận đơn hàng. Đơn đã chuyển sang trạng thái MỚI');
    onClose();
  };

  if (!order) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

  const collection = order.totalAmount - prepaidAmount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận đơn hàng</DialogTitle>
          <DialogDescription>
            Khách hàng đã xác nhận đơn hàng. Vui lòng nhập số tiền cọc.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mã đơn:</span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Khách hàng:</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Tổng đơn:</span>
              <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prepaid">Số tiền cọc</Label>
            <Input
              id="prepaid"
              type="number"
              min="0"
              max={order.totalAmount}
              step="1000"
              value={prepaidAmount}
              onChange={(e) => setPrepaidAmount(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex justify-between p-4 bg-primary/10 rounded-lg font-bold">
            <span>Thu khi giao:</span>
            <span className="text-primary">{formatCurrency(Math.max(0, collection))}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleConfirm}>Xác nhận đơn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
