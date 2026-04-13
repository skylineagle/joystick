/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("run");

  const field = collection.fields.getByName("target");
  field.values = ["local", "device", "joystick"];

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("run");

  const field = collection.fields.getByName("target");
  field.values = ["local", "device"];

  app.save(collection);
});
