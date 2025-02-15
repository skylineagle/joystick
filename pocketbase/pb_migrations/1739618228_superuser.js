/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  let superusers = app.findCollectionByNameOrId("_superusers");

  let record = new Record(superusers);

  // note: the values can be eventually loaded via $os.getenv(key)
  // or from a special local config file
  record.set("email", "admin@joystick.io");
  record.set("password", "Aa123456");

  app.save(record);
});
