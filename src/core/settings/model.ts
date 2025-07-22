export interface IUpdateSettingRequest {
  userId: string;
  settingId: string;
  name: string;
  email: string;
  domain?: string;
  sipUsername?: string;
  sipPassword?: string;
  password?: string;
  newPassword?: string;
}

export interface ICreateSettingRequest {
  userId: string;
  settingId: string;
  name: string;
  email: string;
  domain: string;
  sipUsername?: string;
  sipPassword?: string;
  currentPassword?: string;
  newPassword?: string;
}