
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Search, Calendar, Filter, FileText, Trash2, Edit, CreditCard, 
  User, MapPin, Truck, Store, X, ChevronDown, Image as ImageIcon, CheckCircle,
  Clock, Package, AlertTriangle, Printer, Download, Share2, History, ArrowRight,
  Minus, ShoppingCart, DollarSign, ImagePlus, Upload, Save, FilePlus
} from 'lucide-react';
import { Order, OrderItem, Product, OrderStatus, PaymentRecord } from '../types';
import { MOCK_ORDERS, MOCK_PRODUCTS } from '../store/mockData';

const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/4279/4279862.png"; 

// --- CSS for Printing ---
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

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
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
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Print Refs
  const receiptRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.customerPhone.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      
      // Date Range Filter
      let matchDate = true;
      if (dateRange.start) {
          matchDate = matchDate && o.deliveryDate >= dateRange.start;
      }
      if (dateRange.end) {
          matchDate = matchDate && o.deliveryDate <= dateRange.end;
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, searchTerm, statusFilter, dateRange]);

  // --- Actions ---

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleSaveOrder = (order: Order) => {
    if (selectedOrder && isEditModalOpen) {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    } else {
      setOrders(prev => [order, ...prev]);
    }
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };

  const handlePaymentSuccess = (updatedOrder: Order) => {
     setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
     if (selectedOrder?.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder); // Update current detailed view
     }
  };

  // Open Handlers
  const openCreateModal = () => {
    setSelectedOrder(null);
    setIsEditModalOpen(true);
  };

  const openEditModal = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const openDetailModal = (order: Order) => {
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
                <option value="new">Mới</option>
                <option value="draft">Nháp</option>
                <option value="in_production">Đang sản xuất</option>
                <option value="delivering">Đang giao</option>
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
              {filteredOrders.map(order => (
                <tr 
                    key={order.id} 
                    onClick={() => openDetailModal(order)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-[#B1454A] transition-colors">{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{order.customerName}</p>
                    <p className="text-slate-500 text-xs">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="space-y-1">
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="text-slate-700 truncate" title={item.productName}>
                          - {item.productName} <span className="text-slate-400">x{item.quantity}</span>
                        </p>
                      ))}
                      {!order.items && <p className="text-slate-500 italic">Chưa có thông tin</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      {order.deliveryMethod === 'delivery' ? <Truck size={14} /> : <Store size={14} />}
                      <span>{order.deliveryDate} <span className="text-slate-400">|</span> {order.deliveryTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {(order.totalAmount || order.collection).toLocaleString()} đ
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#B1454A]">
                    {order.collection.toLocaleString()} đ
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={(e) => openEditModal(order, e)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="Chỉnh sửa">
                        <Edit size={16} />
                      </button>
                      <button onClick={(e) => handleDelete(order.id, e)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                 <tr><td colSpan={8} className="text-center py-12 text-slate-400">Không tìm thấy đơn hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Create/Edit Form Modal */}
      {isEditModalOpen && (
        <OrderFormModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          initialOrder={selectedOrder} 
          onSave={handleSaveOrder} 
        />
      )}

      {/* 2. Detail View Modal */}
      {isDetailModalOpen && selectedOrder && (
          <OrderDetailModal 
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            order={selectedOrder}
            onPaymentClick={openPaymentModal}
            onInvoiceClick={openInvoiceModal}
          />
      )}

      {/* 3. Payment Modal */}
      {isPaymentModalOpen && selectedOrder && (
          <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            order={selectedOrder}
            onSuccess={handlePaymentSuccess}
            receiptRef={receiptRef}
            onPrintReceipt={handlePrintReceipt}
          />
      )}

      {/* 4. Invoice Modal */}
      {isInvoiceModalOpen && selectedOrder && (
          <InvoiceModal 
             isOpen={isInvoiceModalOpen}
             onClose={() => setIsInvoiceModalOpen(false)}
             order={selectedOrder}
             invoiceRef={invoiceRef}
             onPrint={handlePrintInvoice}
          />
      )}

    </div>
  );
};

// --- Sub-Components ---

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    draft: 'bg-slate-100 text-slate-600 border border-slate-200',
    in_production: 'bg-amber-100 text-amber-700',
    ready_to_handover: 'bg-indigo-100 text-indigo-700',
    delivering: 'bg-purple-100 text-purple-700',
    completed: 'bg-emerald-100 text-emerald-700',
    waiting_delivery: 'bg-cyan-100 text-cyan-700',
    issue_needed: 'bg-red-100 text-red-700',
    waiting_processing: 'bg-orange-100 text-orange-700'
  };

  const labels: Record<string, string> = {
    new: 'Mới',
    draft: 'Nháp',
    in_production: 'Đang làm',
    ready_to_handover: 'Đã xong',
    delivering: 'Đang giao',
    completed: 'Hoàn tất',
    waiting_delivery: 'Chờ giao',
    issue_needed: 'Sự cố',
    waiting_processing: 'Chờ xử lý'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {labels[status] || status}
    </span>
  );
};

// --- 1. Order Detail Modal (View Only) ---
const OrderDetailModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    order: Order; 
    onPaymentClick: () => void;
    onInvoiceClick: () => void;
}> = ({ isOpen, onClose, order, onPaymentClick, onInvoiceClick }) => {
    
    const [activeTab, setActiveTab] = useState<'info' | 'payment' | 'history'>('info');

    // Derived totals
    const itemsTotal = order.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0;
    const shipping = order.shippingFee || 0;
    const total = itemsTotal + shipping;
    const deposit = order.deposit || 0;
    const remaining = total - deposit;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng {order.id}</h2>
                        <StatusBadge status={order.status} />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 border-b border-slate-100">
                    <button 
                        onClick={() => setActiveTab('info')}
                        className={`py-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'info' ? 'text-[#B1454A] border-[#B1454A]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        <FileText size={16}/> Thông tin
                    </button>
                    <button 
                         onClick={() => setActiveTab('history')}
                         className={`py-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'history' ? 'text-[#B1454A] border-[#B1454A]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        <History size={16}/> Lịch sử thanh toán
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Column 1: Customer & Delivery */}
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <User size={14}/> Khách hàng
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Tên khách:</span>
                                            <span className="text-sm font-bold text-slate-900">{order.customerName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Số điện thoại:</span>
                                            <span className="text-sm font-bold text-slate-900">{order.customerPhone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Truck size={14}/> Giao hàng
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Hình thức:</span>
                                            <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                                {order.deliveryMethod === 'delivery' ? <><Truck size={14}/> Giao tận nơi</> : <><Store size={14}/> Nhận tại quầy</>}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Thời gian:</span>
                                            <span className="text-sm font-bold text-slate-900">{order.deliveryTime} - {order.deliveryDate}</span>
                                        </div>
                                        {order.deliveryMethod === 'delivery' && (
                                            <div className="pt-2 border-t border-slate-200 mt-2">
                                                <p className="text-xs text-slate-500 mb-1">Địa chỉ:</p>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {order.deliveryAddress?.street}, {order.deliveryAddress?.district}, TP.HCM
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Products & Payment */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Package size={14}/> Sản phẩm
                                    </h3>
                                    <div className="space-y-3">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                <img src={item.image || (item.images && item.images[0]) || "https://placehold.co/50"} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100"/>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.productName}</p>
                                                        <p className="text-sm font-bold text-slate-900">{(item.price * item.quantity).toLocaleString()}đ</p>
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <p className="text-xs text-slate-500">{item.kitchen === 'pastry' ? 'Bếp Âu' : (item.kitchen === 'custom' ? 'Đặt riêng' : 'Bếp Kem')}</p>
                                                        <p className="text-xs font-bold text-slate-500">x{item.quantity}</p>
                                                    </div>
                                                    {item.note && <p className="text-[10px] text-orange-600 mt-1 italic">Note: {item.note}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-[#FFF8F6] p-5 rounded-2xl border border-[#FFE4DE] space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Tạm tính:</span>
                                        <span className="font-medium text-slate-900">{itemsTotal.toLocaleString()}đ</span>
                                    </div>
                                    {shipping > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Phí giao hàng:</span>
                                            <span className="font-medium text-slate-900">{shipping.toLocaleString()}đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base pt-2 border-t border-dashed border-red-200">
                                        <span className="font-bold text-slate-800">Tổng cộng:</span>
                                        <span className="font-black text-[#B1454A]">{total.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-1">
                                        <span className="text-slate-600">Đã thanh toán:</span>
                                        <span className="font-medium text-green-600">{deposit.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex justify-between text-xl pt-2 mt-2 border-t border-red-200">
                                        <span className="font-bold text-slate-800">Còn lại:</span>
                                        <span className="font-black text-[#B1454A]">{remaining.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Lịch sử giao dịch</h3>
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                                {order.paymentHistory && order.paymentHistory.length > 0 ? (
                                    order.paymentHistory.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((pay, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                                                <CheckCircle size={14} className="text-green-600"/>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">Thanh toán lần {order.paymentHistory!.length - idx}</p>
                                                        <p className="text-xs text-slate-500">{new Date(pay.timestamp).toLocaleString('vi-VN')}</p>
                                                    </div>
                                                    <span className="text-[#B1454A] font-bold text-lg">+{pay.amount.toLocaleString()}đ</span>
                                                </div>
                                                <div className="flex gap-4 text-xs text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <CreditCard size={12}/> {pay.method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <User size={12}/> Người thu: {pay.receiver}
                                                    </div>
                                                </div>
                                                {pay.note && (
                                                    <div className="mt-2 text-xs italic text-slate-500 bg-white p-2 rounded border border-slate-100">
                                                        "{pay.note}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400 italic">Chưa có giao dịch nào</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-100 bg-white flex justify-between items-center">
                    <button onClick={onInvoiceClick} className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                        <FileText size={18}/> Hóa đơn báo giá
                    </button>
                    <div className="flex gap-3">
                        {remaining > 0 ? (
                            <button onClick={onPaymentClick} className="px-6 py-2.5 rounded-xl bg-[#B1454A] text-white font-bold hover:bg-[#8e373b] shadow-lg shadow-red-100 flex items-center gap-2 animate-pulse">
                                <CreditCard size={18}/> Thanh toán ({remaining.toLocaleString()}đ)
                            </button>
                        ) : (
                             <button disabled className="px-6 py-2.5 rounded-xl bg-green-100 text-green-700 font-bold flex items-center gap-2 cursor-default">
                                <CheckCircle size={18}/> Đã thanh toán đủ
                            </button>
                        )}
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. Payment Modal & Receipt Logic ---
const PaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    onSuccess: (updatedOrder: Order) => void;
    receiptRef: React.RefObject<HTMLDivElement | null>;
    onPrintReceipt: () => void;
}> = ({ isOpen, onClose, order, onSuccess, receiptRef, onPrintReceipt }) => {
    
    const total = (order.totalAmount || order.collection) + (order.deposit || 0);
    const remaining = order.collection; 
    const [amount, setAmount] = useState<number>(remaining);
    const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
    const [receiver, setReceiver] = useState('Admin');
    const [note, setNote] = useState('');

    const handleSubmit = (print: boolean) => {
        const newDeposit = (order.deposit || 0) + amount;
        const newCollection = Math.max(0, remaining - amount);
        const newPayment: PaymentRecord = {
            id: `pay_${Date.now()}`,
            timestamp: new Date().toISOString(),
            amount: amount,
            method: method,
            receiver: receiver,
            note: note
        };
        const updatedOrder: Order = {
            ...order,
            deposit: newDeposit,
            collection: newCollection,
            paymentRecorded: true,
            paymentHistory: [...(order.paymentHistory || []), newPayment]
        };
        onSuccess(updatedOrder);
        if (print) {
            setTimeout(() => { onPrintReceipt(); onClose(); }, 100);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-[1.5rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-200 overflow-hidden relative">
                 <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CreditCard className="text-[#B1454A]" size={20}/> Ghi nhận thanh toán
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><X size={18}/></button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="bg-[#FFF8F6] p-4 rounded-xl border border-[#FFE4DE] text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-slate-500">Mã đơn:</span> <span className="font-bold text-slate-900">{order.id}</span></div>
                        <div className="flex justify-between pt-2 border-t border-red-100 mt-2">
                            <span className="font-bold text-slate-700">Còn lại:</span> 
                            <span className="font-black text-[#B1454A] text-base">{remaining.toLocaleString()}đ</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Số tiền thanh toán *</label>
                            <input type="number" className="w-full p-3 border-2 border-[#B1454A] rounded-xl font-black text-xl text-slate-900" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Hình thức thanh toán</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-2 ${method === 'cash' ? 'border-[#B1454A] bg-red-50 text-[#B1454A] font-bold shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <input type="radio" className="hidden" checked={method === 'cash'} onChange={() => setMethod('cash')} />
                                    Tiền mặt
                                </label>
                                <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-2 ${method === 'transfer' ? 'border-[#B1454A] bg-red-50 text-[#B1454A] font-bold shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <input type="radio" className="hidden" checked={method === 'transfer'} onChange={() => setMethod('transfer')} />
                                    Chuyển khoản
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Nhân viên ghi nhận *</label>
                            <select 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
                                value={receiver}
                                onChange={(e) => setReceiver(e.target.value)}
                            >
                                <option>Ngọc Anh</option>
                                <option>Admin</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Ghi chú</label>
                             <textarea 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none h-20" 
                                placeholder="Ghi chú thêm (không bắt buộc)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                             />
                        </div>
                        <button onClick={() => handleSubmit(false)} className="w-full py-3 rounded-xl bg-[#B1454A] text-white font-bold">Xác nhận</button>
                    </div>
                </div>
                {/* Hidden Receipt Template */}
                <div style={{ display: 'none' }}><div ref={receiptRef}>Receipt Content</div></div>
            </div>
        </div>
    );
};

// --- 3. Invoice Modal (Quote) ---
const InvoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    invoiceRef: React.RefObject<HTMLDivElement | null>;
    onPrint: () => void;
}> = ({ isOpen, onClose, order, invoiceRef, onPrint }) => {
    
    // Recalculate totals for invoice
    const itemsTotal = order.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0;
    const shipping = order.shippingFee || 0;
    const total = itemsTotal + shipping;
    const deposit = order.deposit || 0;
    const remaining = total - deposit;
    
    // Determine Staff and Date
    const staffName = order.paymentReceiver || 'Admin'; // Default if not found
    const createdDate = new Date(order.createdAt).toLocaleString('vi-VN');

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-[1.5rem] w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center no-print">
                    <h3 className="text-lg font-black text-slate-800">Hoá đơn báo giá</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-100 p-6 custom-scrollbar">
                    {/* Invoice Paper */}
                    <div ref={invoiceRef} className="bg-white p-8 shadow-sm mx-auto max-w-[600px] min-h-[600px] text-slate-900">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover p-1" />
                            </div>
                            <h1 className="text-2xl font-black text-[#B1454A] uppercase tracking-wide mb-1">Tiệm Bánh Vani</h1>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hoá đơn báo giá</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">Mã đơn:</span>
                                    <span className="font-bold">{order.id}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">Khách hàng:</span>
                                    <span className="font-bold">{order.customerName}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">SĐT:</span>
                                    <span className="font-bold">{order.customerPhone}</span>
                                </div>
                                {/* NEW: Staff & Date */}
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">Nhân viên:</span>
                                    <span className="font-bold">{staffName}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">Ngày tạo:</span>
                                    <span className="font-bold text-xs">{createdDate}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">Giao hàng:</span>
                                    <span className="font-bold flex items-center gap-1">
                                        {order.deliveryMethod === 'delivery' ? <><Truck size={12}/> Giao đến nhà</> : <><Store size={12}/> Tại quầy</>}
                                    </span>
                                </div>
                                {order.deliveryMethod === 'delivery' && (
                                    <div className="flex justify-between border-b border-slate-100 pb-1">
                                        <span className="text-slate-500 shrink-0 mr-2">Địa chỉ:</span>
                                        <span className="font-bold text-right truncate">{order.deliveryAddress?.street}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">Ngày giao:</span>
                                    <span className="font-bold">{order.deliveryDate} - {order.deliveryTime}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8">
                            <h3 className="font-bold text-sm text-[#B1454A] mb-2 border-b-2 border-[#B1454A] pb-1 inline-block">Sản phẩm:</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-200">
                                        <th className="text-left py-2 font-medium">Tên bánh</th>
                                        <th className="text-right py-2 font-medium">Đơn giá</th>
                                        <th className="text-right py-2 font-medium w-16">SL</th>
                                        <th className="text-right py-2 font-medium">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {order.items?.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-3 font-medium text-slate-800">{item.productName}</td>
                                            <td className="py-3 text-right text-slate-600">{item.price.toLocaleString()}đ</td>
                                            <td className="py-3 text-right text-slate-600">x{item.quantity}</td>
                                            <td className="py-3 text-right font-bold text-slate-900">{(item.price * item.quantity).toLocaleString()}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        <div className="border-t-2 border-slate-100 pt-4 space-y-2">
                             <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">Tạm tính:</span>
                                <span className="font-bold text-slate-800">{itemsTotal.toLocaleString()}đ</span>
                            </div>
                            {shipping > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Phí giao hàng:</span>
                                    <span className="font-bold text-slate-800">{shipping.toLocaleString()}đ</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg pt-2">
                                <span className="font-black text-slate-800">Tổng cộng:</span>
                                <span className="font-black text-[#B1454A]">{total.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-sm pt-1">
                                <span className="text-slate-500 font-medium">Đã thanh toán:</span>
                                <span className="font-bold text-green-600">{deposit.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-xl pt-4 mt-2 border-t border-dashed border-slate-200">
                                <span className="font-black text-slate-900">Còn lại:</span>
                                <span className="font-black text-[#B1454A]">{remaining.toLocaleString()}đ</span>
                            </div>
                        </div>

                        {/* Footer Msg */}
                        <div className="mt-12 text-center text-[10px] text-slate-400">
                             <p>Quý khách cần hoá đơn tài chính,</p>
                             <p>vui lòng liên hệ cửa hàng sau khi thanh toán.</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex justify-between gap-3 no-print">
                     <button className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                         <Share2 size={18}/> Gửi khách
                     </button>
                     <button className="flex-1 py-3 rounded-xl bg-[#B1454A] text-white font-bold hover:bg-[#8e373b] flex items-center justify-center gap-2">
                         <Download size={18}/> Tải PNG
                     </button>
                     <button onClick={onPrint} className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 flex items-center justify-center gap-2">
                         <Printer size={18}/> In hóa đơn
                     </button>
                </div>
            </div>
        </div>
    );
}

// --- Create/Edit Modal with 2-Column Layout ---
interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrder: Order | null;
  onSave: (order: Order) => void;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({ isOpen, onClose, initialOrder, onSave }) => {
    
    // Initial State
    const [formData, setFormData] = useState<Partial<Order>>(initialOrder || {
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        status: 'new',
        deliveryMethod: 'pickup',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime: '10:00',
        items: [],
        deposit: 0,
        collection: 0,
        shippingFee: 0,
        customerName: '',
        customerPhone: '',
        deliveryAddress: { street: '', ward: '', district: '' },
        paymentReceiver: 'Admin', // Default receiver
        createdAt: new Date().toISOString()
    });

    const [depositMethod, setDepositMethod] = useState<'cash' | 'transfer'>('cash');
    const [depositReceiver, setDepositReceiver] = useState('Admin');

    // Sync local state with initial order for deposit details (if editing)
    useEffect(() => {
        if (initialOrder && initialOrder.paymentHistory && initialOrder.paymentHistory.length > 0) {
            // Very simple assumption: last payment logic or main logic. 
            // Since this is just a quick edit form, we might not deep link everything, 
            // but let's try to set defaults if they exist.
             if (initialOrder.paymentMethod) setDepositMethod(initialOrder.paymentMethod);
             if (initialOrder.paymentReceiver) setDepositReceiver(initialOrder.paymentReceiver);
        }
    }, [initialOrder]);

    // Totals Calculation
    const itemsTotal = formData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const shipping = formData.shippingFee || 0;
    const finalTotal = itemsTotal + shipping;
    const remaining = finalTotal - (formData.deposit || 0);

    // Update derived fields on change
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            totalAmount: finalTotal,
            collection: remaining
        }));
    }, [itemsTotal, shipping, formData.deposit]);

    const handleAddItem = () => {
        const newItem: OrderItem = {
            id: `item-${Date.now()}`,
            productId: '', // Empty initially
            productName: '',
            price: 0,
            quantity: 1,
            kitchen: 'pastry',
            images: [],
            note: ''
        };
        setFormData(prev => ({
            ...prev,
            items: [...(prev.items || []), newItem]
        }));
    };

    const handleProductSelect = (index: number, productId: string) => {
        const newItems = [...(formData.items || [])];
        if (productId === 'custom') {
             newItems[index] = {
                 ...newItems[index],
                 productId: 'custom',
                 productName: 'Bánh đặt riêng',
                 price: 0,
                 kitchen: 'custom',
                 image: '',
                 images: []
             };
        } else {
             const product = MOCK_PRODUCTS.find(p => p.id === productId);
             if (product) {
                 newItems[index] = {
                     ...newItems[index],
                     productId: product.id,
                     productName: product.name,
                     price: product.price,
                     kitchen: product.kitchen,
                     image: product.image,
                     images: []
                 };
             }
        }
        setFormData({ ...formData, items: newItems });
    };

    const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...(formData.items || [])];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleImageUpload = (index: number, files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setFormData(prev => {
                        const items = [...(prev.items || [])];
                        const currentImages = items[index].images || [];
                        items[index] = { ...items[index], images: [...currentImages, reader.result as string] };
                        return { ...prev, items };
                    });
                }
            };
            reader.readAsDataURL(file);
        });
    };
    
    const handleRemoveImage = (itemIndex: number, imgIndex: number) => {
        setFormData(prev => {
            const items = [...(prev.items || [])];
            const currentImages = items[itemIndex].images || [];
            currentImages.splice(imgIndex, 1);
            items[itemIndex] = { ...items[itemIndex], images: currentImages };
            return { ...prev, items };
        });
    }

    const handleSaveAction = (status: OrderStatus) => {
        if (status !== 'draft' && (formData.deposit || 0) === 0) {
            if (!confirm("Tiền cọc đang là 0đ. Bạn có chắc chắn muốn tạo đơn không?")) {
                return;
            }
        }

        // Attach payment info to order
        const orderToSave: Order = {
            ...formData as Order,
            status: status,
            paymentMethod: depositMethod,
            paymentReceiver: depositReceiver,
            // If deposit > 0, we assume a payment happened now (simple logic)
            paymentHistory: (formData.deposit || 0) > 0 && !formData.paymentHistory ? [{
                id: `pay_init_${Date.now()}`,
                timestamp: new Date().toISOString(),
                amount: formData.deposit || 0,
                method: depositMethod,
                receiver: depositReceiver,
                note: 'Cọc đơn hàng mới'
            }] : formData.paymentHistory
        };
        onSave(orderToSave);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                 {/* Header */}
                 <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">{initialOrder ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
                 </div>
                 
                 {/* Body */}
                 <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                        
                        {/* LEFT COLUMN: INFO (Customer & Delivery) - Span 5 */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Customer Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <User size={16} className="text-[#B1454A]"/> Thông tin khách hàng
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tên khách hàng *</label>
                                        <input 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#B1454A]/20 outline-none transition-all"
                                            placeholder="Nhập tên khách..."
                                            value={formData.customerName}
                                            onChange={e => setFormData({...formData, customerName: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Số điện thoại *</label>
                                        <input 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#B1454A]/20 outline-none transition-all"
                                            placeholder="Nhập số điện thoại..."
                                            value={formData.customerPhone}
                                            onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Truck size={16} className="text-[#B1454A]"/> Thông tin giao nhận
                                </h3>
                                <div className="space-y-5">
                                    {/* Method Toggle */}
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        <button 
                                            onClick={() => setFormData({...formData, deliveryMethod: 'pickup'})}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.deliveryMethod === 'pickup' ? 'bg-white text-[#B1454A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <Store size={14}/> Tại quầy
                                        </button>
                                        <button 
                                            onClick={() => setFormData({...formData, deliveryMethod: 'delivery'})}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.deliveryMethod === 'delivery' ? 'bg-white text-[#B1454A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <Truck size={14}/> Giao đi
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Ngày giao</label>
                                            <input 
                                                type="date"
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                                                value={formData.deliveryDate}
                                                onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Giờ giao</label>
                                            <input 
                                                type="time"
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                                                value={formData.deliveryTime}
                                                onChange={e => setFormData({...formData, deliveryTime: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {formData.deliveryMethod === 'delivery' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Địa chỉ giao hàng</label>
                                            <div className="space-y-2">
                                                <input 
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                                    placeholder="Số nhà, tên đường..."
                                                    value={formData.deliveryAddress?.street}
                                                    onChange={e => setFormData({...formData, deliveryAddress: {...formData.deliveryAddress!, street: e.target.value}})}
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                     <input 
                                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                                        placeholder="Phường/Xã..."
                                                        value={formData.deliveryAddress?.ward}
                                                        onChange={e => setFormData({...formData, deliveryAddress: {...formData.deliveryAddress!, ward: e.target.value}})}
                                                    />
                                                    <input 
                                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                                        placeholder="Quận/Huyện..."
                                                        value={formData.deliveryAddress?.district}
                                                        onChange={e => setFormData({...formData, deliveryAddress: {...formData.deliveryAddress!, district: e.target.value}})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                         <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Ghi chú đơn hàng</label>
                                         <textarea 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none h-20"
                                            placeholder="Ghi chú thêm..."
                                            value={formData.notes}
                                            onChange={e => setFormData({...formData, notes: e.target.value})}
                                         />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: PRODUCTS (Cart) - Span 7 */}
                        <div className="lg:col-span-7 flex flex-col h-full gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 overflow-hidden">
                                 {/* Header */}
                                 <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                     <h3 className="font-bold text-slate-700 flex items-center gap-2"><ShoppingCart size={18}/> Danh sách sản phẩm</h3>
                                     <button 
                                        onClick={handleAddItem}
                                        className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-slate-700 flex items-center gap-2 whitespace-nowrap"
                                     >
                                        <Plus size={14}/> Thêm sản phẩm
                                     </button>
                                 </div>

                                 {/* Items List (Table Format) */}
                                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                                     {formData.items?.length === 0 ? (
                                         <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 p-8">
                                             <ShoppingCart size={40} className="opacity-20"/>
                                             <p className="text-sm font-medium">Chưa có sản phẩm nào</p>
                                         </div>
                                     ) : (
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Sản phẩm</th>
                                                    <th className="px-2 py-3 text-right w-24">Đơn giá</th>
                                                    <th className="px-2 py-3 text-center w-28">Số lượng</th>
                                                    <th className="px-2 py-3 text-right w-28">Thành tiền</th>
                                                    <th className="px-2 py-3 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {formData.items?.map((item, idx) => (
                                                    <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${item.kitchen === 'custom' ? 'bg-red-50/30' : ''}`}>
                                                        {/* Product Info Column */}
                                                        <td className="px-4 py-3 align-top w-[40%]">
                                                            <div className="flex flex-col gap-2">
                                                                {/* Product Select */}
                                                                <select 
                                                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-[#B1454A]"
                                                                    value={item.productId || ''}
                                                                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                                                                >
                                                                    <option value="" disabled>-- Chọn sản phẩm --</option>
                                                                    <option value="custom" className="font-bold text-[#B1454A]">+ Bánh đặt riêng</option>
                                                                    <optgroup label="Sản phẩm có sẵn">
                                                                        {MOCK_PRODUCTS.map(p => (
                                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                                        ))}
                                                                    </optgroup>
                                                                </select>

                                                                {/* Extra Details */}
                                                                <div className="flex gap-3">
                                                                     {/* Thumbnail */}
                                                                    {(item.productId) && (
                                                                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden relative group mt-1">
                                                                            <img 
                                                                                src={item.image || (item.images && item.images[0]) || "https://placehold.co/50"} 
                                                                                alt="" 
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                            {item.kitchen === 'custom' && (item.images?.length || 0) > 1 && (
                                                                                <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 font-bold">
                                                                                    +{item.images!.length - 1}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Custom Fields or Note */}
                                                                    <div className="flex-1 min-w-0 space-y-2 mt-1">
                                                                        {item.kitchen === 'custom' ? (
                                                                            <>
                                                                                <input 
                                                                                    className="w-full font-bold text-slate-800 text-sm bg-transparent border-b border-dashed border-slate-300 hover:border-[#B1454A] focus:border-[#B1454A] outline-none py-0.5 placeholder:font-normal"
                                                                                    value={item.productName}
                                                                                    onChange={e => handleUpdateItem(idx, 'productName', e.target.value)}
                                                                                    placeholder="Tên bánh đặt riêng..."
                                                                                />
                                                                                <textarea 
                                                                                    className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 placeholder:text-slate-400 text-slate-700 outline-none focus:border-[#B1454A] resize-none h-14"
                                                                                    placeholder="Mô tả chi tiết (size, cốt bánh, trang trí...)"
                                                                                    value={item.note || ''}
                                                                                    onChange={e => handleUpdateItem(idx, 'note', e.target.value)}
                                                                                />
                                                                                {/* Mini Image Upload for Custom */}
                                                                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                                                                    <label className="w-8 h-8 shrink-0 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 cursor-pointer hover:border-[#B1454A] hover:text-[#B1454A] transition-colors bg-white">
                                                                                        <Plus size={12}/>
                                                                                        <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleImageUpload(idx, e.target.files)} />
                                                                                    </label>
                                                                                    {item.images?.map((img, imgIdx) => (
                                                                                        <div key={imgIdx} className="w-8 h-8 shrink-0 relative rounded overflow-hidden group/img border border-slate-200 cursor-pointer">
                                                                                            <img src={img} className="w-full h-full object-cover"/>
                                                                                            <button 
                                                                                                onClick={() => handleRemoveImage(idx, imgIdx)}
                                                                                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100"
                                                                                            >
                                                                                                <X size={10}/>
                                                                                            </button>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                             item.productId && (
                                                                                <input 
                                                                                    className="w-full text-xs bg-transparent border-b border-dashed border-slate-200 placeholder:text-slate-300 text-slate-600 outline-none focus:border-slate-400 py-0.5"
                                                                                    placeholder="Ghi chú món..."
                                                                                    value={item.note || ''}
                                                                                    onChange={e => handleUpdateItem(idx, 'note', e.target.value)}
                                                                                />
                                                                             )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Price Column */}
                                                        <td className="px-2 py-3 align-top text-right">
                                                             <input 
                                                                type="number"
                                                                className="w-full text-right bg-transparent text-sm font-medium text-slate-700 outline-none border-b border-transparent hover:border-slate-300 focus:border-[#B1454A] p-1"
                                                                value={item.price}
                                                                onChange={e => handleUpdateItem(idx, 'price', Number(e.target.value))}
                                                                disabled={item.kitchen !== 'custom'} // Only edit price for custom
                                                            />
                                                        </td>

                                                        {/* Quantity Column */}
                                                        <td className="px-2 py-3 align-top">
                                                            <div className="flex items-center justify-center border border-slate-200 rounded-lg bg-white h-8 w-24 mx-auto">
                                                                <button 
                                                                    onClick={() => handleUpdateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                                                                    className="w-8 h-full flex items-center justify-center hover:bg-slate-50 text-slate-500"
                                                                ><Minus size={12}/></button>
                                                                <span className="flex-1 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                                                                <button 
                                                                    onClick={() => handleUpdateItem(idx, 'quantity', item.quantity + 1)}
                                                                    className="w-8 h-full flex items-center justify-center hover:bg-slate-50 text-slate-500"
                                                                ><Plus size={12}/></button>
                                                            </div>
                                                        </td>

                                                        {/* Total Column */}
                                                        <td className="px-2 py-3 align-top text-right">
                                                            <span className="text-sm font-bold text-slate-900 block py-1">
                                                                {(item.price * item.quantity).toLocaleString()}
                                                            </span>
                                                        </td>

                                                        {/* Delete Column */}
                                                        <td className="px-2 py-3 align-top text-center">
                                                            <button 
                                                                onClick={() => handleRemoveItem(idx)}
                                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                     )}
                                 </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Tạm tính:</span>
                                    <span className="font-bold text-slate-800">{itemsTotal.toLocaleString()} đ</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Phí giao hàng:</span>
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="number"
                                            className="w-20 text-right bg-slate-50 rounded border border-slate-200 px-1 py-0.5 text-sm font-bold outline-none focus:border-[#B1454A]"
                                            value={formData.shippingFee}
                                            onChange={e => setFormData({...formData, shippingFee: Number(e.target.value)})}
                                        />
                                        <span className="text-slate-400">đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Đã đặt cọc:</span>
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="number"
                                            className="w-24 text-right bg-slate-50 rounded border border-slate-200 px-1 py-0.5 text-sm font-bold text-green-600 outline-none focus:border-green-500"
                                            value={formData.deposit}
                                            onChange={e => setFormData({...formData, deposit: Number(e.target.value)})}
                                        />
                                        <span className="text-slate-400">đ</span>
                                    </div>
                                </div>

                                {/* NEW: Deposit Details */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                     <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Hình thức cọc</label>
                                        <select 
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                                            value={depositMethod}
                                            onChange={(e) => setDepositMethod(e.target.value as any)}
                                        >
                                            <option value="cash">Tiền mặt</option>
                                            <option value="transfer">Chuyển khoản</option>
                                        </select>
                                     </div>
                                     <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nhân viên nhận</label>
                                        <select 
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                                            value={depositReceiver}
                                            onChange={(e) => setDepositReceiver(e.target.value)}
                                        >
                                            <option>Admin</option>
                                            <option>Ngọc Anh</option>
                                            <option>Thu Ngân</option>
                                        </select>
                                     </div>
                                </div>

                                <div className="border-t border-dashed border-slate-200 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-800 uppercase text-xs tracking-wide">Tổng cộng</span>
                                    <span className="font-black text-xl text-[#B1454A]">{finalTotal.toLocaleString()} đ</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-800 uppercase text-xs tracking-wide">Cần thu (COD)</span>
                                    <span className="font-black text-xl text-slate-800">{remaining.toLocaleString()} đ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Footer */}
                 <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3 z-10">
                     <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">Hủy bỏ</button>
                     
                     <button 
                        onClick={() => handleSaveAction('draft')} 
                        className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2"
                     >
                        <FilePlus size={18}/> Lưu nháp
                     </button>
                     
                     <button 
                        onClick={() => handleSaveAction('new')} 
                        className="px-8 py-3 rounded-xl font-bold text-white bg-[#B1454A] hover:bg-[#8e373b] shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center gap-2"
                     >
                        <Save size={18}/> Tạo đơn
                     </button>
                 </div>
            </div>
        </div>
    )
}

export default OrderManagementPage;
