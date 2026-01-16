import { useState } from "react";
import { X, FileText, History, User, Truck, Store, Package, CheckCircle, CreditCard } from "lucide-react";
import { IOrder, TCustomCakeOrderItem } from "@/types/order";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { splitDeliveryDateTime } from "@/lib/utils";
import ImageZoomModal from "./ImageZoomModal";

interface OrderDetailModalProps {
    onClose: () => void;
    order: IOrder;
    onPaymentClick: () => void;
    onInvoiceClick: () => void;
}

const OrderDetailModal = ({ onClose, order, onPaymentClick, onInvoiceClick }: OrderDetailModalProps) => {
    const [activeTab, setActiveTab] = useState<'info' | 'payment' | 'history'>('info');

    const [zoomedImage, setZoomedImage] = useState<{ itemIndex: number; imageIndex: number } | null>(null);

    // Derived totals
    const itemsTotal = order.cake_orders.reduce((s, i) => s + (i.unit_price * i.quantity), 0) || 0;
    const shipping = order.shipping_fee || 0;
    const total = itemsTotal + shipping;
    const deposit = order.deposit_amount || 0;
    const remaining = total - deposit;
    const { day, time } = splitDeliveryDateTime(order.delivery_at);

    // Image zoom handlers
    const openImageZoom = (itemIndex: number, imageIndex: number) => {
        setZoomedImage({ itemIndex, imageIndex });
    };

    const closeImageZoom = () => {
        setZoomedImage(null);
    };

    const handleNavigateImage = (newIndex: number) => {
        if (!zoomedImage) return;
        setZoomedImage({ ...zoomedImage, imageIndex: newIndex });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng {order.order_id}</h2>
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
                                            <span className="text-sm font-bold text-slate-900">{order.customer.customer_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Số điện thoại:</span>
                                            <span className="text-sm font-bold text-slate-900">{order.customer.customer_phone_number}</span>
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
                                                {order.fulfillment_method === 'home_delivery' ? <><Truck size={14}/> Giao tận nơi</> : <><Store size={14}/> Nhận tại quầy</>}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Thời gian:</span>
                                            <span className="text-sm font-bold text-slate-900">{day} - {time}</span>
                                        </div>
                                        {order.fulfillment_method === 'home_delivery' && order.customer.address && (
                                            <div className="pt-2 border-t border-slate-200 mt-2">
                                                <p className="text-xs text-slate-500 mb-1">Địa chỉ:</p>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {order.customer.address.street}, {order.customer.address.ward}, {order.customer.address.district}
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
                                        {order.cake_orders.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                {/* <img src={item.image || (item.images && item.images[0]) || "https://placehold.co/50"} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100"/> */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.cake_name}</p>
                                                        <p className="text-sm font-bold text-slate-900">{(item.unit_price * item.quantity).toLocaleString()}đ</p>
                                                    </div>
                                                    {/* <div className="flex justify-between mt-1">
                                                        <p className="text-xs text-slate-500">{item.kitchen === 'pastry' ? 'Bếp Âu' : (item.kitchen === 'custom' ? 'Đặt riêng' : 'Bếp Kem')}</p>
                                                        <p className="text-xs font-bold text-slate-500">x{item.quantity}</p>
                                                    </div> */}
                                                    {item.cake_id === 'custom' && 'note' in item && item.note && (
                                                        <p className="text-[10px] text-orange-600 mt-1 italic">Note: {item.note}</p>
                                                    )}
                                                    {'image_upload' in item && Array.isArray(item.image_upload) && item.image_upload.length > 0 && (
                                                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mt-2">
                                                            {item.image_upload.map((imageUrl, imgIdx) => (
                                                                <div key={imgIdx} className="w-8 h-8 shrink-0 relative rounded overflow-hidden group/img border border-slate-200 cursor-pointer">
                                                                    <img 
                                                                        src={imageUrl} 
                                                                        alt={`Ảnh ${imgIdx + 1}`} 
                                                                        className="w-full h-full object-cover"
                                                                        onClick={() => openImageZoom(idx, imgIdx)}
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
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

                    {/* {activeTab === 'history' && (
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
                    )} */}
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

            {/* Image Zoom Modal */}
            {zoomedImage && (() => {
                const { itemIndex, imageIndex } = zoomedImage;
                const currentItem = order.cake_orders[itemIndex] as TCustomCakeOrderItem;
                if (!currentItem || !('image_upload' in currentItem) || !Array.isArray(currentItem.image_upload) || currentItem.image_upload.length === 0) return null;
                
                return (
                    <ImageZoomModal
                        images={currentItem.image_upload}
                        currentIndex={imageIndex}
                        onClose={closeImageZoom}
                        onNavigate={handleNavigateImage}
                    />
                );
            })()}
        </div>
    );
}
 
export default OrderDetailModal;