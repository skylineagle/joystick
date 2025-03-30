/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const actionsCollection = app.findCollectionByNameOrId("actions");

    // Create a new record for mode_change action
    const modeChangeAction = new Record(actionsCollection);
    modeChangeAction.set("name", "mode_change");

    app.save(modeChangeAction);

    const automationChangeAction = new Record(actionsCollection);
    automationChangeAction.set("name", "automation_change");

    app.save(automationChangeAction);
  },
  (app) => {
    // Revert changes by deleting the mode_change action
    const actionsCollection = app.findCollectionByNameOrId("actions");
    const modeChangeAction = app.findRecordById("actions", "mode_change");
    const automationChangeAction = app.findRecordById(
      "actions",
      "automation_change"
    );

    if (modeChangeAction) {
      app.dao().deleteRecord(modeChangeAction);
    }

    if (automationChangeAction) {
      app.dao().deleteRecord(automationChangeAction);
    }
  }
);
