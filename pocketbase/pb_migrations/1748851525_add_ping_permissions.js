/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const permissionsCollection = app.findCollectionByNameOrId("permissions");

  const adminUser = app.findRecordsByFilter(
    "users",
    "email = 'admin@joystick.io'"
  );
  const pingPermission = new Record(permissionsCollection);
  pingPermission.set("name", "device-ping");
  pingPermission.set("users", [adminUser[0].id]);

  app.save(pingPermission);
});
