import { useRef } from 'react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Send, Store, Truck } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import logoVani from '@/assets/logo-vani.jpg';

interface DraftInvoiceProps {
  order: Order;
}

export function DraftInvoice({ order }: DraftInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

  const getAddressDisplay = () => {
    if (order.deliveryMethod === 'pickup') return 'Nhận tại cửa hàng';
    if (order.deliveryAddress) {
      const { street, ward, district, city } = order.deliveryAddress;
      return `${street}, ${ward}, ${district}, ${city}`;
    }
    return '';
  };

  const handleDownloadPng = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#fff',
      });
      
      const link = document.createElement('a');
      link.download = `hoa-don-bao-gia-${order.id}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Đã tải hoá đơn báo giá');
    } catch (error) {
      toast.error('Không thể tải hoá đơn');
      console.error('Error downloading invoice:', error);
    }
  };

  const handleSend = () => {
    // TODO: Integrate with messaging service
    alert('Chức năng gửi hoá đơn sẽ được tích hợp sau');
  };

  return (
    <div className="space-y-4">
      {/* Invoice Content */}
      <div ref={invoiceRef} className="bg-cream-light rounded-lg p-6 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <img src={logoVani} alt="Tiệm Bánh Vani" className="w-16 h-16 mx-auto rounded-full object-cover" />
          <h2 className="font-bold text-xl text-primary">TIỆM BÁNH VANI</h2>
          <p className="text-sm font-medium">Hoá đơn báo giá</p>
        </div>

        <Separator />

        {/* Order Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mã đơn:</span>
            <span className="font-medium">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Khách hàng:</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SĐT:</span>
            <span>{order.customerPhone}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Giao hàng:</span>
            <div className="text-right flex items-center gap-2">
              {order.deliveryMethod === 'pickup' ? (
                <Store className="w-4 h-4" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              <span>{order.deliveryMethod === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao đến nhà'}</span>
            </div>
          </div>
          {order.deliveryMethod === 'delivery' && order.deliveryAddress && (
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Địa chỉ:</span>
              <span className="text-right max-w-[60%]">{getAddressDisplay()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ngày giao:</span>
            <span>{order.deliveryDate} - {order.deliveryTime}</span>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          <p className="font-medium text-sm">Sản phẩm:</p>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.productName} x{item.quantity}
                  {item.productType === 'custom' && (
                    <span className="text-xs text-muted-foreground ml-1">(Đặt riêng)</span>
                  )}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tạm tính:</span>
            <span>{formatCurrency(order.items.reduce((sum, i) => sum + i.price * i.quantity, 0))}</span>
          </div>
          {order.deliveryMethod === 'delivery' && order.deliveryFee > 0 && (
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

        <Separator />

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Quý khách cần hoá đơn tài chính,</p>
          <p>vui lòng liên hệ cửa hàng sau khi thanh toán.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 print:hidden">
        <Button variant="outline" className="flex-1" onClick={handleSend}>
          <Send className="w-4 h-4 mr-2" />
          Gửi khách
        </Button>
        <Button className="flex-1" onClick={handleDownloadPng}>
          <Download className="w-4 h-4 mr-2" />
          Tải PNG
        </Button>
      </div>
    </div>
  );
}
