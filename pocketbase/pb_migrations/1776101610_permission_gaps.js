/// <reference path="../pb_data/types.d.ts" />

/*
 Full inventory of permission names used by the Joystick app (useIsPermitted
 and useIsRouteAllowed, which checks "<route>-route"):

 action-route, admin-dashboard, advanced-stream-control, audio-route,
 cell-search, cell-search-route, control-device, control-mode, control-ptz,
 control-roi, create-device, delete-device, device-battery, device-cpsi,
 device-gps, device-imu, device-ping, device-temp, download-client,
 easter-eggs, edit-configuration, edit-device, gallery-route, media-route,
 message-route, notifications, notifications-history, parameters-route,
 recent-events, system-status, terminal-route, toggle-slot, view-stream

 Prior pb_migrations already insert rows for every name in that list except:
 admin-dashboard, control-device, create-device, delete-device,
 download-client, easter-eggs, edit-configuration, edit-device, recent-events,
 view-stream

 This migration creates those missing permission records (if absent) and
 ensures admin@joystick.io is in `users`, merging into existing rows when
 present.
*/

const GAP_PERMISSION_NAMES = [
  "admin-dashboard",
  "control-device",
  "create-device",
  "delete-device",
  "download-client",
  "easter-eggs",
  "edit-configuration",
  "edit-device",
  "recent-events",
  "view-stream",
];

const mergeAdminUser = (record, adminId) => {
  let userIds = record.get("users");
  if (!userIds) {
    userIds = [];
  }
  if (!Array.isArray(userIds)) {
    userIds = [];
  }
  if (userIds.includes(adminId)) {
    return false;
  }
  record.set("users", [...userIds, adminId]);
  return true;
};

migrate(
  (app) => {
    const permissionsCollection = app.findCollectionByNameOrId("permissions");
    const adminUsers = app.findRecordsByFilter(
      "users",
      "email = 'admin@joystick.io'"
    );
    if (adminUsers.length === 0) {
      return;
    }
    const adminId = adminUsers[0].id;

    for (const name of GAP_PERMISSION_NAMES) {
      let existing = null;
      try {
        existing = app.findFirstRecordByFilter(
          "permissions",
          `name = '${name}'`
        );
      } catch (e) {
        existing = null;
      }

      if (existing) {
        if (mergeAdminUser(existing, adminId)) {
          app.save(existing);
        }
        continue;
      }

      const created = new Record(permissionsCollection);
      created.set("name", name);
      created.set("users", [adminId]);
      app.save(created);
    }
  },
  (app) => {
    for (const name of GAP_PERMISSION_NAMES) {
      try {
        const record = app.findFirstRecordByFilter(
          "permissions",
          `name = '${name}'`
        );
        if (record) {
          app.dao().deleteRecord(record);
        }
      } catch (e) {}
    }
  }
);
