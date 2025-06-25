/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const permissionsCollection = app.findCollectionByNameOrId("permissions");
  const actionsCollection = app.findCollectionByNameOrId("actions");

  const adminUser = app.findRecordsByFilter(
    "users",
    "email = 'admin@joystick.io'"
  );

  const cellSearchAction = new Record(actionsCollection);
  cellSearchAction.set("name", "cell-search");
  app.save(cellSearchAction);

  const cellSearchPermission = new Record(permissionsCollection);
  cellSearchPermission.set("name", "cell-search");
  cellSearchPermission.set("users", [adminUser[0].id]);
  app.save(cellSearchPermission);

  const cellSearchRoutePermission = new Record(permissionsCollection);
  cellSearchRoutePermission.set("name", "cell-search-route");
  cellSearchRoutePermission.set("users", [adminUser[0].id]);
  app.save(cellSearchRoutePermission);
});
