import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl text-destructive">Không có quyền truy cập</CardTitle>
          <CardDescription className="mt-2">
            Bạn không có quyền truy cập trang này.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.role_name && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Vai trò hiện tại: <span className="font-medium">{user.role_name}</span></p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="w-full">
              Đăng xuất
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
