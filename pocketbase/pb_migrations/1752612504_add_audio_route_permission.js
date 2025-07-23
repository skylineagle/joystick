/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const permissionsCollection = app.findCollectionByNameOrId("permissions");

    // Find admin user to grant permission
    const adminUsers = app.findRecordsByFilter(
      "users",
      "email = 'admin@joystick.io'"
    );

    // Create audio-route permission and grant it to admin user
    const audioRoutePermission = new Record(permissionsCollection);
    audioRoutePermission.set("name", "audio-route");

    if (adminUsers.length > 0) {
      audioRoutePermission.set("users", [adminUsers[0].id]);
    }

    app.save(audioRoutePermission);
  },
  (app) => {
    // Find and delete the audio-route permission
    try {
      const audioRoutePermission = app.findFirstRecordByFilter(
        "permissions",
        "name = 'audio-route'"
      );

      if (audioRoutePermission) {
        app.dao().deleteRecord(audioRoutePermission);
      }
    } catch (error) {
      // Permission might not exist, ignore error
    }
  }
);
