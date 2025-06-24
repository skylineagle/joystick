/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const actions = app.findCollectionByNameOrId("actions");

  // Slot check action
  let slotCheckAction = new Record(actions);
  slotCheckAction.set("name", "slot-check");
  slotCheckAction.set("params", {
    type: "object",
    properties: {},
    additionalProperties: false,
  });
  app.save(slotCheckAction);
});
