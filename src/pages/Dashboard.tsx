
import React, { useState, useMemo } from 'react';
import { 
  Package, CheckCircle, Clock, Wallet, 
  CreditCard, User, Phone, 
  TrendingUp, Users, AlertCircle, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { splitDeliveryDateTime } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { orders, shippers } = useAppData();
  const [showExplanation, setShowExplanation] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Tính toán số liệu thực tế từ orders
  const statsData = useMemo(() => {
    const todayOrders = orders.filter(o => {
      const { day } = splitDeliveryDateTime(o.delivery_at);
      return day === todayStr;
    });
    
    // Doanh thu giao hàng (Tổng giá trị đơn có fulfillment_method là home_delivery)
    const deliveryOrders = todayOrders.filter(o => o.fulfillment_method === 'home_delivery');
    const totalOrderValue = deliveryOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
    
    // Phân loại nguồn (Dựa trên cake_orders type)
    const posValue = deliveryOrders.filter(o => 
      o.cake_orders?.some(item => item.type === 'european')
    ).reduce((acc, o) => acc + (o.total_amount || 0), 0) * 0.4;
    const customValue = totalOrderValue - posValue;

    // Các khoản cọc và thực nhận
    const totalDeposit = todayOrders.reduce((acc, o) => acc + (o.deposit_amount || 0), 0);
    
    // Thu từ Quầy (Dựa trên deposit_amount và payment_method)
    // Giả định: deposit_amount là số tiền đã thu tại quầy
    let counterCash = 0;
    let counterTransfer = 0;
    todayOrders.forEach(o => {
      if (o.payment_method === 'cash') {
        counterCash += o.deposit_amount || 0;
      } else if (o.payment_method === 'bank_transfer') {
        counterTransfer += o.deposit_amount || 0;
      }
    });
    const fromCounter = counterCash + counterTransfer;

    // Thu từ Shipper (Đơn ship đã hoàn thành hôm nay)
    // Collection = total_amount - deposit_amount cho các đơn đã hoàn thành
    const fromShipper = deliveryOrders
      .filter(o => o.status === 'completed')
      .reduce((acc, o) => acc + (o.total_amount - o.deposit_amount), 0);

    const totalActualReceived = fromCounter + fromShipper;

    return {
      totalOrders: todayOrders.length,
      completedOrders: todayOrders.filter(o => o.status === 'completed').length,
      lateOrders: todayOrders.filter(o => {
          if (o.status === 'completed') return false;
          const { time } = splitDeliveryDateTime(o.delivery_at);
          if (!time) return false;
          const [h, m] = time.split(':').map(Number);
          const deadline = new Date(); deadline.setHours(h, m, 0, 0);
          return new Date() > deadline;
      }).length,
      issueOrders: todayOrders.filter(o => o.status === 'delivery_failed').length,
      revenue: {
        totalOrderValue,
        posValue,
        customValue,
        totalDeposit,
        fromCounter,
        counterCash,
        counterTransfer,
        fromShipper,
        totalActualReceived,
        shipCOD: deliveryOrders
          .filter(o => o.status !== 'completed')
          .reduce((acc, o) => acc + (o.total_amount - o.deposit_amount), 0)
      }
    };
  }, [orders, todayStr]);

  // Tính toán dữ liệu sản phẩm từ orders hôm nay
  const productChartData = useMemo(() => {
    const productMap = new Map<string, number>();
    const colors = [
      'bg-indigo-400', 'bg-rose-400', 'bg-amber-400', 'bg-teal-400',
      'bg-purple-400', 'bg-orange-400', 'bg-slate-400', 'bg-pink-400',
      'bg-cyan-400', 'bg-emerald-400'
    ];
    
    const todayOrders = orders.filter(o => {
      const { day } = splitDeliveryDateTime(o.delivery_at);
      return day === todayStr;
    });
    
    todayOrders.forEach(order => {
      order.cake_orders?.forEach(item => {
        const currentQty = productMap.get(item.cake_name) || 0;
        productMap.set(item.cake_name, currentQty + (item.quantity || 0));
      });
    });
    
    return Array.from(productMap.entries())
      .map(([name, qty], idx) => ({
        name: name.toUpperCase(),
        qty,
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10); // Top 10 sản phẩm
  }, [orders, todayStr]);

  // Tính tổng số lượng của tất cả sản phẩm (không chỉ top 10) để tính phần trăm chính xác
  const totalQty = useMemo(() => {
    const productMap = new Map<string, number>();
    const todayOrders = orders.filter(o => {
      const { day } = splitDeliveryDateTime(o.delivery_at);
      return day === todayStr;
    });
    
    todayOrders.forEach(order => {
      order.cake_orders?.forEach(item => {
        const currentQty = productMap.get(item.cake_name) || 0;
        productMap.set(item.cake_name, currentQty + (item.quantity || 0));
      });
    });
    
    return Array.from(productMap.values()).reduce((sum, qty) => sum + qty, 0);
  }, [orders, todayStr]);

  const maxQty = Math.max(...productChartData.map(d => d.qty), 1);

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* SECTION 1: TOP SUMMARY STATS - Pastel Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TỔNG SỐ ĐƠN HÔM NAY" value={statsData.totalOrders} color="indigo" icon={<Package size={20}/>} />
        <StatCard label="ĐƠN TRỄ TRONG NGÀY" value={statsData.lateOrders} color="rose" icon={<Clock size={20}/>} />
        <StatCard label="ĐƠN ĐÃ HOÀN THÀNH" value={statsData.completedOrders} color="teal" icon={<CheckCircle size={20}/>} />
        <StatCard label="ĐƠN GẶP VẤN ĐỀ" value={statsData.issueOrders} color="amber" icon={<AlertCircle size={20}/>} />
      </div>

      {/* SECTION 2: REVENUE DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* DOANH THU GIAO HÀNG (LEFT) */}
        <div className="lg:col-span-7 bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                   <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">DOANH THU GIAO HÀNG HÔM NAY</h2>
                   <button 
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-slate-300 hover:text-indigo-400 transition-colors"
                   >
                     <HelpCircle size={14} />
                   </button>
                </div>
                {showExplanation && (
                  <div className="absolute top-6 left-0 z-20 w-64 bg-slate-800 text-white text-[10px] p-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-1">
                    Phân bổ doanh thu từ các đơn hàng Giao tận nơi dự kiến.
                  </div>
                )}
                {/* <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{statsData.revenue.totalOrderValue.toLocaleString()}đ</span>
                </div> */}
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-400 rounded-2xl">
                <TrendingUp size={22} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                <div className="space-y-4">
                  <div className="p-5 bg-indigo-600 rounded-[2rem] shadow-lg shadow-indigo-100 text-white">
                    <p className="text-[10px] font-black uppercase mb-1 tracking-widest opacity-80">Tổng giá trị đơn hàng</p>
                    <p className="text-2xl font-black">{statsData.revenue.totalOrderValue.toLocaleString()}đ</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 transition-all hover:bg-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Từ bánh có sẵn</p>
                      <p className="text-lg font-black text-slate-700">{statsData.revenue.posValue.toLocaleString()}đ</p>
                    </div>
                    <div className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 transition-all hover:bg-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Từ bánh đặt riêng</p>
                      <p className="text-lg font-black text-slate-700">{statsData.revenue.customValue.toLocaleString()}đ</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/50 rounded-[2.5rem] p-7 border border-indigo-100 flex flex-col justify-between shadow-sm">
                   <div className="space-y-4">
                      <div className="flex flex-col gap-1 border-b border-indigo-200/30 pb-4">
                        <span className="text-[11px] font-black uppercase text-indigo-400 tracking-wider">Thực nhận</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-indigo-600">{statsData.revenue.totalActualReceived.toLocaleString()}đ</span>
                        </div>
                        
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 italic">
                                <span>+ Từ Quầy (TM: {statsData.revenue.counterCash.toLocaleString()} | CK: {statsData.revenue.counterTransfer.toLocaleString()}):</span>
                                <span className="font-black text-indigo-500">{statsData.revenue.fromCounter.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 italic">
                                <span>+ Từ Shipper:</span>
                                <span className="font-black text-indigo-500">{statsData.revenue.fromShipper.toLocaleString()}đ</span>
                            </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Đã cọc trước</span>
                        <span className="text-lg font-black text-slate-600">{statsData.revenue.totalDeposit.toLocaleString()}đ</span>
                      </div>
                   </div>
                </div>
            </div>
        </div>

        {/* DOANH THU THỰC NHẬN (RIGHT) */}
        <div className="lg:col-span-5 bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">DOANH THU THỰC CỦA HÔM NAY</h2>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-[#B1454A] tracking-tighter drop-shadow-sm">
                    {statsData.revenue.totalActualReceived.toLocaleString()}
                </span>
                <div className="px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black flex items-center gap-1 border border-rose-100">
                   <ArrowUpRight size={12}/> +8.5%
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-2 italic">* Bao gồm các khoản thu thực tế từ quầy và shipper trong 24h</p>
            </div>

            <div className="space-y-4 mt-8">
                <div className="bg-slate-800 text-white py-4 px-8 rounded-full flex justify-between items-center shadow-lg border border-slate-700">
                   <span className="text-xs font-black uppercase tracking-widest opacity-70 italic">Thực nhận</span>
                   <span className="text-xl font-black">{(statsData.revenue.fromCounter).toLocaleString()}đ</span>
                </div>

                <div className="bg-rose-50/40 p-6 rounded-[2.5rem] border border-rose-100">
                   <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.2em] mb-4">Tiền cọc bánh cho tương lai</p>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Wallet size={10}/> Tiền mặt</p>
                         <p className="text-xl font-black text-slate-700">{statsData.revenue.counterCash.toLocaleString()}đ</p>
                      </div>
                      <div className="border-l border-rose-200/50 pl-6 space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><CreditCard size={10}/> Chuyển khoản</p>
                         <p className="text-xl font-black text-slate-700">{statsData.revenue.counterTransfer.toLocaleString()}đ</p>
                      </div>
                   </div>
                </div>
            </div>
        </div>
      </div>

      {/* SECTION 3: PRODUCT CHART - Pastel Bars */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
              SẢN PHẨM BÁN CHẠY HÔM NAY
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1">Sản phẩm có lượng tiêu thụ cao nhất trong 24h qua</p>
          </div>
        </div>

        <div className="space-y-6">
          {productChartData.map((item, idx) => {
            const percentage = totalQty > 0 ? Math.round((item.qty / totalQty) * 100) : 0;
            const barWidth = maxQty > 0 ? (item.qty / maxQty) * 100 : 0;
            
            return (
              <div key={idx} className="group flex flex-col gap-2">
                <div className="flex justify-between items-end px-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black italic px-2 py-0.5 rounded-md ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      TOP {idx + 1}
                    </span>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-slate-900">{item.qty}</span>
                    <span className="text-[10px] font-bold text-slate-400">/ {percentage}%</span>
                  </div>
                </div>
                
                <div className="h-6 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden relative">
                   <div 
                     className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out shadow-sm relative group-hover:brightness-95`}
                     style={{ width: `${barWidth}%` }}
                   >
                     {/* Glossy overlay effect */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: SHIPPER MONITORING - Muted/Neutral */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-800 text-white rounded-[1.2rem] flex items-center justify-center shadow-lg"><Users size={22}/></div>
             <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">ĐIỀU PHỐI VẬN CHUYỂN</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Trạng thái đội ngũ Shipper nội bộ</p>
             </div>
          </div>
          <div className="flex bg-white p-3 rounded-2xl border border-slate-200 shadow-sm gap-6 px-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-0.5">Tiền bánh đã thu</p>
                <p className="text-sm font-black text-slate-700">
                  {orders
                    .filter(o => {
                      const { day } = splitDeliveryDateTime(o.delivery_at);
                      return day === todayStr && 
                             o.fulfillment_method === 'home_delivery' &&
                             o.status === 'completed';
                    })
                    .reduce((acc, o) => {
                      // Nếu deposit_amount < total_amount thì shipper nhận tiền bánh
                      if ((o.deposit_amount || 0) < o.total_amount) {
                        return acc + (o.total_amount - (o.deposit_amount || 0));
                      }
                      return acc;
                    }, 0)
                    .toLocaleString()}đ
                </p>
             </div>
             <div className="w-px h-8 bg-slate-100"></div>
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-0.5">Phí ship đã nhận</p>
                <p className="text-sm font-black text-rose-400">
                  {orders
                    .filter(o => {
                      const { day } = splitDeliveryDateTime(o.delivery_at);
                      return day === todayStr && 
                             o.fulfillment_method === 'home_delivery' &&
                             o.status === 'completed';
                    })
                    .reduce((acc, o) => {
                      // Nếu deposit_amount < total_amount thì shipper nhận phí ship
                      if ((o.deposit_amount || 0) < o.total_amount) {
                        return acc + (o.shipping_fee || 0);
                      }
                      return acc;
                    }, 0)
                    .toLocaleString()}đ
                </p>
             </div>
             <div className="w-px h-8 bg-slate-100"></div>
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-0.5">Phí ship chưa nhận</p>
                <p className="text-sm font-black text-amber-400">
                  {orders
                    .filter(o => {
                      const { day } = splitDeliveryDateTime(o.delivery_at);
                      return day === todayStr && 
                             o.fulfillment_method === 'home_delivery';
                    })
                    .reduce((acc, o) => {
                      const deposit = o.deposit_amount || 0;
                      const shippingFee = o.shipping_fee || 0;
                      
                      // Nếu đơn chưa hoàn thành: phí ship chưa nhận
                      if (o.status !== 'completed') {
                        return acc + shippingFee;
                      }
                      
                      // Nếu đơn đã hoàn thành nhưng deposit_amount >= total_amount: phí ship chưa nhận
                      if (deposit >= o.total_amount) {
                        return acc + shippingFee;
                      }
                      
                      return acc;
                    }, 0)
                    .toLocaleString()}đ
                </p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {shippers.map((s, idx) => {
             const colors = ['border-indigo-100 bg-indigo-50/20', 'border-rose-100 bg-rose-50/20', 'border-teal-100 bg-teal-50/20'];
             const iconColors = ['text-indigo-400', 'text-rose-400', 'text-teal-400'];
             
             // Tính toán số liệu cho shipper này
             const shipperOrders = orders.filter(o => {
               const { day } = splitDeliveryDateTime(o.delivery_at);
               return day === todayStr && 
                      o.fulfillment_method === 'home_delivery' && 
                      o.shipper?.app_id === s.app_id;
             });
             const completedOrders = shipperOrders.filter(o => o.status === 'completed');
             
             // Tiền bánh đã thu: chỉ tính khi deposit_amount < total_amount
             const codCollected = completedOrders.reduce((acc, o) => {
               if ((o.deposit_amount || 0) < o.total_amount) {
                 return acc + (o.total_amount - (o.deposit_amount || 0));
               }
               return acc;
             }, 0);
             
             // Phí ship đã nhận: chỉ tính khi deposit_amount < total_amount
             const shippingFeeReceived = completedOrders.reduce((acc, o) => {
               if ((o.deposit_amount || 0) < o.total_amount) {
                 return acc + (o.shipping_fee || 0);
               }
               return acc;
             }, 0);
             
             // Phí ship chưa nhận: đơn chưa hoàn thành hoặc đơn đã hoàn thành nhưng deposit_amount >= total_amount
             const shippingFeePending = shipperOrders.reduce((acc, o) => {
               const deposit = o.deposit_amount || 0;
               const shippingFee = o.shipping_fee || 0;
               
               // Đơn chưa hoàn thành
               if (o.status !== 'completed') {
                 return acc + shippingFee;
               }
               
               // Đơn đã hoàn thành nhưng deposit_amount >= total_amount
               if (deposit >= o.total_amount) {
                 return acc + shippingFee;
               }
               
               return acc;
             }, 0);
             
             return (
               <div key={s.app_id} className={`p-6 rounded-[2.5rem] border ${colors[idx % 3]} shadow-sm hover:shadow-xl transition-all group relative overflow-hidden`}>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                          <User size={26} className={iconColors[idx % 3]}/>
                        </div>
                        <div>
                           <h4 className="font-black text-slate-800 text-base">{s.shipper_name}</h4>
                           <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1 uppercase tracking-tight"><Phone size={10}/> {s.shipper_phone_number}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-50">HOÀN TẤT</p>
                        <p className="text-xs font-black text-slate-700 bg-white/80 px-3 py-1 rounded-full shadow-sm">{completedOrders.length}/{shipperOrders.length} ĐƠN</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
                     <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm transition-all hover:bg-white">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider">TIỀN BÁNH ĐÃ THU</p>
                        <p className="text-base font-black text-slate-700">{(codCollected / 1000).toFixed(0)}k</p>
                     </div>
                     <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm transition-all hover:bg-white">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider">PHÍ SHIP ĐÃ NHẬN</p>
                        <p className="text-base font-black text-rose-400">{(shippingFeeReceived / 1000).toFixed(0)}k</p>
                     </div>
                     <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm transition-all hover:bg-white">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider">PHÍ SHIP CHƯA NHẬN</p>
                        <p className="text-base font-black text-amber-400">{(shippingFeePending / 1000).toFixed(0)}k</p>
                     </div>
                  </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: 'indigo' | 'rose' | 'teal' | 'amber' }> = ({ label, value, icon, color }) => {
  const themes = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-500',
    rose: 'bg-rose-50 border-rose-100 text-rose-500',
    teal: 'bg-teal-50 border-teal-100 text-teal-500',
    amber: 'bg-amber-50 border-amber-100 text-amber-500',
  };
  
  return (
    <div className={`p-6 rounded-[2.5rem] border shadow-sm flex items-center gap-5 transition-all hover:shadow-lg hover:-translate-y-1 bg-white border-slate-100`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${themes[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-800 leading-none tracking-tighter">{value}</p>
        <p className="text-[10px] uppercase tracking-[0.1em] font-black text-slate-400 mt-2.5 italic">{label}</p>
      </div>
    </div>
  );
};

export default Dashboard;