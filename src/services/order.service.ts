import { api } from "../config/axios";
import type { IOrder } from "../types/order";

const BASE_PATH = "/orders";

export async function getAllOrder(): Promise<IOrder[]> {
  try {
    const response = await api.get(BASE_PATH);
    return response.data?.data || response.data || [];
  } catch (error: any) {
    console.error("Get all orders error", error);
    throw new Error(error.response?.data?.error || error.message || "Không thể tải danh sách đơn hàng");
  }
}

export async function createOrder(payload: IOrder): Promise<{ success: boolean, message: string, data: IOrder }> {
  try {
    const response = await api.post(BASE_PATH, payload);
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        message: response.data.message || "Tạo đơn hàng thành công",
        data: response.data.data
      };
    }
    
    // Handle case where response structure is different
    if (response.data?.data) {
      return {
        success: true,
        message: response.data.message || "Tạo đơn hàng thành công",
        data: response.data.data
      };
    }
    
    return {
      success: false,
      message: response.data?.error || response.data?.message || "Tạo đơn hàng thất bại",
      data: payload
    };
  } catch (error: any) {
    console.error("Create order error", error);
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Tạo đơn hàng thất bại";
    throw new Error(errorMessage);
  }
}

export async function updateOrder(order_id: string, payload: Partial<IOrder>): Promise<{ success: boolean, message: string, data: IOrder }> {
  try {
    const response = await api.put(`${BASE_PATH}/${order_id}`, payload);
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        message: response.data.message || "Cập nhật đơn hàng thành công",
        data: response.data.data
      };
    }
    
    // Handle case where response structure is different
    if (response.data?.data) {
      return {
        success: true,
        message: response.data.message || "Cập nhật đơn hàng thành công",
        data: response.data.data
      };
    }
    
    return {
      success: false,
      message: response.data?.error || response.data?.message || "Cập nhật đơn hàng thất bại",
      data: payload as IOrder
    };
  } catch (error: any) {
    console.error("Update order error", error);
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Cập nhật đơn hàng thất bại";
    throw new Error(errorMessage);
  }
}

export async function deleteOrder(order_id: string): Promise<{ deletedId: string }> {
  try {
    await api.delete(`${BASE_PATH}/${order_id}`);
    return { deletedId: order_id };
  } catch (error: any) {
    console.error("Delete order error", error);
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Xóa đơn hàng thất bại";
    throw new Error(errorMessage);
  }
}