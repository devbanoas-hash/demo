import { TOrderFulfillmentMethod, TOrderStatus, TOrderPaymentMethod } from '../constants/order.constant';
import { ICustomer } from "./customer";
import { IUser } from "./user";
import { TCakeType } from '../constants/cake.constant';
import { ICake } from './cake';
import { IShipper } from './shipper';

export type TAvailableCakeOrderItem = ICake & { 
  quantity: number;
  production_status?: 'pending' | 'completed';
};

export type TCustomCakeOrderItem = ICake & {
  quantity: number;
  note: string;
  image_upload: string[];
  production_status?: 'pending' | 'completed';
};

export type TCakeOrderItem = TAvailableCakeOrderItem | TCustomCakeOrderItem;

export type TCakeOrder = TCakeOrderItem[];

export interface IOrder {
  order_id: string;
  customer: ICustomer;
  shipper: IShipper;
  cake_orders: TCakeOrder;
  total_amount: number;
  deposit_amount: number;
  payment_method: TOrderPaymentMethod;
  created_by: IUser;
  received_by: IUser;
  delivery_at: string;
  fulfillment_method: TOrderFulfillmentMethod;
  shipping_fee: number;
  is_notified: boolean;
  order_note: string;
  status: TOrderStatus;
  created_at?: string;
  updated_at?: string;
}