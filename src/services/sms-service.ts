import { ISmsGateway } from "@/models/SmsGateway";

interface SendSMSParams {
  to: string;
  message: string;
  from?: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SignalwireSMSProvider {
  private gateway: ISmsGateway;

  constructor(gateway: ISmsGateway) {
    this.gateway = gateway;
  }

  async sendSMS({ to, message, from }: SendSMSParams): Promise<SMSResponse> {
    try {
      const response = await fetch(`https://${this.gateway.spaceUrl}/api/laml/2010-04-01/Accounts/${this.gateway.projectId}/Messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.gateway.projectId}:${this.gateway.authToken}`).toString('base64')}`
        },
        body: new URLSearchParams({
          To: to,
          From: from || this.gateway.phoneNumber,
          Body: message
        }).toString()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS');
      }

      return {
        success: true,
        messageId: data.sid
      };
    } catch (error) {
      console.error('Signalwire SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS'
      };
    }
  }
}

class VISMSProvider {
  private gateway: ISmsGateway;

  constructor(gateway: ISmsGateway) {
    this.gateway = gateway;
  }

  async sendSMS({ to, message, from }: SendSMSParams): Promise<SMSResponse> {
    try {
      const response = await fetch(`${this.gateway.spaceUrl}/api/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.gateway.authToken}`
        },
        body: JSON.stringify({
          to,
          from: from || this.gateway.phoneNumber,
          message,
          projectId: this.gateway.projectId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS');
      }

      return {
        success: true,
        messageId: data.id
      };
    } catch (error) {
      console.error('VI SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS'
      };
    }
  }
}

export class SMSService {
  static async getGatewayByType(type: 'signalwire' | 'vi'): Promise<ISmsGateway | null> {
    try {
      const response = await fetch(`/api/sms/gateway/${type}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} gateway`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching gateway:', error);
      return null;
    }
  }

  static async sendSMS(params: SendSMSParams & { type: 'signalwire' | 'vi' }): Promise<SMSResponse> {
    try {
      const gateway = await this.getGatewayByType(params.type);
      if (!gateway) {
        return {
          success: false,
          error: `No ${params.type} gateway configured`
        };
      }

      const provider = params.type === 'signalwire' 
        ? new SignalwireSMSProvider(gateway)
        : new VISMSProvider(gateway);

      return await provider.sendSMS(params);
    } catch (error) {
      console.error('SMS service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS'
      };
    }
  }
} 