import React, { useState } from "react";
import { X, CreditCard } from "lucide-react";
import { IOrder } from "@/types/order";

interface PaymentModalProps {
    onClose: () => void;
    order: IOrder;
    onSuccess: (updatedOrder: IOrder) => void;
    receiptRef: React.RefObject<HTMLDivElement | null>;
    onPrintReceipt: () => void;
}

const PaymentModal = ({ onClose, order, onSuccess, receiptRef, onPrintReceipt }: PaymentModalProps) => {
    const itemsTotal = order.cake_orders.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) || 0;
    const shipping = order.shipping_fee || 0;
    const total = itemsTotal + shipping;
    const remaining = order.total_amount - order.deposit_amount; 
    const [amount, setAmount] = useState<number>(remaining);
    const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
    const [receiver, setReceiver] = useState('Admin');
    const [note, setNote] = useState('');

    const handleSubmit = (print: boolean) => {
        const newDeposit = (order.deposit_amount || 0) + amount;
        const newCollection = Math.max(0, remaining - amount);
        // const newPayment: PaymentRecord = {
        //     id: `pay_${Date.now()}`,
        //     timestamp: new Date().toISOString(),
        //     amount: amount,
        //     method: method,
        //     receiver: receiver,
        //     note: note
        // };
        // const updatedOrder: IOrder = {
        //     ...order,
        //     deposit_amount: newDeposit,
        //     collection: newCollection,
        //     paymentRecorded: true,
        //     paymentHistory: [...(order.paymentHistory || []), newPayment]
        // };
        // onSuccess(updatedOrder);
        // if (print) {
        //     setTimeout(() => { onPrintReceipt(); onClose(); }, 100);
        // } else {
        //     onClose();
        // }
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
                        <div className="flex justify-between"><span className="text-slate-500">Mã đơn:</span> <span className="font-bold text-slate-900">{order.order_id}</span></div>
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
}
 
export default PaymentModal;