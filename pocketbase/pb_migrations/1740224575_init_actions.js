/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const actions = app.findCollectionByNameOrId("actions");

  // Write action
  let writeAction = new Record(actions);
  writeAction.set("name", "write");
  writeAction.set("params", {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "A string representing the path.",
      },
      value: {
        oneOf: [{ type: "number" }, { type: "string" }, { type: "boolean" }],
        description: "The value can be a number, string, or boolean.",
      },
    },
    required: ["path", "value"],
    additionalProperties: false,
  });
  app.save(writeAction);

  // Read action
  let readAction = new Record(actions);
  readAction.set("name", "read");
  readAction.set("params", {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "A string representing the path.",
      },
    },
    required: ["path"],
    additionalProperties: false,
  });
  app.save(readAction);

  // Set bitrate action
  let setBitrateAction = new Record(actions);
  setBitrateAction.set("name", "set-bitrate");
  setBitrateAction.set("params", {
    type: "object",
    properties: {
      bitrate: { type: "number" },
    },
    required: ["bitrate"],
    additionalProperties: false,
  });
  app.save(setBitrateAction);

  // Get bitrate action
  let getBitrateAction = new Record(actions);
  getBitrateAction.set("name", "get-bitrate");
  getBitrateAction.set("params", {
    type: "object",
    properties: {},
    additionalProperties: false,
  });
  app.save(getBitrateAction);

  // Set mode action
  let setModeAction = new Record(actions);
  setModeAction.set("name", "set-mode");
  setModeAction.set("params", {
    type: "object",
    properties: {
      mode: {
        type: "string",
        enum: ["cmd", "live", "vmd"],
      },
    },
    required: ["mode"],
    additionalProperties: false,
  });
  app.save(setModeAction);

  // Get mode action
  let getModeAction = new Record(actions);
  getModeAction.set("name", "get-mode");
  getModeAction.set("params", {
    type: "object",
    properties: {},
    additionalProperties: false,
  });
  app.save(getModeAction);

  // Set ROI action
  let setRoiAction = new Record(actions);
  setRoiAction.set("name", "set-roi");
  setRoiAction.set("params", {
    type: "object",
    properties: {
      rois: {
        type: "array",
        items: {
          type: "object",
          properties: {
            x1: { type: "number" },
            y1: { type: "number" },
            x2: { type: "number" },
            y2: { type: "number" },
          },
          required: ["x1", "y1", "x2", "y2"],
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  });
  app.save(setRoiAction);

  // Get ROI action
  let getRoiAction = new Record(actions);
  getRoiAction.set("name", "get-roi");
  getRoiAction.set("params", {
    type: "object",
    properties: {},
    additionalProperties: false,
  });
  app.save(getRoiAction);
});
