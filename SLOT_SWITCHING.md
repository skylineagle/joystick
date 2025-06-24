# Automatic Slot Switching System

This document describes the automatic slot switching system that provides failover capabilities for devices with dual connection slots.

## Overview

The slot switching system allows devices to automatically failover between primary and secondary network connections when health checks detect connectivity issues. This ensures continuous operation even when one connection fails.

## Components

### 1. Database Schema Changes

#### New Action: `slot-check`

- **Name**: `slot-check`
- **Purpose**: Defines the command used for health checks on device connections
- **Parameters**: None (uses device-specific configuration)

#### Device Information Updates

- **New Field**: `autoSlotSwitch` (boolean)
- **Purpose**: Enables/disables automatic slot switching for the device
- **Default**: `false`

### 2. Switcher Service Enhancements

The switcher service (`packages/switcher`) has been enhanced with health check capabilities:

#### Health Check Loop

- Runs every 30 seconds (configurable via `HEALTH_CHECK_INTERVAL`)
- Checks devices with `autoSlotSwitch` enabled and configured secondary slots
- Uses the `slot-check` action to test connectivity

#### Failover Logic

- Monitors both primary and secondary slots
- Switches to alternate slot after 2 consecutive failures
- Automatically switches back when original slot recovers
- Updates device `activeSlot` field to trigger stream URL updates

#### New API Endpoints

##### Manual Slot Switching

```http
POST /api/slot/:deviceId/:slot
```

- Manually switch device to specific slot (`primary` or `secondary`)
- Validates slot availability before switching

##### Health Check Status

```http
GET /api/health/:deviceId?
```

- Get health status for specific device or all monitored devices
- Returns slot health, active slot, last check time, and failure count

##### Manual Health Check

```http
POST /api/health/check
```

- Manually trigger health checks for all monitored devices

### 3. Frontend Integration

#### Configuration UI

- Added checkbox in device configuration: "Enable automatic slot switching"
- Located in the secondary slot configuration section
- Only visible when secondary slot is configured

#### Health Status Indicator

- New `SlotHealthIndicator` component shows real-time slot status
- Displays active slot with visual indicators
- Shows health status of both primary and secondary slots
- Auto-refreshes every 30 seconds
- Integrated into device actions area

### 4. PocketBase Integration

The existing PocketBase hook (`devices.pb.js`) automatically handles slot changes:

- Detects `activeSlot` field changes
- Updates stream URLs using existing template system
- Sends notifications when slots are switched

## Configuration

### Environment Variables

The switcher service supports the following environment variables:

```bash
# Health check configuration
HEALTH_CHECK_ENABLED=true          # Enable/disable health checks
HEALTH_CHECK_INTERVAL=30000        # Check interval in milliseconds
HEALTH_CHECK_TIMEOUT=5000          # Timeout for each check in milliseconds

# API configuration
JOYSTICK_API_URL=http://joystick:8000
JOYSTICK_API_KEY=dev-api-key-12345
POCKETBASE_URL=http://pocketbase:8090
```

### Device Configuration

To enable automatic slot switching for a device:

1. Configure primary connection (host, phone)
2. Enable "Configure Secondary Connection Slot"
3. Configure secondary connection (secondSlotHost, secondSlotPhone)
4. Enable "Enable automatic slot switching"
5. Save configuration

## How It Works

### Health Check Process

1. **Service Startup**: Switcher service starts health check loop
2. **Device Discovery**: Finds devices with `autoSlotSwitch=true` and configured secondary slots
3. **Health Testing**: Runs `slot-check` action against both primary and secondary hosts
4. **Failure Detection**: Tracks consecutive failures for current active slot
5. **Automatic Switching**: Switches to healthy alternate slot after 2 failures
6. **Database Update**: Updates device `activeSlot` field
7. **Stream Update**: PocketBase hook detects change and updates stream configuration
8. **Notification**: Users receive notification about slot change

### Failover Scenarios

#### Primary Slot Failure

1. Primary slot health check fails
2. Failure counter increments
3. After 2 failures, system checks secondary slot health
4. If secondary is healthy, switches to secondary slot
5. Stream URLs updated to use secondary host
6. Health checks continue on both slots

#### Recovery

1. Original failed slot becomes healthy again
2. System can switch back to preferred slot (typically primary)
3. Seamless transition with minimal interruption

## Testing

Use the provided test script to verify functionality:

```bash
./test-slot-switching.sh
```

This script tests:

- Service health endpoints
- Manual slot switching
- Health check triggers
- Device status queries

## Monitoring

### Logs

The switcher service provides detailed logging:

- Health check results
- Slot switching events
- Failure tracking
- API requests

### Health Status API

Monitor system status via the health API:

```bash
curl http://localhost:8080/api/health
```

### Frontend Indicators

- Real-time slot health status in device list
- Visual indicators for active/inactive slots
- Failure count and last check time
- Auto-refresh capabilities

## Troubleshooting

### Common Issues

1. **Health checks not running**

   - Verify `HEALTH_CHECK_ENABLED=true`
   - Check switcher service logs
   - Ensure devices have `autoSlotSwitch` enabled

2. **Slot switching not working**

   - Verify secondary slot configuration
   - Check `slot-check` action exists in database
   - Verify API connectivity between services

3. **UI not showing slot status**
   - Check switcher service health endpoint
   - Verify device has both slots configured
   - Ensure auto slot switching is enabled

### Debug Commands

```bash
# Check switcher service health
curl http://localhost:8080/api/health

# Check specific device health
curl http://localhost:8080/api/health/DEVICE_ID

# Trigger manual health check
curl -X POST http://localhost:8080/api/health/check

# Manual slot switch
curl -X POST http://localhost:8080/api/slot/DEVICE_ID/secondary
```

## Security Considerations

- Health checks use the same authentication as other device actions
- API key required for inter-service communication
- Slot switching requires appropriate permissions
- All changes are logged and auditable

## Performance Impact

- Health checks run every 30 seconds by default
- Minimal network overhead (simple ping-like tests)
- Failover typically completes within 1-2 check cycles
- No impact on streaming performance during normal operation
