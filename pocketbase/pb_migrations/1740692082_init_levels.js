/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const levels = app.findCollectionByNameOrId("levels");
  const userLevel = new Record(levels);

  userLevel.set("name", "user");
  app.save(userLevel);

  const managerLevel = new Record(levels);

  managerLevel.set("name", "manager");
  app.save(managerLevel);

  const superLevel = new Record(levels);

  superLevel.set("name", "super");

  app.save(superLevel);  
})
