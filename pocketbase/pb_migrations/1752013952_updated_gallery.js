/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3598190544")

  // remove field
  collection.fields.removeById("bool4152891652")

  // add field
  collection.fields.addAt(11, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation4152891652",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "viewed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3598190544")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool4152891652",
    "name": "viewed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // remove field
  collection.fields.removeById("relation4152891652")

  return app.save(collection)
})
