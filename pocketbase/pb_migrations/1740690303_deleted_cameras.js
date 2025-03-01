/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4195113088");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "",
    "deleteRule": "",
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
        "hidden": false,
        "id": "select2546616235",
        "maxSelect": 1,
        "name": "mode",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "live",
          "auto",
          "offline"
        ]
      },
      {
        "hidden": false,
        "id": "json2783094231",
        "maxSize": 0,
        "name": "automation",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json27830942312",
        "maxSize": 0,
        "name": "configuration",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "select2063623452",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "off",
          "on",
          "waiting"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text2710109796",
        "max": 0,
        "min": 0,
        "name": "nickname",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select4093079137",
        "maxSelect": 3,
        "name": "allowed",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "super",
          "manager",
          "user"
        ]
      },
      {
        "hidden": false,
        "id": "bool2761542443",
        "name": "hide",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3552922951",
        "hidden": false,
        "id": "relation3616895705",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "model",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "json3414765911",
        "maxSize": 0,
        "name": "info",
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
    "id": "pbc_4195113088",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_39DaXm7CAh` ON `cameras` (`nickname`)"
    ],
    "listRule": "@request.auth.id != \"\" && (allowed ~ @request.auth.level || @request.auth.level = 'super') && hide != true",
    "name": "cameras",
    "system": false,
    "type": "base",
    "updateRule": "",
    "viewRule": "@request.auth.id != \"\" && (allowed ~ @request.auth.level || @request.auth.level = 'super') && hide != true"
  });

  return app.save(collection);
})
