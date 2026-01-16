import { api } from "../config/axios";
import type { ICake } from "../types/cake";

const BASE_PATH = "/cakes";

export async function getAllCake(): Promise<ICake[]> {
  const response = await api.get(BASE_PATH);
  return response.data?.data as ICake[];
}

export async function createCake(payload: ICake): Promise<{ success: boolean, message: string, data: ICake }> {
  const response = await api.post(BASE_PATH, payload);
  return response.data as { success: boolean, message: string, data: ICake };
}

export async function updateCake(cake_id: string, payload: Partial<ICake>): Promise<{ success: boolean, message: string, data: ICake }> {
  const response = await api.patch(`${BASE_PATH}/${cake_id}`, payload);
  return response.data as { success: boolean, message: string, data: ICake };
}

export async function deleteCake(cake_id: string): Promise<{ deletedId: string }> {
  await api.delete(`${BASE_PATH}/${cake_id}`);
  return { deletedId: cake_id };
}