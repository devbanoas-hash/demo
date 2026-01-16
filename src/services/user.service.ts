
import { api } from "../config/axios";
import type { IUser } from "../types/user";

const BASE_PATH = "/users";

export async function getAllUser(): Promise<IUser[]> {
    try {
        const response = await api.get(BASE_PATH);
        return response.data?.data || response.data || [];
    }
    catch (error: any) {
        console.error("Get all users error", error);
        throw new Error(error.response?.data?.error || error.message || "Không thể tải danh sách người dùng");
    }
}

export async function getUserById(user_id: string): Promise<{ data?: IUser; error?: string }> {
    try {
        const response = await api.get(`${BASE_PATH}/${user_id}`);
        return response.data;
    }
    catch (error: any) {
        console.error("Get user by id error", error);
        return { error: error.message };
    }
}

export async function login(email: string, password: string): Promise<{ accessToken?: string; error?: string }> {
    try {
        const response = await api.post(`${BASE_PATH}/login`, { email, password });
        
        if (response.data?.success && response.data?.data?.accessToken) {
            return { accessToken: response.data.data.accessToken };
        }
        
        // Nếu có error trong response
        if (response.data?.error) {
            return { error: response.data.error };
        }
        
        return response.data || response;
    }
    catch (error: any) {
        console.error("Login error", error);
        
        // Xử lý error từ axios
        if (error.response) {
            // Server trả về error response
            const errorMessage = error.response.data?.error || error.response.data?.message || "Đăng nhập thất bại";
            console.log("Login error from server", errorMessage);
            return { error: errorMessage };
        }
        else if (error.request) {
            // Request được gửi nhưng không nhận được response
            console.log("Login error: No response from server");
            return { error: "Không thể kết nối đến server" };
        }
        else {
            // Lỗi khi setup request
            console.log("Login error: Request setup failed", error.message);
            return { error: error.message || "Đăng nhập thất bại" };
        }
    }
}