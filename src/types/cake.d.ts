import { TCakeStatus, TCakeType } from "../constants/cake.constant";

export interface ICake {
  cake_id: string;
  cake_name: string;
  type: TCakeType;
  unit_price: number;
  status: TCakeStatus;
  created_at?: string;
  updated_at?: string;
}
