import { useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Order, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

interface RecordPaymentDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

// Mock current user - in production this would come from auth context
const CURRENT_USER = { id: 'usr003', name: 'Nguyễn Thị C', role: 'shipper' };

export function RecordPaymentDialog({ order, open, onClose }: RecordPaymentDialogProps) {
  const { addPaymentLog, users, shippers } = useOrderStore();
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [employeeId, setEmployeeId] = useState(
    CURRENT_USER.role === 'shipper' ? CURRENT_USER.id : ''
  );
  const [notes, setNotes] = useState('');

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  // Get all employees (users + shippers)
  const employees = [
    ...users.filter(u => u.active).map(u => ({ id: u.id, name: u.name, type: 'user' })),
    ...shippers.filter(s => s.active).map(s => ({ id: s.id, name: s.name, type: 'shipper' })),
  ];

  const selectedEmployee = employees.find(e => e.id === employeeId);

  const handleSubmit = () => {
    if (!order) return;
    
    const amountNum = parseInt(amount) || 0;
    if (amountNum <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!employeeId) {
      toast.error('Vui lòng chọn nhân viên ghi nhận');
      return;
    }

    addPaymentLog(order.id, {
      amount: amountNum,
      paymentMethod,
      employeeId,
      employeeName: selectedEmployee?.name || '',
      notes: notes.trim() || undefined,
    });

    toast.success('Đã ghi nhận thanh toán');
    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setPaymentMethod('cash');
    setEmployeeId(CURRENT_USER.role === 'shipper' ? CURRENT_USER.id : '');
    setNotes('');
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Ghi nhận thanh toán
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Info */}
          <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
            <p><span className="text-muted-foreground">Mã đơn:</span> <span className="font-medium">{order.id}</span></p>
            <p><span className="text-muted-foreground">Khách hàng:</span> {order.customerName}</p>
            <p><span className="text-muted-foreground">Còn lại:</span> <span className="font-bold text-primary">{formatCurrency(order.collection)}đ</span></p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền thanh toán *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền"
            />
            {order.collection > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setAmount(String(order.collection))}
              >
                Thanh toán toàn bộ ({formatCurrency(order.collection)}đ)
              </Button>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Hình thức thanh toán</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="pay-cash" />
                <Label htmlFor="pay-cash" className="cursor-pointer">Tiền mặt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transfer" id="pay-transfer" />
                <Label htmlFor="pay-transfer" className="cursor-pointer">Chuyển khoản</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Employee */}
          <div className="space-y-2">
            <Label>Nhân viên ghi nhận *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} {emp.type === 'shipper' ? '(Shipper)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm (không bắt buộc)"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
