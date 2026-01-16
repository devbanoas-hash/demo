import { api } from "../config/axios";
import { IOrder } from "@/types/order";
import { IShipper } from "@/types/shipper";

const BASE_PATH = "/shippers";

export async function getAllShipper(): Promise<IShipper[]> {
  const response = await api.get(BASE_PATH);
  return response.data?.data as IShipper[];
}

/**
 * Gọi webhook n8n để gửi yêu cầu đến shipper qua Telegram
 * n8n sẽ gửi tin nhắn cho shipper và shipper sẽ phản hồi qua Telegram
 * Sau đó n8n sẽ gửi webhook callback về backend, backend sẽ emit socket event
 * @param order Order cần assign shipper
 * @param shipper Shipper được assign
 * @returns Promise với kết quả gửi request
 */
type ExternalShipper = { app_id: 'external_ship'; shipper_name: 'Ship Ngoài' };

export async function assignShipperToOrder(
  order: IOrder,
  shipper: IShipper | ExternalShipper
): Promise<{ 
  success: boolean; 
  message?: string; 
  error?: string;
}> {
  try {
    const webhookUrl = import.meta.env.VITE_N8N_ASSIGN_SHIPPER;
    
    if (!webhookUrl) {
      console.warn('VITE_N8N_ASSIGN_SHIPPER is not defined');
      return { success: false, error: 'Webhook URL không được cấu hình' };
    }

    // Gửi request đến webhook n8n để n8n gửi tin nhắn cho shipper
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: order.order_id,
        order: {
          order_id: order.order_id,
          customer: {
            customer_name: order.customer.customer_name,
            customer_phone_number: order.customer.customer_phone_number,
            address: order.customer.address,
          },
          delivery_at: order.delivery_at,
          total_amount: order.total_amount,
          deposit_amount: order.deposit_amount,
          fulfillment_method: order.fulfillment_method,
        },
        shipper: {
          app_id: shipper.app_id,
          shipper_name: shipper.shipper_name,
          shipper_phone_number: 'app_id' in shipper ? (shipper as IShipper).shipper_phone_number : undefined,
        },
        // URL callback để n8n gửi response về
        callback_url: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/webhooks/shipper-response`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.statusText}`);
    }

    // n8n sẽ trả về response ngay lập tức (không phải phản hồi từ shipper)
    // Phản hồi từ shipper sẽ được n8n gửi về callback_url sau khi shipper bấm nút trên Telegram
    return {
      success: true,
      message: 'Đã gửi yêu cầu đến shipper, đang chờ phản hồi',
    };
  }
  catch (error: any) {
    console.error('Error calling n8n webhook:', error);
    return {
      success: false,
      error: error.message || 'Không thể gửi yêu cầu đến shipper',
    };
  }
}
