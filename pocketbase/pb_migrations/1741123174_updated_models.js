/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3552922951")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json2483023793",
    "maxSize": 0,
    "name": "mode_configs",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3552922951")

  // remove field
  collection.fields.removeById("json2483023793")

  return app.save(collection)
})
