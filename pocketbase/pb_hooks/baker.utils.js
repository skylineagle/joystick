/// <reference path="../pb_data/types.d.ts" />

const BAKER_URL = $os.getenv("BAKER_URL") || "http://host.docker.internal:3000";

function createDeviceJob(deviceId, automation) {
  // curl -X POST -H "Content-Type: application/json" -d '{"automation": "..."}' http://host.docker.internal:3000/jobs/{deviceId}
  $http.send({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.JOYSTICK_API_KEY,
    },
    url: `${BAKER_URL}/jobs/${deviceId}`,
    body: automation,
  });
}

function deleteDeviceJob(deviceId) {
  // curl -X DELETE http://host.docker.internal:3000/jobs/{deviceId}
  $http.send({
    method: "DELETE",
    url: `${BAKER_URL}/jobs/${deviceId}`,
    headers: {
      "x-api-key": process.env.JOYSTICK_API_KEY,
    },
  });
}

function startDeviceJob(deviceId) {
  // curl -X POST http://host.docker.internal:3000/jobs/{deviceId}/start
  $http.send({
    method: "POST",
    url: `${BAKER_URL}/jobs/${deviceId}/start`,
    headers: {
      "x-api-key": process.env.JOYSTICK_API_KEY,
    },
  });
}

function stopDeviceJob(deviceId) {
  // curl -X POST http://host.docker.internal:3000/jobs/{deviceId}/stop
  $http.send({
    method: "POST",
    url: `${BAKER_URL}/jobs/${deviceId}/stop`,
    headers: {
      "x-api-key": process.env.JOYSTICK_API_KEY,
    },
  });
}

function getJobStatus(deviceId) {
  // curl -X GET http://host.docker.internal:3000/jobs/{deviceId}
  $http.send({
    method: "GET",
    url: `${BAKER_URL}/jobs/${deviceId}`,
    headers: {
      "x-api-key": process.env.JOYSTICK_API_KEY,
    },
  });
}

module.exports = {
  createDeviceJob,
  deleteDeviceJob,
  startDeviceJob,
  stopDeviceJob,
  getJobStatus,
};
