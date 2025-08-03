// @ts-expect-error: SignalWire types export issue
import { RestClient } from '@signalwire/compatibility-api';
import { ISignalWireConfig, IViConfig } from '@/models/SmsGateway';
import { Apidaze } from '@apidaze/node';

export const sendSignalWireSMS = async (
  didNumber: string,
  to: string,
  messageBody: string,
  config: ISignalWireConfig
) => {
  try {
    const client = new RestClient(
      config.projectId,
      config.authToken,
      { signalwireSpaceUrl: config.spaceUrl }
    );

    const response = await client.messages.create({
      from: '+1' + didNumber,
      to: '+1' + to,
      body: messageBody,
    });

    if (!response.sid || response.sid.toString().length === 0) {
      return {
        success: false,
        data: 'Failed to send SMS',
      };
    }

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error sending SMS through SignalWire:', error);
    return {
      sucess: false,
      data: (error as Error).message,
    };
  }
}

export const sendViSMS = async (
  didNumber: string,
  to: string,
  messageBody: string,
  config: IViConfig
) => {
  try {
    const ApidazeClient = new Apidaze(
      config.apiKey,
      config.apiSecret
    );

    const response = await ApidazeClient.messages.send(`1${didNumber}`, `1${to}`, messageBody);

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Error sending SMS through VI:', error);
    return {
      sucess: false,
      data: (error as Error).message,
    };
  }

}