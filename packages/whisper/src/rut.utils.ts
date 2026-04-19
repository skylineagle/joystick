import { sendSms } from "@joystick/core";
import {
  SMS_GATEWAY_MODEM,
  SMS_GATEWAY_PASSWORD,
  SMS_GATEWAY_URL,
  SMS_GATEWAY_USERNAME,
} from "./config";

export const sendMessage = async (phoneNumber: string, message: string): Promise<unknown> =>
  sendSms(
    SMS_GATEWAY_URL,
    SMS_GATEWAY_USERNAME,
    SMS_GATEWAY_PASSWORD,
    phoneNumber,
    message,
    SMS_GATEWAY_MODEM
  );
