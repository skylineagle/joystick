const getActiveDeviceConnection = (deviceInfo) => {
  if (deviceInfo?.activeSlot === "secondary" && deviceInfo?.secondSlotHost) {
    return {
      host: deviceInfo.secondSlotHost,
      phone: deviceInfo.secondSlotPhone,
    };
  }
  return {
    host: deviceInfo.host,
    phone: deviceInfo.phone,
  };
};

const sendNotification = (payload) => {
  const { type, title, message, userId, deviceId, dismissible } = payload;

  const joystickApiUrl =
    process.env.JOYSTICK_API_URL || "http://localhost:8000";

  try {
    $http.send({
      url: `${joystickApiUrl}/api/notifications/send`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        message,
        userId,
        deviceId,
        dismissible,
      }),
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};

module.exports = {
  getActiveDeviceConnection,
  sendNotification,
};
