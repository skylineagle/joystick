/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1599127217")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool3123742823",
    "name": "automate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1599127217")

  // remove field
  collection.fields.removeById("bool3123742823")

  return app.save(collection)
})
