import { TUserStatus } from "../constants/user.constant";
import { IRole } from "./role";

export interface IUser {
  user_id: string;
  role: IRole;
  username: string;
  email: string;
  password?: string;
  status: TUserStatus;
  created_at?: string;
  updated_at?: string;
}
