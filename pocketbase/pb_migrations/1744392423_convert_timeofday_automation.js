/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const devices = app.findRecordsByFilter("devices", "automation != null");

    for (const device of devices) {
      const automation = JSON.parse(device.get("automation"));

      // Convert on time
      if (
        automation.on?.hourOfDay !== undefined &&
        automation.on?.minuteOfDay !== undefined
      ) {
        const hour = automation.on.hourOfDay.toString().padStart(2, "0");
        const minute = automation.on.minuteOfDay.toString().padStart(2, "0");
        automation.on.utcDate = `${hour}:${minute}`;
        delete automation.on.hourOfDay;
        delete automation.on.minuteOfDay;
      }

      // Convert off time
      if (
        automation.off?.hourOfDay !== undefined &&
        automation.off?.minuteOfDay !== undefined
      ) {
        const hour = automation.off.hourOfDay.toString().padStart(2, "0");
        const minute = automation.off.minuteOfDay.toString().padStart(2, "0");
        automation.off.utcDate = `${hour}:${minute}`;
        delete automation.off.hourOfDay;
        delete automation.off.minuteOfDay;
      }

      device.set("automation", automation);
      app.save(device);
    }
  },
  (app) => {
    const devices = app.findRecordsByFilter("devices", "automation != null");

    for (const device of devices) {
      const automation = JSON.parse(device.get("automation"));

      // Convert on time back
      if (automation.on?.utcDate) {
        const [hour, minute] = automation.on.utcDate.split(":").map(Number);
        automation.on.hourOfDay = hour;
        automation.on.minuteOfDay = minute;
        delete automation.on.utcDate;
      }

      // Convert off time back
      if (automation.off?.utcDate) {
        const [hour, minute] = automation.off.utcDate.split(":").map(Number);
        automation.off.hourOfDay = hour;
        automation.off.minuteOfDay = minute;
        delete automation.off.utcDate;
      }

      device.set("automation", automation);
      app.save(device);
    }
  }
);
