import { TOrderStatus } from "@/constants/order.constant";

const orderStatusLabels: Record<TOrderStatus, string> = {
  draft: 'Nháp',
  created: 'Mới',
  in_production: 'Đang sản xuất',
  ready: 'Chờ giao',
  ready_to_deliver: 'Sẵn sàng giao',
  out_for_delivery: 'Đang giao',
  delivery_failed: 'Lỗi giao hàng',
  completed: 'Hoàn thành',
};

export const StatusBadge = ({ status }: { status: TOrderStatus }) => {
  const styles: Record<TOrderStatus, string> = {
    draft: 'bg-slate-100 text-slate-600',
    created: 'bg-indigo-100 text-indigo-700',
    in_production: 'bg-purple-100 text-purple-700',
    ready: 'bg-amber-100 text-amber-700',
    ready_to_deliver: 'bg-green-100 text-green-700',
    out_for_delivery: 'bg-blue-100 text-blue-700',
    delivery_failed: 'bg-red-100 text-red-700',
    completed: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${styles[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
};