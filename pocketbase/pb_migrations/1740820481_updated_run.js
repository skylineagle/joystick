/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1599127217")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json110315774",
    "maxSize": 0,
    "name": "parameters",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1599127217")

  // remove field
  collection.fields.removeById("json110315774")

  return app.save(collection)
})
