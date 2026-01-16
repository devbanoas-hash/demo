import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { IOrder } from '@/types/order';
import { splitDeliveryDateTime } from '@/lib/utils';

interface LateIndicatorProps {
  order: IOrder;
}

const LateIndicator: React.FC<LateIndicatorProps> = ({ order }) => {
  const isLate = useMemo(() => {
    if (order.status === 'ready' || order.status === 'completed') return false;
    
    const now = new Date();
    const { time } = splitDeliveryDateTime(order.delivery_at);
    
    if (!time) return false;
    
    const [h, m] = time.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(h, m, 0, 0);
    
    return now.getTime() > deadline.getTime();
  }, [order]);

  if (!isLate) return null;

  return (
    <div className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black animate-pulse shadow-lg z-20">
      <AlertCircle size={10} /> TRỄ
    </div>
  );
};

export default LateIndicator;
