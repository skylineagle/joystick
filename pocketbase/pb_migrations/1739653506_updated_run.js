/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1599127217")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1181691900",
    "maxSelect": 1,
    "name": "target",
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
  const collection = app.findCollectionByNameOrId("pbc_1599127217")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1181691900",
    "maxSelect": 1,
    "name": "target",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "local",
      "device"
    ]
  }))

  return app.save(collection)
})
