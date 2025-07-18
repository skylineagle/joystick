/// <reference path="../pb_data/types.d.ts" />

// Handle new message notifications
onRecordAfterCreateSuccess((e) => {
  const { sendNotification } = require(`${__hooks}/utils`);
  const direction = e.record.get("direction");

  // Only send notifications for incoming messages
  if (direction !== "from") {
    e.next();
    return;
  }

  try {
    const message = e.record.get("message");
    const deviceId = e.record.get("device");
    const phone = e.record.get("phone");

    // Get device information for the notification
    const device = $app.findRecordById("devices", deviceId);
    let deviceName = "Unknown Device";

    if (device) {
      const configuration = JSON.parse(device.get("configuration"));
      deviceName = configuration?.name || deviceId;
    }

    // Format phone number for display
    const phoneDisplay = phone ? `from ${phone}` : "";

    // Truncate message if too long
    const messagePreview =
      message.length > 100 ? message.substring(0, 100) + "..." : message;

    sendNotification({
      type: "info",
      title: `New message ${phoneDisplay}`,
      message:
        deviceName.length > 15
          ? `message from ${deviceName.substring(0, 15)}...: ${messagePreview}`
          : `message from ${deviceName}: ${messagePreview}`,
      deviceId: deviceId,
      dismissible: true,
      userId: e.auth?.id,
      metadata: {
        type: "new-message",
        messageId: e.record.id,
        direction: direction,
        phone: phone,
        deviceId: deviceId,
      },
    });

    $app.logger().info(`Notification sent for new message: ${e.record.id}`);
  } catch (error) {
    $app.logger().error("Failed to send message notification:", error);
  }

  e.next();
}, "message");
