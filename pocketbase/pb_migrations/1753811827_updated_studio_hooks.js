/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_studio_hooks")

  // add field
  collection.fields.addAt(7, new Field({
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_studio_hooks")

  // remove field
  collection.fields.removeById("select970578272")

  return app.save(collection)
})
