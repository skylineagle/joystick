/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const actions = app.findCollectionByNameOrId("actions");

  let getFpsAction = new Record(actions);
  getFpsAction.set("name", "get-fps");
  app.save(getFpsAction);

  let setFpsAction = new Record(actions);
  setFpsAction.set("name", "set-fps");
  app.save(setFpsAction);

  //   {
  //   "type": "object",
  //   "properties": {
  //     "bitrate": {
  //       "type": "number"
  //     }
  //   },
  //   "required": [
  //     "bitrate"
  //   ]
  // }
});
