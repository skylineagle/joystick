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

### 📤 **Event Publishing Methods**

- **File-Based Upload**: Simple directory-based file upload system
- **Harvesting**: Automatic polling of device events at configurable intervals
- **Direct Upload**: HTTP POST endpoint for direct event upload with files
- **URL-Based Upload**: Get pre-signed URLs for secure file uploads
- **Flexible Integration**: Support for SCP, CURL, or any HTTP client

### 🎣 **Hook System**

- **Event-Based Hooks**: Execute device actions on specific events
- **Configurable Triggers**: 7 different hook event types
- **Parameter Injection**: Automatic context parameter injection
- **Device-Specific or Global**: Hooks can be device-specific or apply to all devices

## Directory Structure

The service creates the following directory structure for each device:

```
data/gallery/
  ├── device1/
  │   ├── incoming/     # Drop new files here
  │   ├── processed/    # Successfully processed files
  │   └── thumbnails/   # Optional thumbnail files
  └── device2/
      ├── incoming/
      ├── processed/
      └── thumbnails/
```

## File-Based Upload

The simplest way to publish events is by copying files to the device's incoming directory:

1. Get device paths:

```bash
# Get device-specific paths
curl "http://localhost:8001/api/gallery/device123/paths"

# Response:
{
  "success": true,
  "paths": {
    "incoming": "/path/to/data/gallery/device123/incoming",
    "thumbnails": "/path/to/data/gallery/device123/thumbnails"
  }
}
```

2. Upload files:

```bash
# Copy event file
cp event.jpg /path/to/data/gallery/device123/incoming/

# Optional: Copy thumbnail (must have same name as event file)
cp thumb.jpg /path/to/data/gallery/device123/thumbnails/event.jpg
```

The service will:

1. Detect new files in the incoming directory
2. Create gallery records with metadata
3. Move processed files to the processed directory
4. Handle thumbnails if present
5. Trigger appropriate hooks

## API Endpoints

### Media Management

- `GET /api/gallery/:device/paths` - Get device-specific upload paths
- `GET /api/gallery/:device/events` - List media events with type filtering
- `POST /api/gallery/:device/start` - Start media service with flexible config
- `POST /api/gallery/:device/stop` - Stop media service
- `GET /api/gallery/:device/status` - Get service status
- `POST /api/gallery/:device/pull/:eventId` - Pull specific event
- `GET /api/gallery/:device/stats` - Get media statistics with type breakdown
- `DELETE /api/gallery/:device/events/:eventId` - Delete media event

### Event Upload

- `POST /api/gallery/:device/upload` - Direct event upload with files
- `GET /api/gallery/:device/upload-url` - Get pre-signed upload URLs

### Hook Management

- `GET /api/hooks` - List all hooks (optional device filter)
- `POST /api/hooks` - Create new hook
- `PATCH /api/hooks/:id` - Update hook
- `DELETE /api/hooks/:id` - Delete hook
- `GET /api/hooks/events/:eventType` - Get hooks by event type

### File Watcher Management

- `GET /api/watchers` - Get status of all file watchers
- `POST /api/watchers/refresh` - Refresh all file watchers (restart all)
- `POST /api/watchers/sync` - Sync watchers with current device list
- `POST /api/watchers/:deviceId/add` - Add watcher for specific device
- `DELETE /api/watchers/:deviceId` - Remove watcher for specific device
- `GET /api/watchers/:deviceId/status` - Check if watcher is active for device
- `POST /api/watchers/cleanup-orphaned` - Clean up orphaned watchers manually

## Event Upload Examples

### File-Based Upload Script

```bash
#!/bin/bash
EVENT_FILE=$1
THUMB_FILE=$2
DEVICE_ID="device123"

# Get device paths
PATHS=$(curl -s "http://localhost:8001/api/gallery/$DEVICE_ID/paths")
INCOMING_PATH=$(echo $PATHS | jq -r '.paths.incoming')
THUMB_PATH=$(echo $PATHS | jq -r '.paths.thumbnails')

# Copy event file
cp "$EVENT_FILE" "$INCOMING_PATH/"

# Copy thumbnail if provided
if [ -n "$THUMB_FILE" ]; then
  EVENT_NAME=$(basename "$EVENT_FILE")
  THUMB_NAME="${EVENT_NAME%.*}.jpg"
  cp "$THUMB_FILE" "$THUMB_PATH/$THUMB_NAME"
fi
```

### Direct Upload using CURL

```bash
# Upload event with file
curl -X POST "http://localhost:8001/api/gallery/device123/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=capture.jpg" \
  -F "event=@/path/to/capture.jpg" \
  -F "media_type=image" \
  -F "metadata={\"timestamp\":\"2024-03-20T10:00:00Z\"}"

# Upload with thumbnail
curl -X POST "http://localhost:8001/api/gallery/device123/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=video.mp4" \
  -F "event=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumb.jpg" \
  -F "has_thumbnail=true" \
  -F "media_type=video"
```

### URL-Based Upload

```bash
# Get upload URLs
curl "http://localhost:8001/api/gallery/device123/upload-url?filename=event.mp4&thumbnail=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "upload_url": "https://...",
  "thumbnail_upload_url": "https://..."
}

# Upload files to the pre-signed URLs
curl -X PUT "UPLOAD_URL" --upload-file /path/to/event.mp4
curl -X PUT "THUMBNAIL_UPLOAD_URL" --upload-file /path/to/thumb.jpg
```

## File Watcher Management

The Studio service automatically manages file watchers for all devices to monitor incoming files. The file watcher system provides:

### Automatic Management

- **Auto-initialization**: File watchers are automatically created for all devices on service startup
- **Periodic sync**: Watchers are automatically synced with the device list every 5 minutes
- **Graceful cleanup**: Orphaned watchers are automatically cleaned up when devices are deleted
- **Error recovery**: Watchers are automatically restarted if they encounter errors

### Manual Management

You can manually manage file watchers using the API endpoints:

```bash
# Check all watcher statuses
curl "http://localhost:8001/api/watchers"

# Add watcher for a new device
curl -X POST "http://localhost:8001/api/watchers/device123/add"

# Remove watcher for a device
curl -X DELETE "http://localhost:8001/api/watchers/device123"

# Sync watchers with current device list
curl -X POST "http://localhost:8001/api/watchers/sync"

# Check if specific device has active watcher
curl "http://localhost:8001/api/watchers/device123/status"
```

### Cleanup and Maintenance

The service automatically handles cleanup, but you can also trigger manual cleanup:

```bash
# Clean up orphaned watchers manually
curl -X POST "http://localhost:8001/api/watchers/cleanup-orphaned"

# Refresh all watchers (useful after configuration changes)
curl -X POST "http://localhost:8001/api/watchers/refresh"
```

## Hook Event Types

1. **`after_event_pulled`** - After an event is successfully pulled from device
2. **`after_all_events_pulled`** - After all events in a batch are processed
3. \*\*`
