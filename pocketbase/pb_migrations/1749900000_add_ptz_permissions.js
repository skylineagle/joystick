/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const permissionsCollection = app.findCollectionByNameOrId("permissions");

  // Create a new record for PTZ control permission
  const adminUser = app.findRecordsByFilter(
    "users",
    "email = 'admin@joystick.io'"
  );
  const controlPtz = new Record(permissionsCollection);
  controlPtz.set("name", "control-ptz");
  controlPtz.set("users", [adminUser[0].id]);

  app.save(controlPtz);
});
