/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2822314327")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_7Rrh3SQuF4` ON `levels` (`name`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2822314327")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
