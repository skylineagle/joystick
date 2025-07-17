/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("models");

    // Add isAudio field to models collection
    collection.fields.addAt(
      2,
      new Field({
        hidden: false,
        id: "bool_is_audio",
        name: "isAudio",
        presentable: false,
        required: false,
        system: false,
        type: "bool",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("models");

    // Remove isAudio field
    collection.fields.removeById("bool_is_audio");

    return app.save(collection);
  }
);
