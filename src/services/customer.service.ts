import { api } from "../config/axios";
import type { ICustomer } from "../types/customer";

const BASE_PATH = "/customers";

export async function getAllCustomer(): Promise<ICustomer[]> {
  const response = await api.get(BASE_PATH);
  return response.data?.data as ICustomer[];
}

export async function createCustomer(payload: ICustomer): Promise<{ success: boolean, message: string, data: ICustomer }> {
  const response = await api.post(BASE_PATH, payload);
  return response.data as { success: boolean, message: string, data: ICustomer };
}