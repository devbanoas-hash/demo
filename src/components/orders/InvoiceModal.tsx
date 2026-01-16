import React, { useState } from "react";
import { X, Truck, Store, Share2, Download, Printer } from "lucide-react";
import { IOrder } from "@/types/order";
import { splitDeliveryDateTime } from "@/lib/utils";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface InvoiceModalProps {
    onClose: () => void;
    order: IOrder;
    invoiceRef: React.RefObject<HTMLDivElement | null>;
    onPrint: () => void;
}


const InvoiceModal = ({ onClose, order, invoiceRef, onPrint }: InvoiceModalProps) => {
    const [isDownloading, setIsDownloading] = useState(false);
    
    // Recalculate totals for invoice
    const itemsTotal = order.cake_orders.reduce((s, i) => s + (i.unit_price * i.quantity), 0) || 0;
    const shipping = order.shipping_fee || 0;
    const total = itemsTotal + shipping;
    const deposit = order.deposit_amount || 0;
    const remaining = total - deposit;
    const { day, time } = splitDeliveryDateTime(order.delivery_at);
    
    // Determine Staff and Date
    const staffName = order.created_by.username || 'Admin'; // Default if not found
    const createdDate = new Date(order.created_at || '').toLocaleString('vi-VN');

    const handleDownloadPNG = async () => {
        if (!invoiceRef.current) {
            toast.error('Không thể tải ảnh');
            return;
        }

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(invoiceRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
            });

            // Create download link
            const link = document.createElement('a');
            link.download = `Hoa-don-${order.order_id}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();

            toast.success('Đã tải ảnh thành công');
        } catch (error) {
            console.error('Error downloading PNG:', error);
            toast.error('Có lỗi xảy ra khi tải ảnh');
        } finally {
            setIsDownloading(false);
        }
    };

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
                                <img src={"logo-vani.jpg"} alt="Logo" loading="lazy" className="w-full h-full rounded-full object-cover" />
                            </div>
                            <h1 className="text-2xl font-black text-[#B1454A] uppercase tracking-wide mb-1">Tiệm Bánh Vani</h1>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hoá đơn báo giá</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">Mã đơn:</span>
                                    <span className="font-bold">{order.order_id}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">Khách hàng:</span>
                                    <span className="font-bold">{order.customer.customer_name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">SĐT:</span>
                                    <span className="font-bold">{order.customer.customer_phone_number}</span>
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
                                        {order.fulfillment_method === 'home_delivery' ? <><Truck size={12}/> Giao đến nhà</> : <><Store size={12}/> Tại quầy</>}
                                    </span>
                                </div>
                                {order.fulfillment_method === 'home_delivery' && order.customer.address && (
                                    <div className="flex justify-between border-b border-slate-100 pb-1">
                                        <span className="text-slate-500 shrink-0 mr-2">Địa chỉ:</span>
                                        <span className="font-bold text-right">
                                            {order.customer.address.street}, {order.customer.address.ward}, {order.customer.address.district}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="text-slate-500">Ngày giao:</span>
                                    <span className="font-bold">{day} - {time}</span>
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
                                    {order.cake_orders.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-3 font-medium text-slate-800">{item.cake_name}</td>
                                            <td className="py-3 text-right text-slate-600">{item.unit_price.toLocaleString()}đ</td>
                                            <td className="py-3 text-right text-slate-600">x{item.quantity}</td>
                                            <td className="py-3 text-right font-bold text-slate-900">{(item.unit_price * item.quantity).toLocaleString()}đ</td>
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
                     {/* <button className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                         <Share2 size={18}/> Gửi khách
                     </button> */}
                     <button 
                         onClick={handleDownloadPNG}
                         disabled={isDownloading}
                         className="flex-1 py-3 rounded-xl bg-[#B1454A] text-white font-bold hover:bg-[#8e373b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                     >
                         <Download size={18}/> {isDownloading ? 'Đang tải...' : 'Tải PNG'}
                     </button>
                     {/* <button onClick={onPrint} className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 flex items-center justify-center gap-2">
                         <Printer size={18}/> In hóa đơn
                     </button> */}
                </div>
            </div>
        </div>
    );
}
 
export default InvoiceModal;