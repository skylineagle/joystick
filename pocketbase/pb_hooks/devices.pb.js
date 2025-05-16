/// <reference path="../pb_data/types.d.ts" />

// Handle create request
onRecordCreateRequest((e) => {
  const configuration = JSON.parse(e.record.get("configuration"));

  e.record.set(
    "configuration",
    JSON.stringify({
      ...configuration,
      sourceFingerprint: "",
      sourceOnDemand: false,
      sourceOnDemandStartTimeout: "10s",
      sourceOnDemandCloseAfter: "10s",
      maxReaders: 0,
      srtReadPassphrase: "",
      fallback: "",
      record: false,
      recordPath: "./recordings/%path/%Y-%m-%d_%H-%M-%S-%f",
      recordFormat: "fmp4",
      recordPartDuration: "1s",
      recordSegmentDuration: "1h0m0s",
      recordDeleteAfter: "1d",
      overridePublisher: true,
      srtPublishPassphrase: "",
      rtspTransport: "tcp",
      rtspAnyPort: false,
      rtspRangeType: "",
      rtspRangeStart: "",
      sourceRedirect: "",
      rpiCameraCamID: 0,
      rpiCameraWidth: 1920,
      rpiCameraHeight: 1080,
      rpiCameraHFlip: false,
      rpiCameraVFlip: false,
      rpiCameraBrightness: 0,
      rpiCameraContrast: 1,
      rpiCameraSaturation: 1,
      rpiCameraSharpness: 1,
      rpiCameraExposure: "normal",
      rpiCameraAWB: "auto",
      rpiCameraAWBGains: [0, 0],
      rpiCameraDenoise: "off",
      rpiCameraShutter: 0,
      rpiCameraMetering: "centre",
      rpiCameraGain: 0,
      rpiCameraEV: 0,
      rpiCameraROI: "",
      rpiCameraHDR: false,
      rpiCameraTuningFile: "",
      rpiCameraMode: "",
      rpiCameraFPS: 30,
      rpiCameraAfMode: "continuous",
      rpiCameraAfRange: "normal",
      rpiCameraAfSpeed: "normal",
      rpiCameraLensPosition: 0,
      rpiCameraAfWindow: "",
      rpiCameraFlickerPeriod: 0,
      rpiCameraTextOverlayEnable: false,
      rpiCameraTextOverlay: "%Y-%m-%d %H:%M:%S - MediaMTX",
      rpiCameraCodec: "auto",
      rpiCameraIDRPeriod: 60,
      rpiCameraBitrate: 5000000,
      rpiCameraProfile: "main",
      rpiCameraLevel: "4.1",
      runOnInit: "",
      runOnInitRestart: false,
      runOnDemand: "",
      runOnDemandRestart: false,
      runOnDemandStartTimeout: "10s",
      runOnDemandCloseAfter: "10s",
      runOnUnDemand: "",
      runOnReady: "",
      runOnReadyRestart: false,
      runOnNotReady: "",
      runOnRead: "",
      runOnReadRestart: false,
      runOnUnread: "",
      runOnRecordSegmentCreate: "",
      runOnRecordSegmentComplete: "",
    })
  );

  e.record.set("status", "off");
  e.record.set("allowed", ["super", "manager", "user"]);
  e.record.set("hide", e.record.get("hide") ?? false);

  e.next();
});

// Handle adter sucessful creation
onRecordAfterCreateSuccess((e) => {
  const { createDeviceJob } = require(`${__hooks}/baker.utils`);
  $app.logger().info(`Device created with ID: ${e.record.id}`);
  const automation = JSON.parse(e.record.get("automation"));

  if (!automation) {
    $app
      .logger()
      .warn(`No automation settings found for device ${e.record.id}`);
    e.next();
    return;
  }

  try {
    createDeviceJob(e.record.id, automation);
  } catch (error) {
    $app.logger().error(error);
  }
  e.next();
}, "devices");

