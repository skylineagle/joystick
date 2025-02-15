/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3552922951")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json2412646131",
    "maxSize": 0,
    "name": "params",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3552922951")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json2412646131",
    "maxSize": 0,
    "name": "params",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
