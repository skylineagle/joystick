/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const actionsCollection = app.findCollectionByNameOrId("actions");

  const sendSmsAction = new Record(actionsCollection);
  sendSmsAction.set("name", "send-sms");

  app.save(sendSmsAction);
});
