import { useAppData } from '@/contexts/AppDataContext';
import { useOrderStore } from '@/store/orderStore';
import { createCake as createCakeService, updateCake as updateCakeService, deleteCake as deleteCakeService } from '@/services/cake.service';
import { ICake } from '@/types';
import { toast } from 'sonner';

/**
 * Custom hook for cakes management
 * Flow: Hook -> Context -> Store -> UI
 * Data is already fetched by AppDataContext on app initialization
 */
export function useCakes() {
  const { cakes, isLoading } = useAppData();
  const { addCake, updateCake, deleteCake: deleteCakeStore, setLoading } = useOrderStore();

  // Create new cake
  const createCake = async (cakeData: ICake) => {
    setLoading('cakes', true);
    try {
      const result = await createCakeService(cakeData);
      if (result.success && result.data) {
        addCake(result.data);
        toast.success(result.message || 'Tạo bánh thành công');
        return { success: true, data: result.data };
      }
      toast.error(result.message || 'Tạo bánh thất bại');
      return { success: false };
    } catch (error: any) {
      toast.error(error.message || 'Tạo bánh thất bại');
      return { success: false };
    } finally {
      setLoading('cakes', false);
    }
  };

  // Update cake
  const updateCakeData = async (cakeId: string, updates: Partial<ICake>) => {
    setLoading('cakes', true);
    try {
      const result = await updateCakeService(cakeId, updates);
      if (result.success && result.data) {
        updateCake(cakeId, result.data);
        toast.success(result.message || 'Cập nhật bánh thành công');
        return { success: true, data: result.data };
      }
      toast.error(result.message || 'Cập nhật bánh thất bại');
      return { success: false };
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật bánh thất bại');
      return { success: false };
    } finally {
      setLoading('cakes', false);
    }
  };

  // Delete cake
  const deleteCake = async (cakeId: string) => {
    setLoading('cakes', true);
    try {
      await deleteCakeService(cakeId);
      deleteCakeStore(cakeId);
      toast.success('Xóa bánh thành công');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Xóa bánh thất bại');
      return { success: false };
    } finally {
      setLoading('cakes', false);
    }
  };

  return {
    cakes,
    isLoading,
    createCake,
    updateCake: updateCakeData,
    deleteCake,
  };
}
