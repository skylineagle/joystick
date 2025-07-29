/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_studio_hooks")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select_event_type",
    "maxSelect": 1,
    "name": "event_type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "after_event_pulled",
      "after_all_events_pulled",
      "after_event_created",
      "after_event_deleted",
      "before_event_pull",
      "after_gallery_start",
      "after_gallery_stop",
      "after_file_downloaded"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_studio_hooks")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select_event_type",
    "maxSelect": 1,
    "name": "event_type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "after_event_pulled",
      "after_all_events_pulled",
      "after_event_created",
      "after_event_deleted",
      "before_event_pull",
      "after_gallery_start",
      "after_gallery_stop"
    ]
  }))

  return app.save(collection)
})
