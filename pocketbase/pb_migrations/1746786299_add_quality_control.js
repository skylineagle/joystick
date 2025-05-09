/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const actions = app.findCollectionByNameOrId("actions");

  let getQualityAction = new Record(actions);
  getQualityAction.set("name", "get-quality");
  app.save(getQualityAction);

  let setQualityAction = new Record(actions);
  setQualityAction.set("name", "set-quality");
  app.save(setQualityAction);
  //   {
  //   "type": "object",
  //   "properties": {
  //     "quality": {
  //       "type": "number"
  //     },
  //     "fps": {
  //       "type": "number"
  //     }
  //   },
  //   "required": [
  //     "quality",
  //     "fps"
  //   ]
  // }
});
