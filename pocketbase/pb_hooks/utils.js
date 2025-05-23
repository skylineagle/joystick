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

module.exports = {
  getActiveDeviceConnection,
};
