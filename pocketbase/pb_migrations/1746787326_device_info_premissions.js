/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const permissionsCollection = app.findCollectionByNameOrId("permissions");

  // Create a new record for mode_change action
  const adminUser = app.findRecordsByFilter(
    "users",
    "email = 'admin@joystick.io'"
  );
  const deviceImu = new Record(permissionsCollection);
  deviceImu.set("name", "device-imu");
  deviceImu.set("users", [adminUser[0].id]);
  app.save(deviceImu);

  const deviceGps = new Record(permissionsCollection);
  deviceGps.set("name", "device-gps");
  deviceGps.set("users", [adminUser[0].id]);
  app.save(deviceGps);

  const deviceBattery = new Record(permissionsCollection);
  deviceBattery.set("name", "device-battery");
  deviceBattery.set("users", [adminUser[0].id]);
  app.save(deviceBattery);

  const deviceCpsi = new Record(permissionsCollection);
  deviceCpsi.set("name", "device-cpsi");
  deviceCpsi.set("users", [adminUser[0].id]);
  app.save(deviceCpsi);
});
