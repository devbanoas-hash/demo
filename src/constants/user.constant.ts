export type TUserStatus = 'online' | 'offline';

export const userStatusLabels: Record<TUserStatus, string> = {
  online: 'Hoạt động',
  offline: 'Ngưng hoạt động',
};
