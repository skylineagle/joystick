# Enhanced Studio Service

The Studio service has been enhanced to support flexible media management beyond just images and videos. It now supports any type of media files with optional thumbnails and configurable device actions.

## Features

### 🎯 **Flexible Media Support**

- **Any File Type**: Support for images, videos, audio, documents, and any other file type
- **Optional Thumbnails**: Works with devices that don't generate thumbnails
- **Media Type Detection**: Automatic classification based on file extensions
- **File Size Tracking**: Monitors file sizes and metadata

### 🔧 **Dynamic Device Actions**

- **Configurable Actions**: Use any pocketbase-configured action instead of hardcoded ones
- **Fallback Actions**: Tries multiple action names (list-events, list-files, list-media)
- **Parameter Templating**: Support for dynamic parameters in action commands
- **Flexible Output Parsing**: Handles various output formats from devices

### 🎣 **Hook System**

- **Event-Based Hooks**: Execute device actions on specific events
- **Configurable Triggers**: 7 different hook event types
- **Parameter Injection**: Automatic context parameter injection
- **Device-Specific or Global**: Hooks can be device-specific or apply to all devices

## API Endpoints

### Media Management

- `GET /api/media/:device/events` - List media events with type filtering
- `POST /api/media/:device/start` - Start media service with flexible config
- `POST /api/media/:device/stop` - Stop media service
- `GET /api/media/:device/status` - Get service status
- `POST /api/media/:device/pull/:eventId` - Pull specific event
- `GET /api/media/:device/stats` - Get media statistics with type breakdown
- `DELETE /api/media/:device/events/:eventId` - Delete media event

### Hook Management

- `GET /api/hooks` - List all hooks (optional device filter)
- `POST /api/hooks` - Create new hook
- `PATCH /api/hooks/:id` - Update hook
- `DELETE /api/hooks/:id` - Delete hook
- `GET /api/hooks/events/:eventType` - Get hooks by event type

## Hook Event Types

1. **`after_event_pulled`** - After an event is successfully pulled from device
2. **`after_all_events_pulled`** - After all events in a batch are processed
3. **`after_event_created`** - After a new event is discovered and stored
4. **`after_event_deleted`** - After an event is deleted from the system
5. **`before_event_pull`** - Before pulling an event from device
6. **`after_gallery_start`** - After media service starts for a device
7. **`after_gallery_stop`** - After media service stops for a device

## Configuration Examples

### Start Media Service with Custom Types

```json
{
  "interval": 30,
  "autoPull": true,
  "supportedTypes": ["image", "video", "audio"],
  "generateThumbnails": false
}
```

### Create a Hook

```json
{
  "hookName": "Backup after pull",
  "eventType": "after_event_pulled",
  "deviceId": "device123",
  "actionId": "backup-action-id",
  "parameters": {
    "destination": "/backup/{{deviceId}}/{{eventId}}"
  },
  "enabled": true
}
```

## Device Action Requirements

### List Actions (one of these should be configured):

- `list-events` - Original action name
- `list-files` - Alternative action name
- `list-media` - Alternative action name

### Delete Actions (optional, one of these):

- `delete-event` - Original action name
- `remove-file` - Alternative action name
- `cleanup` - Alternative action name

### Expected Output Format

```
/path/to/file1.jpg	/path/to/thumb1.jpg	1024	{"meta": "data"}
/path/to/file2.mp4		2048
/path/to/file3.pdf
```

Format: `path[TAB]thumbnail[TAB]size[TAB]metadata`

- **path**: Required - full path to the media file
- **thumbnail**: Optional - path to thumbnail file
- **size**: Optional - file size in bytes
- **metadata**: Optional - JSON metadata

## Frontend Enhancements

### Media Type Filtering

- Visual media type filters in gallery view
- Icons for different media types (🖼️ 🎥 🎵 📄)
- Support for files without thumbnails

### Enhanced Event Display

- Fallback icons for files without thumbnails
- Media type indicators
- File size information
- Download links for non-previewable files

### Statistics Dashboard

- Media type breakdown in stats
- Visual indicators for different file types
- Enhanced filtering and sorting

## Backward Compatibility

All existing `/api/gallery/*` endpoints remain functional and use the new media service internally. The original GalleryService is preserved for compatibility.

## Migration Guide

1. **Database**: Run the new migrations to add media type support
2. **Actions**: Ensure devices have list actions configured (list-events, list-files, or list-media)
3. **Hooks**: Optionally configure hooks for automated workflows
4. **Frontend**: The UI automatically supports new media types

## Examples

### Audio File Processing

```bash
# Device action output
/recordings/audio1.mp3		1048576	{"duration": 180}
/recordings/audio2.wav		2097152	{"duration": 240}
```

### Document Management

```bash
# Device action output
/documents/report.pdf	/thumbs/report.jpg	524288	{"pages": 10}
/documents/data.xlsx		1048576	{"sheets": 3}
```

The enhanced studio service provides a flexible foundation for any media management workflow while maintaining simplicity and backward compatibility.
