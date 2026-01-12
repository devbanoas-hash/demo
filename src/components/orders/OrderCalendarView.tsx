import { useMemo, useState } from 'react';
import { Order, OrderStatus, statusLabels } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderCalendarViewProps {
  orders: Order[];
  onEditOrder: (order: Order) => void;
}

export function OrderCalendarView({ orders, onEditOrder }: OrderCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [currentDate]);

  const ordersByDate = useMemo(() => {
    const map: Record<string, Order[]> = {};
    orders.forEach(order => {
      if (!map[order.deliveryDate]) {
        map[order.deliveryDate] = [];
      }
      map[order.deliveryDate].push(order);
    });
    // Sort orders by time
    Object.keys(map).forEach(date => {
      map[date].sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime));
    });
    return map;
  }, [orders]);

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();
  const isToday = (date: Date) => formatDate(date) === formatDate(new Date());

  const statusColors: Record<OrderStatus, string> = {
    draft: 'bg-muted',
    new: 'bg-status-new',
    pending: 'bg-amber-500',
    ready: 'bg-status-ready',
    handed_over: 'bg-purple-500',
    delivering: 'bg-status-delivering',
    completed: 'bg-status-completed',
  };

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-lg">
            {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date, i) => {
            const dateStr = formatDate(date);
            const dayOrders = ordersByDate[dateStr] || [];
            
            return (
              <div
                key={i}
                className={cn(
                  'min-h-24 p-1 border rounded-lg transition-colors',
                  isCurrentMonth(date) ? 'bg-card' : 'bg-muted/30',
                  isToday(date) && 'border-primary border-2'
                )}
              >
                <div className={cn(
                  'text-sm font-medium mb-1 text-center',
                  !isCurrentMonth(date) && 'text-muted-foreground'
                )}>
                  {date.getDate()}
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {dayOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onEditOrder(order)}
                      className={cn(
                        'text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity',
                        statusColors[order.status],
                        order.status !== 'completed' && order.status !== 'draft' && 'text-white'
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{order.deliveryTime}</span>
                      </div>
                      <p className="truncate font-medium">{order.customerName}</p>
                    </div>
                  ))}
                  {dayOrders.length > 3 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{dayOrders.length - 3} đơn khác
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t justify-center">
          {(['draft', 'new', 'pending', 'ready', 'handed_over', 'delivering', 'completed'] as OrderStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded', statusColors[status])} />
              <Badge variant="outline" className="text-xs">{statusLabels[status]}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
