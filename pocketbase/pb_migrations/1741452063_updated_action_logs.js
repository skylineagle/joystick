/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1990155814")

  // remove field
  collection.fields.removeById("date2314073787")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1990155814")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "date2314073787",
    "max": "",
    "min": "",
    "name": "execution_time",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
