import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { login as loginService } from '@/services/user.service';
import { toast } from 'sonner';

/**
 * Custom hook for authentication
 * Flow: Hook -> Service -> API -> Store -> UI
 */
export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, logout: logoutStore, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call service
      const result = await loginService(email, password);
      
      if (result.error) {
        toast.error(result.error);
        return { success: false, error: result.error };
      }

      if (result.accessToken) {
        // Update store with auth data
        // Note: In a real app, you'd decode the token or fetch user info
        // For now, we'll use email as username
        setAuth(result.accessToken, email, email.split('@')[0]);
        
        toast.success('Đăng nhập thành công!');
        navigate('/');
        return { success: true };
      }

      toast.error('Đăng nhập thất bại');
      return { success: false, error: 'Không nhận được token' };
    }
    catch (error: any) {
      const errorMessage = error.message || 'Đăng nhập thất bại';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
    finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutStore();
    navigate('/login');
    toast.success('Đã đăng xuất');
  };

  return {
    login,
    logout,
    isAuthenticated,
    isLoading,
  };
}
