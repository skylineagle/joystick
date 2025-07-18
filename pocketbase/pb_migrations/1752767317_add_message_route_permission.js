/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const permissionsCollection = app.findCollectionByNameOrId("permissions");

  // Create a new record for PTZ control permission
  const adminUser = app.findRecordsByFilter(
    "users",
    "email = 'admin@joystick.io'"
  );
  const messageRoute = new Record(permissionsCollection);
  messageRoute.set("name", "message-route");
  messageRoute.set("users", [adminUser[0].id]);

  app.save(messageRoute);
});
