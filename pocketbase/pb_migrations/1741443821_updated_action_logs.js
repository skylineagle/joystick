/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1990155814")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json325763347",
    "maxSize": 0,
    "name": "result",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1990155814")

  // remove field
  collection.fields.removeById("json325763347")

  return app.save(collection)
})
