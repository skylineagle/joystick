import {
  SMS_GATEWAY_URL,
  SMS_GATEWAY_USERNAME,
  SMS_GATEWAY_PASSWORD,
  SMS_GATEWAY_MODEM,
} from "./config";

export async function login() {
  const response = await fetch(`${SMS_GATEWAY_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: SMS_GATEWAY_USERNAME,
      password: SMS_GATEWAY_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to login");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("Failed to login");
  }

  return data.data.token;
}

export async function sendMessage(phoneNumber: string, message: string) {
  const token = await login();

  const response = await fetch(`${SMS_GATEWAY_URL}/api/messages/actions/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        number: phoneNumber,
        message,
        modem: SMS_GATEWAY_MODEM,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send SMS");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error("Failed to send SMS");
  }

  return data.data;
}
