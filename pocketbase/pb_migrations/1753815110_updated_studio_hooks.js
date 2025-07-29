/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_studio_hooks")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select970578272",
    "maxSelect": 1,
    "name": "executionType",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "local",
      "device"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_studio_hooks")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select970578272",
    "maxSelect": 1,
    "name": "exectionType",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "local",
      "device"
    ]
  }))

  return app.save(collection)
})
