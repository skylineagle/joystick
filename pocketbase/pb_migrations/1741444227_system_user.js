/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  const systemUser = new Record(users);

  systemUser.set("email", "system@joystick.io");
  systemUser.set("password", "Aa123456");
  systemUser.set("verified", true);
  systemUser.set("name", "System");

  app.save(systemUser);
});
