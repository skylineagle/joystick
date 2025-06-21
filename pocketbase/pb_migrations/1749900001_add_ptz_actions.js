/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const actions = app.findCollectionByNameOrId("actions");

  // Set X position action
  let setXAction = new Record(actions);
  setXAction.set("name", "set-x");
  setXAction.set("params", {
    type: "object",
    properties: {
      x: {
        type: "number",
        description: "X position value for PTZ camera",
      },
    },
    required: ["x"],
    additionalProperties: false,
  });
  app.save(setXAction);

  // Get X position action
  let getXAction = new Record(actions);
  getXAction.set("name", "get-x");
  getXAction.set("params", {
    type: "object",
    properties: {},
    additionalProperties: false,
  });
  app.save(getXAction);

  // Set Y position action
  let setYAction = new Record(actions);
  setYAction.set("name", "set-y");
  setYAction.set("params", {
    type: "object",
    properties: {
      y: {
        type: "number",
        description: "Y position value for PTZ camera",
      },
    },
    required: ["y"],
    additionalProperties: false,
  });
  app.save(setYAction);

  // Get Y position action
  let getYAction = new Record(actions);
  getYAction.set("name", "get-y");
  getYAction.set("params", {
    type: "object",
    properties: {},
    additionalProperties: false,
  });
  app.save(getYAction);
});
