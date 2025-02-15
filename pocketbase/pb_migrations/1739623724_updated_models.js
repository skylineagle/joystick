/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3552922951")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select4041850396",
    "maxSelect": 1,
    "name": "stream",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "mediamtx",
      "ws"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3552922951")

  // remove field
  collection.fields.removeById("select4041850396")

  return app.save(collection)
})
