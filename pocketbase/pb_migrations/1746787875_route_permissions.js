/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const permissionsCollection = app.findCollectionByNameOrId("permissions");

  // Create a new record for mode_change action
  const adminUser = app.findRecordsByFilter(
    "users",
    "email = 'admin@joystick.io'"
  );
  const mediaRoute = new Record(permissionsCollection);
  mediaRoute.set("name", "media-route");
  mediaRoute.set("users", [adminUser[0].id]);
  app.save(mediaRoute);

  const actionRoute = new Record(permissionsCollection);
  actionRoute.set("name", "action-route");
  actionRoute.set("users", [adminUser[0].id]);
  app.save(actionRoute);

  const parametersRoute = new Record(permissionsCollection);
  parametersRoute.set("name", "parameters-route");
  parametersRoute.set("users", [adminUser[0].id]);
  app.save(parametersRoute);

  const galleryRoute = new Record(permissionsCollection);
  galleryRoute.set("name", "gallery-route");
  galleryRoute.set("users", [adminUser[0].id]);
  app.save(galleryRoute);

  const terminalRoute = new Record(permissionsCollection);
  terminalRoute.set("name", "terminal-route");
  terminalRoute.set("users", [adminUser[0].id]);
  app.save(terminalRoute);
});
