/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const actionsCollection = app.findCollectionByNameOrId("actions");

  const actions = ["get-wifi-ap-status", "get-wifi-clients", "get-wifi-traffic", "set-wifi-ap-config"];

  for (const name of actions) {
    const action = new Record(actionsCollection);
    action.set("name", name);
    app.save(action);
  }
});
