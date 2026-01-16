import { TShipperStatus } from "@/constants/shipper.constant";

export interface IShipper {
    shipper_phone_number: string;
    shipper_name: string;
    app_id: string;
    status: TShipperStatus;
    created_at?: string;
}