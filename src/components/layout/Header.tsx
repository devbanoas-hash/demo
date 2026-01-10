import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const pageTitles: Record<string, string> = {
  '/': 'Tổng quan',
  '/orders': 'Quản lý đơn hàng',
  '/today': 'Đơn hàng hôm nay',
  '/delivery': 'Quản lý giao hàng',
  '/products': 'Quản lý sản phẩm',
  '/shippers': 'Quản lý Shipper',
  '/users': 'Quản lý người dùng',
};

export function Header() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const title = pageTitles[location.pathname] || 'Tiệm Bánh Vani';

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">
            {currentTime.toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
          <span className="ml-2 font-bold text-foreground">
            {currentTime.toLocaleTimeString('vi-VN')}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>
    </header>
  );
}