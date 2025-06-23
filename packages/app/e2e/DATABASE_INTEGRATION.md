# Database Integration for E2E Tests

## Overview

The E2E test suite now includes full database integration using PocketBase, with automatic seeding and cleanup to ensure consistent test data across all test runs.

## Architecture

### Components

1. **Database Helper (`helpers/db-helper.ts`)**

   - Manages PocketBase connection and authentication
   - Provides seeding and cleanup functionality
   - Handles test data creation with proper error handling

2. **Global Setup (`setup/global-setup.ts`)**

   - Runs before all tests
   - Seeds fresh test data
   - Verifies PocketBase connection

3. **Global Teardown (`setup/global-teardown.ts`)**

   - Runs after all tests complete
   - Cleans up test data
   - Disconnects from PocketBase

4. **Playwright Configuration**
   - Configured to use global setup and teardown
   - Ensures database operations happen at the right time

## Test Data

### Automatically Created Data

#### Users

- **Admin**: `admin@joystick.io` / `admin123` (full permissions)
- **User**: `user@joystick.io` / `Aa123456` (standard permissions)
- **Limited**: `limited@joystick.io` / `limited123` (media-only permissions)

#### Devices

- **test-device-001**: Full capabilities (stream, params, actions, terminal)
- **test-device-002**: Limited capabilities (stream, actions)
- **test-device-003**: Offline device for testing

#### Actions

- **ping**: Basic action without parameters
- **set-mode**: Action with parameters for testing forms

#### Permissions

- **admin-dashboard**: Admin user only
- **control-device**: Admin and regular user
- **media-route**: All users
- **action-route**: Admin and regular user

## Usage

### Running Tests

```bash
# Run all tests (database is handled automatically)
bun run test

# Run specific test file
bun run test:auth

# Run with debugging
bun run test:debug
```

### Database Operations

The database helper provides these key methods:

```typescript
import { testDb } from "./helpers/db-helper";

// Verify connection
const isConnected = await testDb.verifyConnection();

// Authenticate as admin for setup operations
await testDb.authenticateAsAdmin();

// Seed test data (returns created IDs for cleanup)
const dataIds = await testDb.seedTestData();

// Clean up test data
await testDb.cleanupTestData(dataIds);

// Disconnect
await testDb.disconnect();
```

## Error Handling

### Connection Issues

If PocketBase is not running or unreachable:

```
❌ Failed to authenticate as admin: [error details]
Cannot authenticate with PocketBase admin. Please ensure PocketBase is running and admin credentials are correct.
```

**Solution**: Ensure PocketBase is running on `localhost:8090`

### Data Conflicts

If test data already exists, the system handles it gracefully:

```
⚠️  User admin@joystick.io already exists, skipping
```

The system is idempotent and won't create duplicates.

### Cleanup Failures

If cleanup fails, warnings are logged but don't fail the test suite:

```
⚠️  Could not delete user [id]: [error details]
```

## Configuration

### PocketBase Admin Credentials

The system expects PocketBase admin credentials:

- **Email**: `admin@example.com`
- **Password**: `admin123456`

Update these in `db-helper.ts` if your setup differs:

```typescript
await this.pb.admins.authWithPassword("your-admin@email.com", "your-password");
```

### Database URL

Tests connect to PocketBase at `http://localhost:8090`. Update the `baseUrl` in `TestDatabaseHelper` constructor if different:

```typescript
constructor(page?: Page) {
  this.baseUrl = 'http://your-pocketbase-url:port';
  this.pb = new PocketBase(this.baseUrl);
}
```

## Benefits

### Consistency

- Every test run starts with fresh, known data
- No test pollution between runs
- Predictable test environment

### Isolation

- Tests don't interfere with each other
- Clean authentication state for each test
- Database state is reset between test suites

### Reliability

- Handles connection failures gracefully
- Idempotent operations prevent duplicates
- Comprehensive error logging

### Maintenance

- No manual seeding required
- Automatic cleanup prevents database bloat
- Clear separation of test data from production data

## Troubleshooting

### Common Issues

1. **PocketBase Not Running**

   ```
   Cannot connect to PocketBase. Please ensure it is running on localhost:8090
   ```

   Start PocketBase with `docker-compose up -d`

2. **Admin Authentication Failed**

   ```
   Cannot authenticate with PocketBase admin
   ```

   Verify admin credentials in PocketBase admin panel

3. **Port Conflicts**
   ```
   ECONNREFUSED 127.0.0.1:8090
   ```
   Check if another service is using port 8090

### Debug Information

The database helper provides detailed logging:

- ✅ Success operations
- ⚠️ Warnings for non-critical issues
- ❌ Errors for failures
- 🎉 Completion messages

## Migration from Manual Seeding

### What Changed

- **Removed**: Manual `test:seed` and `test:clean` scripts
- **Added**: Automatic global setup and teardown
- **Improved**: Error handling and logging
- **Enhanced**: Idempotent operations

### Benefits of New Approach

- No manual steps required
- Guaranteed fresh data for each test run
- Better error handling and recovery
- Consistent across all environments
- Integrated with Playwright's lifecycle

## Future Enhancements

### Potential Improvements

1. **Parallel Test Support**: Namespace test data by worker ID
2. **Custom Data Sets**: Allow tests to specify custom data requirements
3. **Snapshot Testing**: Save/restore database states for complex scenarios
4. **Performance Optimization**: Cache connections and reuse data where safe

### Extensibility

The database helper can be extended for additional test scenarios:

```typescript
// Add custom seeding methods
async seedCustomScenario(scenarioName: string) {
  // Custom data creation logic
}

// Add scenario-specific cleanup
async cleanupScenario(scenarioName: string) {
  // Custom cleanup logic
}
```

This architecture provides a solid foundation for comprehensive E2E testing with reliable database state management.
