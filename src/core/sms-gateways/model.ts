import { ISignalWireConfig, IViConfig } from "@/models/SmsGateway";

export interface ISmsGatewayItem {
  _id: string;
  type: string;
  didNumber: string;
  config: ISignalWireConfig | IViConfig;
  createdAt: string;
}

export interface ICreateSmsGatewayRequest {
  type: string;
  didNumber: string;
  config: ISignalWireConfig | IViConfig
}

export interface IUpdateSmsGatewayRequest {
  id: string;
  type: string;
  didNumber: string;
  config: ISignalWireConfig | IViConfig
}