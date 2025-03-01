/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1121724375")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_JqrYily3I0` ON `rules` (`allow`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2822314327",
    "hidden": false,
    "id": "relation2118729960",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "allow",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2484833797",
    "hidden": false,
    "id": "relation1204587666",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "action",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1121724375")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2822314327",
    "hidden": false,
    "id": "relation2118729960",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "allow",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2484833797",
    "hidden": false,
    "id": "relation1204587666",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "action",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
