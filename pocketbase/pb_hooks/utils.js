const getActiveDeviceConnection = (deviceInfo) => {
  if (deviceInfo?.activeSlot === "secondary" && deviceInfo?.secondSlotHost) {
    return {
      host: deviceInfo.secondSlotHost,
      port: deviceInfo.port,
      phone: deviceInfo.secondSlotPhone,
    };
  }

  return {
    host: deviceInfo.host,
    port: deviceInfo.port,
    phone: deviceInfo.phone,
  };
};

const sendNotification = (payload) => {
  const { type, title, message, userId, deviceId, dismissible } = payload;

  const joystickApiUrl =
    process.env.JOYSTICK_API_URL || "http://localhost:8000";

  try {
    const res = $http.send({
      url: `${joystickApiUrl}/api/notifications/send`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.JOYSTICK_API_KEY,
      },
      body: JSON.stringify({
        type,
        title,
        message,
        userId,
        deviceId,
        dismissible,
      }),
    });

    $app.logger().info("Notification sent successfully");
    return res;
  } catch (error) {
    $app.logger().error("Failed to send notification:", error);
    throw error;
  }
};

module.exports = {
  getActiveDeviceConnection,
  sendNotification,
};
