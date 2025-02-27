/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2153001328")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json3379797230",
    "maxSize": 0,
    "name": "automation",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json695801987",
    "maxSize": 0,
    "name": "information",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2153001328")

  // remove field
  collection.fields.removeById("json3379797230")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json695801987",
    "maxSize": 0,
    "name": "information",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
