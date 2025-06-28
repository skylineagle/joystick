/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const permissionsCollection = app.findCollectionByNameOrId("permissions");
    const actionsCollection = app.findCollectionByNameOrId("actions");

    const adminUser = app.findRecordsByFilter(
      "users",
      "email = 'admin@joystick.io'"
    );

    // Remove the old cell-search action if it exists
    try {
      const oldCellSearchAction = app.findFirstRecordByFilter(
        "actions",
        "name = 'cell-search'"
      );
      if (oldCellSearchAction) {
        app.delete(oldCellSearchAction);
      }
    } catch (e) {
      // Action doesn't exist, continue
    }

    // Create run-scan action
    const runScanAction = new Record(actionsCollection);
    runScanAction.set("name", "run-scan");
    app.save(runScanAction);

    // Create get-scan action
    const getScanAction = new Record(actionsCollection);
    getScanAction.set("name", "get-scan");
    app.save(getScanAction);

    // Update existing cell-search permission to include both actions
    try {
      const cellSearchPermission = app.findFirstRecordByFilter(
        "permissions",
        "name = 'cell-search'"
      );
      if (cellSearchPermission && adminUser.length > 0) {
        cellSearchPermission.set("users", [adminUser[0].id]);
        app.save(cellSearchPermission);
      }
    } catch (e) {
      // Permission doesn't exist, create it
      if (adminUser.length > 0) {
        const cellSearchPermission = new Record(permissionsCollection);
        cellSearchPermission.set("name", "cell-search");
        cellSearchPermission.set("users", [adminUser[0].id]);
        app.save(cellSearchPermission);
      }
    }

    // Ensure cell-search-route permission exists
    try {
      const cellSearchRoutePermission = app.findFirstRecordByFilter(
        "permissions",
        "name = 'cell-search-route'"
      );
      if (cellSearchRoutePermission && adminUser.length > 0) {
        cellSearchRoutePermission.set("users", [adminUser[0].id]);
        app.save(cellSearchRoutePermission);
      }
    } catch (e) {
      // Permission doesn't exist, create it
      if (adminUser.length > 0) {
        const cellSearchRoutePermission = new Record(permissionsCollection);
        cellSearchRoutePermission.set("name", "cell-search-route");
        cellSearchRoutePermission.set("users", [adminUser[0].id]);
        app.save(cellSearchRoutePermission);
      }
    }
  },
  (app) => {
    // Rollback: Remove the new actions and restore old cell-search action
    const actionsCollection = app.findCollectionByNameOrId("actions");

    // Remove run-scan and get-scan actions
    try {
      const runScanAction = app.findFirstRecordByFilter(
        "actions",
        "name = 'run-scan'"
      );
      if (runScanAction) {
        app.delete(runScanAction);
      }
    } catch (e) {
      // Action doesn't exist
    }

    try {
      const getScanAction = app.findFirstRecordByFilter(
        "actions",
        "name = 'get-scan'"
      );
      if (getScanAction) {
        app.delete(getScanAction);
      }
    } catch (e) {
      // Action doesn't exist
    }

    // Restore old cell-search action
    const cellSearchAction = new Record(actionsCollection);
    cellSearchAction.set("name", "cell-search");
    app.save(cellSearchAction);
  }
);
