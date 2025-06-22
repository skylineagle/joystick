# Joystick API Authentication

The Joystick API now requires authentication for most endpoints. Here are the different ways to authenticate:

## Authentication Methods

### 1. JWT Token (Production)

Use the JWT token from PocketBase authentication:

```bash
# Get token from PocketBase login
curl -X POST http://localhost:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity": "user@example.com", "password": "password"}'

# Use token in API requests
curl -X POST http://localhost:8000/api/run/device123/action123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'
```

### 2. Query Parameter Token

You can also pass the token as a query parameter:

```bash
curl -X POST "http://localhost:8000/api/run/device123/action123?token=YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'
```

### 3. API Key (Development/Testing)

For testing with Postman or curl, use the development API key:

```bash
curl -X POST http://localhost:8000/api/run/device123/action123 \
  -H "X-API-Key: dev-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'
```

You can also set a custom API key via environment variable:

```bash
export JOYSTICK_API_KEY=your-custom-api-key
```

## Endpoints and Required Permissions

### Device Control

- `POST /api/run/:device/:action` - Requires authentication + device access
- `GET /api/ping/:device` - Requires authentication + device access

### Sensor Data

- `GET /api/cpsi` - Requires `device-cpsi` permission
- `GET /api/battery` - Requires `device-battery` permission
- `GET /api/gps` - Requires `device-gps` permission
- `GET /api/imu` - Requires `device-imu` permission

### Notifications

- `POST /api/notifications/send` - Requires `notifications` permission

### Public Endpoints

- `GET /api/health` - No authentication required
- `GET /` - No authentication required

## Device Access Control

Users can only control devices they have access to. Device access is controlled by the `allow` field in the devices collection, which contains an array of user IDs.

## Permission System

The API uses a feature-based permission system. Users must have specific permissions in the `permissions` collection to access certain endpoints.

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Missing required permissions: device-cpsi"
}
```

```json
{
  "success": false,
  "error": "Access denied: You don't have permission to control this device"
}
```

## Swagger Documentation

Visit `http://localhost:8000/swagger` to see the interactive API documentation with authentication examples.
