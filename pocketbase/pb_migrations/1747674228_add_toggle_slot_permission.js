/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const permissionsCollection = app.findCollectionByNameOrId("permissions");

  // Create a new record for mode_change action
  const adminUser = app.findRecordsByFilter(
    "users",
    "email = 'admin@joystick.io'"
  );
  const toggleSlot = new Record(permissionsCollection);
  toggleSlot.set("name", "toggle-slot");
  toggleSlot.set("users", [adminUser[0].id]);

  app.save(toggleSlot);
});
