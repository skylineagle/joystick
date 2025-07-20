/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3552922951")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json3904631854",
    "maxSize": 0,
    "name": "temp_levels",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3552922951")

  // remove field
  collection.fields.removeById("json3904631854")

  return app.save(collection)
})
