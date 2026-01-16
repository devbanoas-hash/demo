import { useMemo } from 'react';
import { IOrder } from '@/types/order';
import { IShipper } from '@/types/shipper';
import { splitDeliveryDateTime } from '@/lib/utils';
import MiniOrderCard from './MiniOrderCard';

interface ScheduleViewProps {
    orders: IOrder[];
    shippers: IShipper[];
    hourSlots: string[];
    onUpdate: any;
    // onZalo: any;
    onIssue: (id: string) => void;
    onProcess: (id: string) => void;
    visibleShipperIds: string[];
}
const ScheduleView = ({ orders, shippers, hourSlots, onUpdate, onIssue, onProcess, visibleShipperIds }: ScheduleViewProps) => {
    // Construct Columns
  const baseColumns = useMemo(() => [
    { id: 'time', label: 'Thời gian', width: 'w-24' },
    { id: 'unassigned', label: 'Đơn cần giao', width: 'flex-1 min-w-[300px]' },
  ], []);
  
  const shipperColumns = useMemo(() => {
    // Only create columns for shippers that are in visibleShipperIds
    const columns: Array<{ id: string; name: string; label: string; width: string }> = [];
    
    // Add external column if visible
    if (visibleShipperIds.includes('external')) {
      columns.push({ id: 'external', name: 'Ship Ngoài', label: 'Ship Ngoài', width: 'w-1/6 min-w-[200px]' });
    }
    
    // Add internal shipper columns if visible (match by shipper_name)
    shippers.forEach(s => {
      if (visibleShipperIds.includes(s.shipper_name)) {
        columns.push({ 
          id: s.app_id, 
          name: s.shipper_name, 
          label: `Shipper ${s.shipper_name}`, 
          width: 'w-1/6 min-w-[200px]' 
        });
      }
    });
    
    return columns;
  }, [shippers, visibleShipperIds]);

  const columns = useMemo(() => [...baseColumns, ...shipperColumns], [baseColumns, shipperColumns]);

  const getOrdersByCol = (hour: string, colId: string) => {
    return orders.filter(o => {
      const { time } = splitDeliveryDateTime(o.delivery_at);
      const matchTime = time.startsWith(hour.split(':')[0]);
      if (!matchTime) return false;
      
      // Unassigned column: orders chưa được assign cho shipper nào
      if (colId === 'unassigned') {
        // Orders với status ready hoặc ready_to_deliver và chưa có shipper (hoặc shipper null/empty)
        const hasShipper = o.shipper && o.shipper.shipper_phone_number;
        return (o.status === 'ready' || o.status === 'ready_to_deliver' || o.status === 'in_production') && !hasShipper;
      }
      
      // Shipper columns: orders đã được assign cho shipper này
      // Kiểm tra nếu order có shipper và shipper_phone_number match với colId
      if (o.shipper && o.shipper.shipper_phone_number) {
        // Tìm shipper trong danh sách để lấy app_id
        const assignedShipper = shippers.find(s => s.shipper_phone_number === o.shipper.shipper_phone_number);
        if (assignedShipper && assignedShipper.app_id === colId) {
          return true;
        }
        // Kiểm tra external shipper
        if (colId === 'external' && o.shipper.app_id === 'external_ship') {
          return true;
        }
      }
      
      return false;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative">
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[1200px] relative">
          {/* Header Row - STICKY TOP */}
          <div className="flex bg-slate-50 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            {columns.map((col, idx) => (
              <div 
                key={col.id} 
                className={`${col.width} p-4 text-center border-r border-slate-200 last:border-0 relative group 
                  ${idx === 0 ? 'sticky left-0 z-50 bg-slate-50 border-r-2 border-r-slate-200/50' : ''}`}
              >
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{col.label}</span>
              </div>
            ))}
          </div>

          {/* Data Rows */}
          <div className="divide-y divide-slate-100">
            {hourSlots.map(hour => (
              <div key={hour} className="flex min-h-[120px] hover:bg-slate-50/40 transition-colors group/row">
                
                {/* Time Slot Column - STICKY LEFT */}
                <div className="w-24 p-4 flex flex-col items-center justify-center border-r border-slate-200 bg-white sticky left-0 z-30 group-hover/row:bg-slate-50 transition-colors">
                  <span className="text-xl font-black text-slate-900">{hour.split(':')[0]}h</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Slot</span>
                </div>
                
                {columns.slice(1).map(col => {
                  const colOrders = getOrdersByCol(hour, col.id);
                  return (
                    <div key={col.id} className={`${col.width} p-3 border-r border-slate-200 last:border-0 space-y-3`}>
                      {colOrders.map(o => (
                        <MiniOrderCard 
                          key={o.order_id} 
                          order={o} 
                          shippers={shippers}
                          onUpdate={onUpdate} 
                          // onZalo={onZalo} 
                          onIssue={onIssue}
                          onProcess={onProcess}
                          isUnassigned={col.id === 'unassigned'} 
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default ScheduleView;