import { useState, useEffect, useMemo } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Order, OrderItem, DeliveryMethod, PaymentMethod, ProductType, DeliveryAddress } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Upload, Store, Truck, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cities, districts, wards } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface OrderFormProps {
  order?: Order | null;
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
}

const generateItemId = () => Math.random().toString(36).substr(2, 9);

export function OrderForm({ order, onClose, onOrderCreated }: OrderFormProps) {
  const { products, addOrder, updateOrder, findCustomerByPhone, addCustomer, addOrderToCustomer } = useOrderStore();
  
  const [customerName, setCustomerName] = useState(order?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone || '');
  const [phoneError, setPhoneError] = useState('');
  const [foundCustomer, setFoundCustomer] = useState<string | null>(null);
  
  const [deliveryDate, setDeliveryDate] = useState(order?.deliveryDate || new Date().toISOString().split('T')[0]);
  const [deliveryTime, setDeliveryTime] = useState(order?.deliveryTime || '10:00');
  
  const [items, setItems] = useState<OrderItem[]>(
    order?.items || [{ id: generateItemId(), productType: 'available', productName: '', quantity: 1, price: 0 }]
  );
  
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(order?.deliveryMethod || 'pickup');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(
    order?.deliveryAddress || { street: '', ward: '', district: '', city: 'TP.HCM' }
  );
  const [deliveryFee, setDeliveryFee] = useState(order?.deliveryFee || 0);
  
  const [prepaid, setPrepaid] = useState(order?.prepaid || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(order?.paymentMethod || 'cash');

  // Validate phone number
  const validatePhone = (phone: string) => {
    if (!phone) return '';
    if (!/^0\d{9}$/.test(phone)) {
      return 'Số điện thoại phải có 10 số và bắt đầu bằng 0';
    }
    return '';
  };

  // Search customer by phone
  useEffect(() => {
    if (customerPhone.length === 10) {
      const customer = findCustomerByPhone(customerPhone);
      if (customer) {
        setCustomerName(customer.name);
        setFoundCustomer(customer.id);
        if (customer.addresses.length > 0) {
          setDeliveryAddress(customer.addresses[0]);
        }
      } else {
        setFoundCustomer(null);
      }
    } else {
      setFoundCustomer(null);
    }
  }, [customerPhone, findCustomerByPhone]);

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(numericValue);
    setPhoneError(validatePhone(numericValue));
  };

  // Product items management
  const handleAddItem = () => {
    setItems([...items, { id: generateItemId(), productType: 'available', productName: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemTypeChange = (index: number, type: ProductType) => {
    const newItems = [...items];
    newItems[index] = { 
      ...newItems[index], 
      productType: type,
      productId: undefined,
      productName: '',
      price: 0,
      description: type === 'custom' ? '' : undefined,
      images: type === 'custom' ? [] : undefined,
    };
    setItems(newItems);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        productName: product.name,
        price: product.price,
      };
      setItems(newItems);
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Calculations
  const subtotal = useMemo(() => 
    items.reduce((sum, item) => sum + item.price * item.quantity, 0), 
    [items]
  );
  
  const totalAmount = useMemo(() => 
    subtotal + (deliveryMethod === 'delivery' ? deliveryFee : 0), 
    [subtotal, deliveryFee, deliveryMethod]
  );
  
  const collection = useMemo(() => 
    Math.max(0, totalAmount - prepaid), 
    [totalAmount, prepaid]
  );

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customerPhone || phoneError) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    
    if (!customerName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return;
    }

    const validItems = items.filter(i => i.productName.trim() && i.price > 0);
    if (validItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.street.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    const orderData = {
      customerName,
      customerPhone,
      deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
      deliveryFee: deliveryMethod === 'delivery' ? deliveryFee : 0,
      items: validItems,
      deliveryDate,
      deliveryTime,
      totalAmount,
      prepaid,
      collection,
      paymentMethod,
      status: order?.status || 'draft' as const,
      customerId: foundCustomer || undefined,
    };

    if (order) {
      updateOrder(order.id, orderData);
      toast.success('Đã cập nhật đơn hàng');
      onClose();
    } else {
      // Create new customer if not found
      let customerId = foundCustomer;
      if (!customerId) {
        customerId = addCustomer({
          name: customerName,
          phone: customerPhone,
          addresses: deliveryMethod === 'delivery' ? [deliveryAddress] : [],
        });
      }

      const newOrderId = addOrder({
        ...orderData,
        customerId,
      });
      
      addOrderToCustomer(customerId, newOrderId);
      toast.success('Đã tạo đơn hàng nháp');
      
      if (onOrderCreated) {
        onOrderCreated(newOrderId);
      }
      onClose();
    }
  };

  const availableDistricts = districts[deliveryAddress.city] || [];
  const availableWards = wards[deliveryAddress.district] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* A. Customer Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Thông tin khách hàng</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Số điện thoại *</Label>
            <div className="relative">
              <Input
                id="customerPhone"
                type="tel"
                placeholder="0912345678"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={cn(phoneError && 'border-destructive')}
              />
              {foundCustomer && (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-status-completed" />
              )}
            </div>
            {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
            {foundCustomer && <p className="text-xs text-status-completed">Khách hàng đã tồn tại</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerName">Tên khách hàng *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nhập tên khách hàng"
            />
          </div>
        </div>
      </div>

      {/* B. Delivery Time */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Thời gian giao hàng</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Ngày giao *</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Giờ giao *</Label>
            <Input
              id="deliveryTime"
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* C. Products Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-semibold text-lg">Sản phẩm</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-1" /> Thêm
          </Button>
        </div>
        
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
              {/* Product type selector */}
              <div className="flex gap-2 items-center">
                <Select
                  value={item.productType}
                  onValueChange={(value: ProductType) => handleItemTypeChange(index, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Bánh có sẵn</SelectItem>
                    <SelectItem value="custom">Bánh đặt riêng</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1}
                  className="ml-auto"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              {/* Product row */}
              <div className="grid grid-cols-12 gap-3 items-end">
                {item.productType === 'available' ? (
                  <>
                    <div className="col-span-6 space-y-1">
                      <Label className="text-xs text-muted-foreground">Tên sản phẩm</Label>
                      <Select
                        value={item.productId || ''}
                        onValueChange={(value) => handleProductSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn sản phẩm" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.filter(p => p.active).map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground">Số lượng</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs text-muted-foreground">Thành tiền</Label>
                      <div className="h-10 px-3 py-2 bg-secondary rounded-md font-medium text-right">
                        {formatCurrency(item.price * item.quantity)}đ
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs text-muted-foreground">Tên sản phẩm</Label>
                      <Input
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                        placeholder="Nhập tên bánh đặt riêng"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground">Số lượng</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs text-muted-foreground">Đơn giá</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground">Thành tiền</Label>
                      <div className="h-10 px-3 py-2 bg-secondary rounded-md font-medium text-right text-sm">
                        {formatCurrency(item.price * item.quantity)}đ
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Custom cake additional fields */}
              {item.productType === 'custom' && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Mô tả bánh</Label>
                    <Textarea
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Mô tả chi tiết: màu sắc, chữ viết, hình ảnh..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Hình ảnh đính kèm</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Tải ảnh lên
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Chức năng upload sẽ được kích hoạt khi kết nối backend</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* D. Delivery Method */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Hình thức nhận hàng</h3>
        <RadioGroup
          value={deliveryMethod}
          onValueChange={(value: DeliveryMethod) => setDeliveryMethod(value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
              <Store className="w-5 h-5" />
              Nhận tại cửa hàng
            </Label>
          </div>
          <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
              <Truck className="w-5 h-5" />
              Giao đến nhà
            </Label>
          </div>
        </RadioGroup>

        {deliveryMethod === 'delivery' && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label>Số nhà - Tên đường *</Label>
              <Input
                value={deliveryAddress.street}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                placeholder="Ví dụ: 123 Nguyễn Huệ"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tỉnh / Thành phố</Label>
                <Select
                  value={deliveryAddress.city}
                  onValueChange={(value) => setDeliveryAddress({ ...deliveryAddress, city: value, district: '', ward: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quận</Label>
                <Select
                  value={deliveryAddress.district}
                  onValueChange={(value) => setDeliveryAddress({ ...deliveryAddress, district: value, ward: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quận" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((district) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phường</Label>
                <Select
                  value={deliveryAddress.ward}
                  onValueChange={(value) => setDeliveryAddress({ ...deliveryAddress, ward: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phường" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWards.map((ward) => (
                      <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phí giao hàng / COD</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}
      </div>

      {/* E. Payment */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Thanh toán</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tổng tiền</Label>
            <div className="h-10 px-3 py-2 bg-secondary rounded-md font-bold text-lg">
              {formatCurrency(totalAmount)}đ
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prepaid">Đã cọc</Label>
            <Input
              id="prepaid"
              type="number"
              min="0"
              step="1000"
              value={prepaid}
              onChange={(e) => setPrepaid(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Thu khi giao</Label>
            <div className="h-10 px-3 py-2 bg-primary/10 rounded-md font-bold text-lg text-primary">
              {formatCurrency(collection)}đ
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Hình thức thanh toán</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="cursor-pointer">Tiền mặt</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transfer" id="transfer" />
              <Label htmlFor="transfer" className="cursor-pointer">Chuyển khoản</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit">
          {order ? 'Cập nhật' : 'Tạo đơn nháp'}
        </Button>
      </div>
    </form>
  );
}
