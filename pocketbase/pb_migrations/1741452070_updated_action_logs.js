/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1990155814")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number2314073787",
    "max": null,
    "min": null,
    "name": "execution_time",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1990155814")

  // remove field
  collection.fields.removeById("number2314073787")

  return app.save(collection)
})
