/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const permissionsCollection = app.findCollectionByNameOrId("permissions");

  const adminUser = app.findRecordsByFilter(
    "users",
    "email = 'admin@joystick.io'"
  );

  const taskRoutePermission = new Record(permissionsCollection);
  taskRoutePermission.set("name", "task-route");
  taskRoutePermission.set("users", [adminUser[0].id]);
  app.save(taskRoutePermission);
});
