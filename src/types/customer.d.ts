export type TCustomerAddress = {
  street: string;
  ward: string;
  district: string;
  province: string;
};

export interface ICustomer {
  customer_phone_number: string;
  customer_name: string;
  address: TCustomerAddress;
  created_at?: string;
}
