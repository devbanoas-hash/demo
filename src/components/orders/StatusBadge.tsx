import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusLabels: Record<OrderStatus, string> = {
  new: 'Mới',
  ready: 'Sẵn sàng',
  delivering: 'Đang giao',
  completed: 'Hoàn thành',
};

const statusColors: Record<OrderStatus, string> = {
  new: 'status-new',
  ready: 'status-ready',
  delivering: 'status-delivering',
  completed: 'status-completed',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusColors[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}