/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  const userRecord = new Record(users);

  userRecord.set("email", "user@switcher.io");
  userRecord.set("password", "Aa123456");
  userRecord.set("verified", true);
  userRecord.set("name", "User");
  userRecord.set("level", "user");

  app.save(userRecord);

  const managerUserRecord = new Record(users);

  managerUserRecord.set("email", "manager@switcher.io");
  managerUserRecord.set("password", "Password1!");
  managerUserRecord.set("verified", true);
  managerUserRecord.set("name", "Manager");
  managerUserRecord.set("level", "manager");

  app.save(managerUserRecord);

  const adminUserRecord = new Record(users);

  adminUserRecord.set("email", "admin@switcher.io");
  adminUserRecord.set("password", "Password2@");
  adminUserRecord.set("verified", true);
  adminUserRecord.set("name", "Admin");
  adminUserRecord.set("level", "super"); 

  app.save(adminUserRecord);
})
