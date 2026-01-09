import { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  draft: {
    label: 'Nháp',
    className: 'bg-muted text-muted-foreground border-muted-foreground/30',
  },
  new: {
    label: 'Mới',
    className: 'bg-status-new/10 text-status-new border-status-new/30',
  },
  ready: {
    label: 'Sẵn sàng',
    className: 'bg-status-ready/10 text-status-ready border-status-ready/30',
  },
  delivering: {
    label: 'Đang giao',
    className: 'bg-status-delivering/10 text-status-delivering border-status-delivering/30',
  },
  completed: {
    label: 'Hoàn thành',
    className: 'bg-status-completed/10 text-status-completed border-status-completed/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
