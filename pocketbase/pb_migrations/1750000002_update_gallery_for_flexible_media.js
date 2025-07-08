/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3598190544");

    // Update thumbnail field to be optional and support any file type
    unmarshal(
      {
        hidden: false,
        id: "file3277268710",
        maxSelect: 1,
        maxSize: 0,
        mimeTypes: [],
        name: "thumbnail",
        presentable: false,
        protected: false,
        required: false,
        system: false,
        thumbs: [],
        type: "file",
      },
      collection.fields.getById("file3277268710")
    );

    // Add media_type field to identify file types
    collection.fields.addAt(
      7,
      new Field({
        hidden: false,
        id: "text_media_type",
        name: "media_type",
        type: "text",
        required: false,
        presentable: false,
        system: false,
        autogeneratePattern: "",
        max: 50,
        min: 0,
        pattern: "",
      })
    );

    // Add has_thumbnail field to track if thumbnail exists
    collection.fields.addAt(
      8,
      new Field({
        hidden: false,
        id: "bool_has_thumbnail",
        name: "has_thumbnail",
        type: "bool",
        required: false,
        presentable: false,
        system: false,
      })
    );

    // Add metadata field for flexible event information
    collection.fields.addAt(
      9,
      new Field({
        hidden: false,
        id: "json_metadata",
        name: "metadata",
        type: "json",
        required: false,
        presentable: false,
        system: false,
        maxSize: 0,
      })
    );

    // Add file_size field
    collection.fields.addAt(
      10,
      new Field({
        hidden: false,
        id: "number_file_size",
        name: "file_size",
        type: "number",
        required: false,
        presentable: false,
        system: false,
        min: 0,
        max: null,
        noDecimal: true,
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3598190544");

    // Revert thumbnail field requirements
    unmarshal(
      {
        hidden: false,
        id: "file3277268710",
        maxSelect: 1,
        maxSize: 0,
        mimeTypes: [
          "image/jpeg",
          "image/png",
          "image/svg+xml",
          "image/gif",
          "image/webp",
        ],
        name: "thumbnail",
        presentable: false,
        protected: false,
        required: true,
        system: false,
        thumbs: [],
        type: "file",
      },
      collection.fields.getById("file3277268710")
    );

    // Remove new fields
    collection.fields.removeById("text_media_type");
    collection.fields.removeById("bool_has_thumbnail");
    collection.fields.removeById("json_metadata");
    collection.fields.removeById("number_file_size");

    return app.save(collection);
  }
);
