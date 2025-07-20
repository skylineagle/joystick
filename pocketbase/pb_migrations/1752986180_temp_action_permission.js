/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const actionsCollection = app.findCollectionByNameOrId("actions");
  const permissionsCollection = app.findCollectionByNameOrId("permissions");

  const adminUser = app.findRecordsByFilter(
    "users",
    "email = 'admin@joystick.io'"
  );

  const getTempAction = new Record(actionsCollection);
  getTempAction.set("name", "get-temp");
  app.save(getTempAction);

  const deviceTempPermission = new Record(permissionsCollection);
  deviceTempPermission.set("name", "device-temp");
  deviceTempPermission.set("users", [adminUser[0].id]);
  app.save(deviceTempPermission);
});
