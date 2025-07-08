/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_2153001328");

    // add field
    collection.fields.addAt(
      14,
      new Field({
        hidden: false,
        id: "bool1725414313",
        name: "harvesting",
        presentable: false,
        required: false,
        system: false,
        type: "bool",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_2153001328");

    // remove field
    collection.fields.removeById("bool1725414313");

    return app.save(collection);
  }
);
