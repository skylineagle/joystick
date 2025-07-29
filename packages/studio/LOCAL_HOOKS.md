# Local Hooks for Studio Service

The Studio service now supports local hooks that execute commands directly on the Studio container instead of on remote devices. This is useful for file operations, logging, and other local tasks.

## Overview

Local hooks run commands directly on the Studio service using Bun's `$` template literal, while device hooks continue to run commands on remote devices via SSH.

## Hook Configuration

### Creating a Local Hook

```bash
curl -X POST "http://localhost:8001/api/hooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hookName": "copy-pulled-file",
    "eventType": "after_event_pulled",
    "actionId": "ACTION_ID",
    "executionType": "local",
    "parameters": {
      "command": "cp {{sourcePath}} {{destinationPath}} && echo \"Copied {{eventId}} to {{destinationPath}}\""
    },
    "enabled": true
  }'
```

### Key Differences

- **`executionType: "local"`** - Database column that specifies the hook runs locally
- **`parameters.command`** - The shell command to execute (instead of using action.command)
- **Template Variables** - Use the same template variables as device hooks

## Database Schema

The `studio_hooks` collection now includes:

- `hook_name` - Name of the hook
- `event_type` - When to trigger the hook
- `device` - Optional device ID (null for global hooks)
- `action` - Action ID (required but not used for local hooks)
- `executionType` - "local" or "device" (new database column)
- `parameters` - JSON field containing the command and other parameters
- `enabled` - Whether the hook is active

## Available Template Variables

For local hooks, you have access to these template variables:

- `{{deviceId}}` - The device ID
- `{{eventId}}` - The event ID (filename without extension)
- `{{timestamp}}` - Current timestamp
- `{{date}}` - Current date in YYYY-MM-DD format
- `{{eventPath}}` - The original event path
- `{{eventName}}` - The event name
- `{{mediaType}}` - Media type (image, video, audio, etc.)
- `{{hasThumb}}` - Whether the event has a thumbnail
- `{{fileSize}}` - File size in bytes
- `{{extension}}` - File extension
- `{{sourcePath}}` - Full path to the processed file in Studio
- `{{thumbnailPath}}` - Full path to the thumbnail (if exists)

## Example Use Cases

### 1. Copy Files to Designated Path

```bash
curl -X POST "http://localhost:8001/api/hooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hookName": "archive-pulled-files",
    "eventType": "after_event_pulled",
    "actionId": "ACTION_ID",
    "executionType": "local",
    "parameters": {
      "command": "mkdir -p /archive/{{date}}/{{deviceId}} && cp {{sourcePath}} /archive/{{date}}/{{deviceId}}/{{eventId}}.{{extension}}"
    },
    "enabled": true
  }'
```

### 2. Copy with Logging

```bash
curl -X POST "http://localhost:8001/api/hooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hookName": "copy-with-log",
    "eventType": "after_event_pulled",
    "actionId": "ACTION_ID",
    "executionType": "local",
    "parameters": {
      "command": "cp {{sourcePath}} /backup/{{deviceId}}/{{eventId}}.{{extension}} && echo \"$(date): Copied {{eventId}} ({{fileSize}} bytes) from {{deviceId}}\" >> /var/log/file-copies.log"
    },
    "enabled": true
  }'
```

### 3. Copy by Media Type

```bash
curl -X POST "http://localhost:8001/api/hooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hookName": "organize-by-type",
    "eventType": "after_event_pulled",
    "actionId": "ACTION_ID",
    "executionType": "local",
    "parameters": {
      "command": "mkdir -p /organized/{{mediaType}}/{{deviceId}} && cp {{sourcePath}} /organized/{{mediaType}}/{{deviceId}}/{{eventId}}.{{extension}}"
    },
    "enabled": true
  }'
```

### 4. Copy with Compression

```bash
curl -X POST "http://localhost:8001/api/hooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hookName": "compress-and-copy",
    "eventType": "after_event_pulled",
    "actionId": "ACTION_ID",
    "executionType": "local",
    "parameters": {
      "command": "gzip -c {{sourcePath}} > /compressed/{{deviceId}}/{{eventId}}.{{extension}}.gz"
    },
    "enabled": true
  }'
```

### 5. Copy with Thumbnail

```bash
curl -X POST "http://localhost:8001/api/hooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hookName": "copy-with-thumbnail",
    "eventType": "after_event_pulled",
    "actionId": "ACTION_ID",
    "executionType": "local",
    "parameters": {
      "command": "mkdir -p /gallery/{{deviceId}} && cp {{sourcePath}} /gallery/{{deviceId}}/{{eventId}}.{{extension}} && {{#if hasThumb}}cp {{thumbnailPath}} /gallery/{{deviceId}}/{{eventId}}_thumb.jpg{{/if}}"
    },
    "enabled": true
  }'
```

## Device-Specific Hooks

You can create hooks that only apply to specific devices:

```bash
curl -X POST "http://localhost:8001/api/hooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "hookName": "device123-backup",
    "eventType": "after_event_pulled",
    "deviceId": "device123",
    "actionId": "ACTION_ID",
    "executionType": "local",
    "parameters": {
      "command": "cp {{sourcePath}} /device123-backup/{{eventId}}.{{extension}}"
    },
    "enabled": true
  }'
```

## Managing Hooks

### List All Hooks

```bash
curl "http://localhost:8001/api/hooks"
```

### List Local Hooks Only

```bash
curl "http://localhost:8001/api/hooks" | jq '.hooks[] | select(.execution_type == "local")'
```

### Update Hook

```bash
curl -X PATCH "http://localhost:8001/api/hooks/HOOK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "parameters": {
      "command": "cp {{sourcePath}} /new-destination/{{eventId}}.{{extension}}"
    }
  }'
```

### Delete Hook

```bash
curl -X DELETE "http://localhost:8001/api/hooks/HOOK_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Important Notes

1. **File Paths**: Local hooks run inside the Studio container, so use container paths
2. **Permissions**: Ensure the Studio container has write permissions to destination directories
3. **Error Handling**: Commands that fail will be logged but won't stop other hooks
4. **Security**: Be careful with shell commands, especially when using user input
5. **Performance**: Local hooks are faster than device hooks since they don't require SSH

## Troubleshooting

### Check Hook Logs

```bash
# View Studio service logs
docker logs studio-service

# Filter for hook execution
docker logs studio-service | grep "hook"
```

### Test Command Manually

```bash
# Enter the Studio container
docker exec -it studio-service sh

# Test your command manually
sh -c "your_command_here"
```

### Common Issues

1. **Permission Denied**: Ensure destination directories exist and are writable
2. **File Not Found**: Check that `{{sourcePath}}` points to the correct location
3. **Command Not Found**: Use full paths for commands or ensure they're available in the container
