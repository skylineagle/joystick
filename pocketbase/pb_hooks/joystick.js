/// <reference path="../pb_data/types.d.ts" />

const JOYSTICK_URL =
  $os.getenv("JOYSTICK_URL") || "http://host.docker.internal:8000";

function toggleMode(deviceId, mode) {
  $app.logger().info("Toggling mode of device", deviceId, "to", mode);
  $http.send({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.JOYSTICK_API_KEY,
    },
    url: `${JOYSTICK_URL}/api/run/${deviceId}/set-mode`,
    body: {
      mode,
    },
  });
}

module.exports = {
  toggleMode,
};
