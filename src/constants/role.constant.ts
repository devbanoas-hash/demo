export type TRoleName = 'Admin' | 'Store_Manager' | 'Production_Manager' | 'Front_Desk_Clerk';

export const roleLabels: Record<TRoleName, string> = {
  Admin: 'Quản trị viên',
  Store_Manager: 'Cửa hàng trưởng',
  Production_Manager: 'Trưởng sản xuất',
  Front_Desk_Clerk: 'Thu ngân / Lễ tân'
};
