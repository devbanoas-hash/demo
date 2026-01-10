import { useState, useMemo } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { Search, Contact, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { Customer, Order } from '@/types';

export default function Customers() {
  const { customers, orders } = useOrderStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const lower = search.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.phone.includes(search)
    );
  }, [customers, search]);

  const getCustomerOrders = (customerId: string): Order[] => {
    return orders.filter(o => o.customerId === customerId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên hoặc số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contact className="w-5 h-5" />
            Danh sách khách hàng ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khách hàng</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead className="text-center">Số đơn</TableHead>
                <TableHead>Địa chỉ gần nhất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {customer.orderIds.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.addresses[0] ? 
                      `${customer.addresses[0].street}, ${customer.addresses[0].ward}` : 
                      'Chưa có địa chỉ'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Thông tin khách hàng</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-bold text-lg">{selectedCustomer.name}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" /> {selectedCustomer.phone}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Địa chỉ đã dùng
                  </h4>
                  {selectedCustomer.addresses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có địa chỉ</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCustomer.addresses.map((addr, i) => (
                        <div key={i} className="p-3 bg-muted/30 rounded text-sm">
                          {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Lịch sử đơn hàng
                  </h4>
                  {getCustomerOrders(selectedCustomer.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có đơn hàng</p>
                  ) : (
                    <div className="space-y-2">
                      {getCustomerOrders(selectedCustomer.id).map((order) => (
                        <div key={order.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium">{order.id}</span>
                              <StatusBadge status={order.status} className="ml-2" />
                            </div>
                            <span className="text-primary font-medium">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.deliveryDate).toLocaleDateString('vi-VN')} - {order.deliveryTime}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}