// Handle automation change
onRecordUpdateRequest((e) => {
  const { createDeviceJob } = require(`${__hooks}/baker.utils`);
  const current = $app.findRecordById("devices", e.record.id);
  const automation = e.record.get("automation");

  if (
    automation &&
    JSON.stringify(automation) !== JSON.stringify(current.get("automation"))
  ) {
    $app.logger().info("Automation settings changed, syncing baker job");
    try {
      createDeviceJob(e.record.id, automation);

      const automation_change_action = $app.findFirstRecordByData(
        "actions",
        "name",
        "automation_change"
      );
      const newMode = automation.get("automationType");
      const parameters =
        newMode === "duration"
          ? {
              on: automation.get("on").minutes,
              off: automation.get("off").minutes,
            }
          : {
              on: `${automation.get("on").hourOfDay}:${
                automation.get("on").minute
              }`,
              off: `${automation.get("off").hourOfDay}:${
                automation.get("off").minute
              }`,
            };

      const collection = $app.findCollectionByNameOrId("action_logs");
      const actionLog = new Record(collection);
      actionLog.set("device", e.record.id);
      actionLog.set("user", e.auth.id);
      actionLog.set("action", automation_change_action.id);
      actionLog.set("parameters", parameters);
      actionLog.set("result", {
        success: true,
        output: `Automation settings changed from ${current.get(
          "automation"
        )} to ${automation}`,
      });
      $app.save(actionLog);
    } catch (error) {
      $app.logger().error(error);
      $app.logger().error("Failed to sync baker job", error);
    }
  }
  e.next();
}, "devices");

// Handle mode change
onRecordUpdateRequest((e) => {
  const { startDeviceJob, stopDeviceJob } = require(`${__hooks}/baker.utils`);
  const current = $app.findRecordById("devices", e.record.id);
  const auto = e.record.get("auto");

  if (auto !== current.get("auto")) {
    $app.logger().info("Mode changed, syncing camera state");

    try {
      // If mode changed to auto, create and start job
      if (auto) {
        startDeviceJob(e.record.id);
      } else {
        $app.logger().debug("Stopping job");
        stopDeviceJob(e.record.id);
      }

      const mode_change_action = $app.findFirstRecordByData(
        "actions",
        "name",
        "mode_change"
      );

      const collection = $app.findCollectionByNameOrId("action_logs");
      const actionLog = new Record(collection);
      actionLog.set("device", e.record.id);
      actionLog.set("user", e.auth.id);
      actionLog.set("action", mode_change_action.id);
      actionLog.set("parameters", {
        previous_mode: current.get("auto") ? "auto" : "manual",
        new_mode: auto ? "auto" : "manual",
      });
      actionLog.set("result", {
        success: true,
        output: `Device mode changed from ${
          current.get("auto") ? "auto" : "manual"
        } to ${auto ? "auto" : "manual"}`,
      });
      $app.save(actionLog);
    } catch (error) {
      $app.logger().error(error);
    }
  }

  e.next();
}, "devices");

// Handle HOST change change
onRecordUpdateRequest((e) => {
  const current = $app.findRecordById("devices", e.record.id);
  const information = JSON.parse(e.record.get("information"));
  const configuration = JSON.parse(e.record.get("configuration"));

  if (information.host !== current.get("information").host) {
    $app.logger().info("Host changed, syncing camera state");
    try {
      // If mode changed to auto, create and start job
      const sourceTemplate = $app.findRecordsByFilter(
        "templates",
        `name = "source" && model ?~ "${e.record.get("device")}"`
      );

      const sourceUrl = sourceTemplate[0]
        .get("value")
        .replace("<ip>", information.host)
        .replace("<id>", configuration.name);

      e.record.set("configuration", {
        ...configuration,
        source: sourceUrl,
      });
      $app.save(current);
    } catch (error) {
      $app.logger().warn(error);
    }
  }

  e.next();
}, "devices");

// Handle after successful deletion
onRecordAfterDeleteSuccess((e) => {
  const { stopDeviceJob, deleteDeviceJob } = require(`${__hooks}/baker.utils`);

  $app.logger().info(`Device deleted with ID: ${e.record.id}`);

  try {
    // Stop and delete any existing job
    stopDeviceJob(e.record.id);
    deleteDeviceJob(e.record.id);
    toggleMode(e.record.id, "offline");
  } catch (error) {
    $app.logger().error(error);
  }

  e.next();
}, "devices");

// Cron job to clean up action_row table every 5 days
cronAdd("cleanup_action_rows", "0 0 */10 * *", () => {
  try {
    $app.logger().info("Starting scheduled cleanup of action_row table");

    // Get all records from action_row table
    // Use a batch delete operation instead of fetching and deleting individually
    $app.db().newQuery("DELETE FROM action_logs").execute();
  } catch (error) {
    $app.logger().error(error);
    $app.logger().error("Failed to clean up action_row table", error);
  }
});
