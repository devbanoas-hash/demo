import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Trash2, Edit, Truck, Store, X, ChevronDown,
} from 'lucide-react';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { IOrder } from '@/types/order';
import OrderFormModal from '@/components/orders/OrderFormModal';
import OrderDetailModal from '@/components/orders/OrderDetailModal';
import PaymentModal from '@/components/orders/PaymentModal';
import InvoiceModal from '@/components/orders/InvoiceModal';
import { splitDeliveryDateTime } from '@/lib/utils';
import { useOrders } from '@/hooks/useOrders';
import { createPortal } from 'react-dom';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-area, .print-area * {
      visibility: visible;
    }
    .print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
    /* Invoice A4/A5 Center */
    .invoice-print {
      padding: 20px;
      margin: 0 auto;
      max-width: 800px;
    }
    /* Receipt 80mm */
    .receipt-print {
      width: 80mm;
      padding: 5px;
      font-family: 'Courier New', Courier, monospace;
    }
  }
`;

export default function Orders() {
  // Flow: Page -> Hook -> Service -> API -> Store -> UI
  const { orders, isLoading, create, update, delete: deleteOrder } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Date Range Filter State
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
      start: '', 
      end: ''
  });
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Form Create/Edit
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // View Detail
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // Payment
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false); // Invoice
  
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  
  // Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    orderId: string | null;
    orderName?: string;
  }>({
    open: false,
    orderId: null,
  });

  // Print Refs
  const receiptRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = 
        o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.customer.customer_phone_number.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      
      // Date Range Filter
      let matchDate = true;
      if (dateRange.start) {
        matchDate = matchDate && o.delivery_at >= dateRange.start;
      }
      if (dateRange.end) {
        matchDate = matchDate && o.delivery_at <= dateRange.end;
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, searchTerm, statusFilter, dateRange]);

  // --- Actions ---
  const handleDeleteClick = (order: IOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmation({
      open: true,
      orderId: order.order_id,
      orderName: order.customer.customer_name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.orderId) {
      await deleteOrder(deleteConfirmation.orderId);
      setDeleteConfirmation({
        open: false,
        orderId: null,
      });
    }
  };

  const handleSaveOrder = async (order: IOrder) => {
    if (selectedOrder && isEditModalOpen) {
      // Update existing order
      const result = await update(order.order_id, order);
      if (result.success) {
        setIsEditModalOpen(false);
        setSelectedOrder(null);
      }
    }
    else {
      // Create new order
      const result = await create(order);
      if (result.success) {
        setIsEditModalOpen(false);
        setSelectedOrder(null);
      }
    }
  };

  const handlePaymentSuccess = (updatedOrder: IOrder) => {
     // Update order after payment
     update(updatedOrder.order_id, updatedOrder);
     if (selectedOrder?.order_id === updatedOrder.order_id) {
        setSelectedOrder(updatedOrder); // Update current detailed view
     }
  };

  // Open Handlers
  const openCreateModal = () => {
    setSelectedOrder(null);
    setIsEditModalOpen(true);
  };

  const openEditModal = (order: IOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const openDetailModal = (order: IOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const openInvoiceModal = () => {
    setIsInvoiceModalOpen(true);
  };

  // --- Print Handlers ---
  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const content = receiptRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=400');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Phiếu thu</title>');
        printWindow.document.write('<style>body { font-family: monospace; width: 80mm; margin: 0; padding: 10px; } .text-center { text-align: center; } .font-bold { font-weight: bold; } .text-right { text-align: right; } .border-b { border-bottom: 1px dashed #000; } .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; } .mb-4 { margin-bottom: 1rem; } .text-sm { font-size: 12px; } .text-xs { font-size: 10px; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(content);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handlePrintInvoice = () => {
    if (invoiceRef.current) {
      const printContents = invoiceRef.current.outerHTML;
      const printContainer = document.createElement('div');
      printContainer.className = 'print-area invoice-print';
      printContainer.innerHTML = printContents;
      document.body.appendChild(printContainer);
      window.print();
      document.body.removeChild(printContainer);
    }
  };

  return (
    <div className="space-y-6">
      <style>{printStyles}</style>
      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 w-full">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm theo mã, tên, SĐT..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#B1454A]/20 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
             <div className="flex flex-col">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Từ ngày</label>
                <input 
                   type="date" 
                   className="bg-transparent text-xs font-bold text-slate-700 outline-none w-28"
                   value={dateRange.start}
                   onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
             </div>
             <div className="w-px h-6 bg-slate-200"></div>
             <div className="flex flex-col">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Đến ngày</label>
                <input 
                   type="date" 
                   className="bg-transparent text-xs font-bold text-slate-700 outline-none w-28"
                   value={dateRange.end}
                   onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
             </div>
             {(dateRange.start || dateRange.end) && (
                <button onClick={() => setDateRange({start: '', end: ''})} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                    <X size={14} />
                </button>
             )}
          </div>
          
          {/* Status Filter */}
          <div className="w-48">
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Nháp</option>
                <option value="created">Mới</option>
                <option value="in_production">Đang sản xuất</option>
                <option value="ready">Chờ giao</option>
                <option value="ready_to_deliver">Sẵn sàng giao</option>
                <option value="out_for_delivery">Đang giao</option>
                <option value="delivery_failed">Lỗi giao hàng</option>
                <option value="completed">Hoàn tất</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="bg-[#B1454A] hover:bg-[#8e373b] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#B1454A]/20 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} /> Tạo đơn mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Giao hàng</th>
                <th className="px-6 py-4 text-right">Tổng tiền</th>
                <th className="px-6 py-4 text-right">Còn lại</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => {
                const { day, time } = splitDeliveryDateTime(order.delivery_at);
                return (
                  <tr 
                      key={order.order_id} 
                      onClick={() => openDetailModal(order)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-[#B1454A] transition-colors">{order.order_id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{order.customer.customer_name}</p>
                      <p className="text-slate-500 text-xs">{order.customer.customer_phone_number}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="space-y-1">
                        {order.cake_orders && order.cake_orders.length > 0 ? (
                          order.cake_orders.map((item, idx) => (
                            <p key={idx} className="text-slate-700 truncate" title={item.cake_name}>
                              - {item.cake_name} <span className="text-slate-400">x{item.quantity}</span>
                            </p>
                          ))
                        ) : (
                          <p className="text-slate-500 italic">Chưa có thông tin</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        {order.fulfillment_method === 'home_delivery' ? <Truck size={14} /> : <Store size={14} />}
                        <span>{day} <span className="text-slate-400">|</span> {time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {order.total_amount.toLocaleString()} đ
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#B1454A]">
                      {(order.total_amount - order.deposit_amount).toLocaleString()} đ
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={(e) => openEditModal(order, e)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="Chỉnh sửa">
                          <Edit size={16} />
                        </button>
                        <button onClick={(e) => handleDeleteClick(order, e)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredOrders.length === 0 && (
                 <tr><td colSpan={8} className="text-center py-12 text-slate-400">Không tìm thấy đơn hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Create/Edit Form Modal */}
      {isEditModalOpen && createPortal(
        <OrderFormModal 
          onClose={() => setIsEditModalOpen(false)} 
          initialOrder={selectedOrder} 
          onSave={handleSaveOrder}
          loading={isLoading}
        />, document.body
      )}

      {/* 2. Detail View Modal */}
      {isDetailModalOpen && selectedOrder && createPortal(
          <OrderDetailModal 
            onClose={() => setIsDetailModalOpen(false)}
            order={selectedOrder}
            onPaymentClick={openPaymentModal}
            onInvoiceClick={openInvoiceModal}
          />, document.body
      )}

      {/* 3. Payment Modal */}
      {isPaymentModalOpen && selectedOrder && createPortal(
          <PaymentModal 
            onClose={() => setIsPaymentModalOpen(false)}
            order={selectedOrder}
            onSuccess={handlePaymentSuccess}
            receiptRef={receiptRef}
            onPrintReceipt={handlePrintReceipt}
          />, document.body
      )}

      {/* 4. Invoice Modal */}
      {isInvoiceModalOpen && selectedOrder && createPortal(
        <InvoiceModal 
          onClose={() => setIsInvoiceModalOpen(false)}
          order={selectedOrder}
          invoiceRef={invoiceRef}
          onPrint={handlePrintInvoice}
        />, document.body
      )}

      {/* 5. Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, open }))}
        title="Xác nhận xóa đơn hàng"
        description={
          deleteConfirmation.orderName
            ? `Bạn có chắc chắn muốn xóa đơn hàng ${deleteConfirmation.orderId} của khách hàng ${deleteConfirmation.orderName}? Hành động này không thể hoàn tác.`
            : `Bạn có chắc chắn muốn xóa đơn hàng ${deleteConfirmation.orderId}? Hành động này không thể hoàn tác.`
        }
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
}