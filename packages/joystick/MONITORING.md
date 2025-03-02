# Joystick Service Monitoring System

This document describes the monitoring system implemented for the Joystick service, which logs all actions with detailed user and device information.

## Overview

The monitoring system captures detailed information about each action performed by the Joystick service, including:

- User who performed the action (using PocketBase auth)
- Device on which the action was performed
- Action details and parameters
- Result of the action (success/failure)
- Timestamp and execution time
- Request metadata (IP address, user agent)

All logs are stored in the `action_logs` collection in PocketBase for easy querying and analysis. Logs can also be written to a file in an enhanced format with full relation objects.

## Database vs File Logs

The monitoring system maintains two different log formats:

### Database Logs

Stored in the PocketBase `action_logs` collection, these logs use reference IDs for related entities:

- `user`: Contains the user ID
- `device`: Contains the device ID
- `action`: Contains the action ID

This normalized structure allows for efficient storage and querying in the database.

### File Logs

Written to a log file when `MONITOR_LOG` is set, these logs embed the full objects:

- `user`: Contains the full user object
- `device`: Contains the full device object with expanded data
- `action`: Contains the full action object

This denormalized structure provides complete context in a single log entry, making the logs
self-contained for external processing and analysis without requiring additional database lookups.

## Log Structure

Each action log includes:

- `timestamp`: When the action was performed
- `user`: Who performed the action (PocketBase user ID)
- `device`: Which device was used (PocketBase device ID)
- `action`: What action was executed (PocketBase action ID)
- `parameters`: Parameters used for the action (JSON)
- `result`: The result of the action (JSON with success/failure status)
- `ip_address`: The IP address of the requester
- `user_agent`: The user agent of the requester
- `execution_time`: How long the action took to execute (ms)

### Enhanced File Logs

When writing to a file, logs are enriched with full relation objects:

- `user_details`: Full user object with sensitive fields removed (password, tokenKey)
- `device_details`: Full device object with expanded related data
- `action_details`: Full action object with all properties

This provides complete context for each log entry, making log analysis more efficient without requiring additional database queries.

## Logging Methods

The enhanced logger provides several methods for logging actions:

### Direct Logging

```typescript
// Start timing an action
enhancedLogger.startActionTimer();

// Set logging context (can be called multiple times to add more context)
enhancedLogger.setContext({
  userId: "user123",
  deviceId: "device456",
  actionId: "action789",
  parameters: { param1: "value1" },
});

// Log the action to the database
await enhancedLogger.logActionToDb();
```

### Helper Methods

```typescript
// Log a command action
await enhancedLogger.logCommandAction({
  userId: "user123",
  deviceId: "device456",
  actionId: "action789",
  parameters: { param1: "value1" },
  result: { data: "result" },
  success: true, // defaults to true
});

// Log a system action
await enhancedLogger.logSystemAction({
  actionName: "heartbeat", // action name in PocketBase
  details: { service: "joystick" },
  success: true, // defaults to true
});

// Log directly to file without requiring PocketBase
await enhancedLogger.logToFileOnly({
  action: "custom_action",
  userId: "user123", // optional, defaults to "system"
  deviceId: "device456", // optional, defaults to "system"
  parameters: { param1: "value1" }, // optional
  result: { data: "result" }, // optional
  success: true, // optional, defaults to true
});
```

## Authentication

The monitoring system automatically extracts user information from authentication tokens in the request headers. If a valid token is present, the user ID is included in the logs.

## Console Logging

In addition to storing logs in PocketBase, the system also logs to the console using Pino with pretty formatting:

```typescript
enhancedLogger.debug("Debug message");
enhancedLogger.info({ key: "value" }, "Info message");
enhancedLogger.warn("Warning message");
enhancedLogger.error({ error }, "Error message");
```

## File Logging

The system can also write logs to a file as single-line JSON entries. This is useful for log shipping or external analysis.

### Configuration

Set the following environment variables to configure file logging:

```bash
# Path where logs should be written
export MONITOR_LOG=/app/logs/joystick-actions.log

# Enable/disable expanded logging with relation objects (defaults to true)
export EXPANDED_LOGGING=true

# Performance threshold in ms - warns if logging exceeds this time (defaults to 100ms)
export LOG_PERF_THRESHOLD=100
```

Or when running with Docker Compose:

```yaml
environment:
  - MONITOR_LOG=/app/logs/joystick-actions.log
  - EXPANDED_LOGGING=true
  - LOG_PERF_THRESHOLD=100
```

### Log Format

Each log entry is written as a single-line JSON object with embedded objects for users, devices, and actions:

```json
{
  "timestamp": "2023-05-15T12:34:56.789Z",
  "parameters": { "mode": "off" },
  "result": { "success": true, "output": "" },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "execution_time": 123,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "User Name"
  },
  "device": {
    "id": "device456",
    "name": "Device Name",
    "status": "off",
    "configuration": {
      /* device configuration */
    },
    "expand": {
      "device": {
        /* expanded device data */
      }
    }
  },
  "action": {
    "id": "action789",
    "name": "set-mode"
  }
}
```

Note that:

- The `user` field contains the user object (with sensitive fields removed) instead of just the ID
- The `device` field contains the complete device object with expanded data
- The `action` field contains the action object instead of just the ID

This structure provides complete context in a single log entry, making logs self-contained and easier to analyze.

### Performance Monitoring

The logger includes built-in performance monitoring:

- Tracks time spent fetching relation data
- Tracks total logging time including file operations
- Warns if logging operations exceed the configured threshold
- Automatically logs performance warnings to the console

This helps identify when logging might be impacting application performance, allowing you to adjust settings as needed.

### Implementation Details

The file logging system uses efficient file operations optimized for large log files:

- Log directories are automatically created if they don't exist
- Logs are efficiently appended to the file using Node.js fs.appendFileSync
- Reading the entire file is avoided for better performance with large log files
- Each log entry is a complete JSON object on a single line with full relation data
- Error handling ensures the application continues running even if logging fails
- Performance is monitored to prevent logging from impacting application responsiveness

This implementation is efficient for:

1. **High-volume logging** - Append-only operations are more efficient
2. **Large log files** - No need to read the entire file before appending
3. **Centralized log analysis** - Complete context included in each log entry

The system makes it easy to integrate with log shipping tools like Fluentd, Logstash, or vector.dev, which can tail the log file and forward entries to centralized logging systems.

### Log Rotation

For production use, consider setting up log rotation for the log file to prevent it from growing too large:

```bash
# Example using logrotate
cat > /etc/logrotate.d/joystick << EOF
/app/logs/joystick-actions.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
  create 644 root root
}
EOF
```

## Querying Logs

You can query logs from the PocketBase API:

```typescript
// Get all logs for a specific user
const userLogs = await pb.collection("action_logs").getList(1, 50, {
  filter: `user = "${userId}"`,
  sort: "-created",
});

// Get logs for a specific device
const deviceLogs = await pb.collection("action_logs").getList(1, 50, {
  filter: `device = "${deviceId}"`,
  sort: "-created",
});

// Get logs for a specific action
const actionLogs = await pb.collection("action_logs").getList(1, 50, {
  filter: `action = "${actionId}"`,
  sort: "-created",
});

// Get failed actions
const failedLogs = await pb.collection("action_logs").getList(1, 50, {
  filter: `result.success = false`,
  sort: "-created",
});
```

## Future Enhancements

Potential future enhancements:

1. Real-time alerts for failed actions
2. Monitoring dashboard for visualizing action patterns
3. Anomaly detection for unusual action patterns
4. Performance metrics for slow-running actions
5. Data retention policies for log management
