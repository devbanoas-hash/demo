import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tách delivery_at thành day và time
 * @param delivery_at - Chuỗi datetime ở định dạng ISO (ví dụ: '2024-03-20T09:00:00')
 * @returns Object chứa day (YYYY-MM-DD) và time (HH:mm)
 */
export function splitDeliveryDateTime(delivery_at: string): { day: string; time: string } {
  if (!delivery_at) {
    return { day: '', time: '' };
  }

  // Xử lý định dạng ISO datetime (2024-03-20T09:00:00 hoặc 2024-03-20T09:00:00.000Z)
  const dateTimeMatch = delivery_at.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (dateTimeMatch) {
    return {
      day: dateTimeMatch[1],
      time: dateTimeMatch[2]
    };
  }

  // Fallback: nếu không khớp định dạng, thử parse bằng Date
  try {
    const date = new Date(delivery_at);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return {
        day: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`
      };
    }
  } catch (e) {
    // Nếu parse thất bại, trả về giá trị rỗng
  }

  return { day: '', time: '' };
}
