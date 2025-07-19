/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "user = @request.auth.id || @request.auth.role = \"superuser\"",
    "deleteRule": "user = @request.auth.id || @request.auth.role = \"superuser\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation2375276105",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "user",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_2153001328",
        "hidden": false,
        "id": "relation154121870",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "device",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1631579359",
        "max": 0,
        "min": 0,
        "name": "session_id",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select2063623452",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "active",
          "disconnected",
          "terminated"
        ]
      },
      {
        "hidden": false,
        "id": "date3558165700",
        "max": "",
        "min": "",
        "name": "last_activity",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "json373118489",
        "maxSize": 0,
        "name": "terminal_data",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_3579300533",
    "indexes": [],
    "listRule": "user = @request.auth.id || @request.auth.role = \"superuser\"",
    "name": "terminal_sessions",
    "system": false,
    "type": "base",
    "updateRule": "user = @request.auth.id || @request.auth.role = \"superuser\"",
    "viewRule": "user = @request.auth.id || @request.auth.role = \"superuser\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3579300533");

  return app.delete(collection);
})
