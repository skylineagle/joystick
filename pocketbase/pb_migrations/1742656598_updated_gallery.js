/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3598190544")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool391258049",
    "name": "flagged",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3598190544")

  // remove field
  collection.fields.removeById("bool391258049")

  return app.save(collection)
})
