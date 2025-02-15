/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1599127217")

  // remove field
  collection.fields.removeById("editor2395663060")

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2395663060",
    "max": 0,
    "min": 1,
    "name": "command",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1599127217")

  // add field
  collection.fields.addAt(2, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor2395663060",
    "maxSize": 0,
    "name": "command",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "editor"
  }))

  // remove field
  collection.fields.removeById("text2395663060")

  return app.save(collection)
})
