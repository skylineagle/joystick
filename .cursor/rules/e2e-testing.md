# E2E Testing Strategy for Joystick

## Overview

This document outlines the comprehensive end-to-end testing strategy for the Joystick device management platform using Playwright. The tests are designed to validate the complete user journey across all features and user roles.

## Testing Environment

### Prerequisites

- All services must be running:
  - Joystick (main device control service)
  - Baker (automation service)
  - Panel (SSH session management)
  - Switcher (MediaMTX source management)
  - Whisper (SMS communication)
  - Studio (event management)
  - PocketBase (database)
  - MediaMTX (media server)
- Frontend development server
- No mocking - full E2E integration testing
- Test data seeded in PocketBase database

### Test Data Requirements

#### User Accounts

```javascript
// Admin user with full permissions
{
  email: "admin@joystick.io",
  password: "admin123",
  permissions: ["*"] // All permissions
}

// Regular user with standard permissions
{
  email: "user@joystick.io",
  password: "user123",
  permissions: ["control-device", "media-route", "action-route"]
}

// Limited user for permission testing
{
  email: "limited@joystick.io",
  password: "limited123",
  permissions: ["media-route"] // Only streaming access
}
```

#### Test Devices

```javascript
// Device with full capabilities
{
  name: "Test Device Full",
  device: "test-device-001",
  status: "online",
  capabilities: ["stream", "params", "actions", "terminal"],
  information: {
    host: "192.168.1.100",
    activeSlot: "primary",
    secondSlotHost: "192.168.1.101"
  }
}

// Device with limited capabilities
{
  name: "Test Device Limited",
  device: "test-device-002",
  status: "online",
  capabilities: ["stream", "actions"]
}

// Offline device for testing
{
  name: "Test Device Offline",
  device: "test-device-003",
  status: "offline",
  capabilities: ["stream", "params", "actions"]
}
```

#### Sample Actions

```javascript
// Basic action without parameters
{
  name: "ping",
  device: "test-device-001",
  parameters: {}
}

// Action with parameters
{
  name: "set-mode",
  device: "test-device-001",
  parameters: {
    properties: {
      mode: { type: "string", enum: ["auto", "manual"] }
    }
  }
}
```

## Test Plan Implementation Priority

### Phase 1: Core Functionality (High Priority)

#### 1. Authentication & Authorization

- **Priority:** Critical
- **Description:** Validate login/logout flow and role-based access
- **Tests:**
  - Valid admin login → dashboard access
  - Valid user login → device list access
  - Invalid credentials → error handling
  - Session persistence across refresh
  - Permission-based route protection
  - Logout functionality

#### 2. Navigation & Layout

- **Priority:** Critical
- **Description:** Core navigation and responsive layout
- **Tests:**
  - Main navigation (Home, Dashboard, Settings)
  - Device switcher functionality
  - Sidebar navigation per device
  - Breadcrumb navigation
  - Mobile responsive behavior

#### 3. Device Management Core

- **Priority:** Critical
- **Description:** Basic device operations and display
- **Tests:**
  - Device table rendering with all columns
  - Device search and filtering
  - Device status indicators
  - Device selection and basic operations
  - Permission-based device visibility

#### 4. Stream View Basics

- **Priority:** High
- **Description:** Video streaming and basic controls
- **Tests:**
  - Video stream initialization and display
  - Stream quality controls (bitrate, FPS)
  - Device status indicator updates
  - Control permission enforcement
  - Stream overlay functionality

#### 5. Action Execution

- **Priority:** High
- **Description:** Device action execution workflow
- **Tests:**
  - Action list display
  - Action parameter forms
  - Action execution with/without parameters
  - Action result display
  - Error handling for failed actions

### Phase 2: Advanced Features (Medium Priority)

#### 6. Parameter Management

- **Priority:** Medium
- **Description:** Device parameter tree and editing
- **Tests:**
  - Parameter tree loading and navigation
  - Parameter value reading/writing
  - Parameter validation and error handling
  - Search functionality
  - Permission-based access control

#### 7. Dashboard Management

- **Priority:** Medium
- **Description:** Custom dashboard and card management
- **Tests:**
  - Dashboard layout and card arrangement
  - Add/edit/delete dashboard cards
  - Card type functionality (stream, params, actions)
  - Drag-and-drop card arrangement
  - Card configuration persistence

#### 8. Notifications System

- **Priority:** Medium
- **Description:** Real-time notifications and history
- **Tests:**
  - Notification panel display
  - Real-time notification updates
  - Mark as read/unread functionality
  - Notification filtering
  - WebSocket connection status
  - Notification history access

#### 9. Settings Management

- **Priority:** Medium
- **Description:** Application and user settings
- **Tests:**
  - Theme toggle (light/dark mode)
  - User profile management
  - Settings persistence
  - Admin-only settings access

### Phase 3: Specialized Features (Lower Priority)

#### 10. Terminal Access

- **Priority:** Low
- **Description:** SSH terminal functionality
- **Tests:**
  - Terminal connection establishment
  - Command execution and output
  - Session persistence
  - Permission enforcement

#### 11. Gallery & Media Management

- **Priority:** Low
- **Description:** Event gallery and media handling
- **Tests:**
  - Gallery service start/stop
  - Event scanning and display
  - Media file download/viewing
  - Event filtering and search
  - Bulk operations

#### 12. Admin Features

- **Priority:** Low
- **Description:** Advanced administration tools
- **Tests:**
  - Permission management interface
  - User permission assignment
  - Device permission configuration
  - System settings management

## Test Implementation Guidelines

### Test Structure

```typescript
// Example test structure
test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login, navigate to feature
  });

  test("should perform specific action", async ({ page }) => {
    // Arrange: set up test data
    // Act: perform user actions
    // Assert: verify expected outcomes
  });
});
```

### Authentication Helper

```typescript
// Reusable login function
async function loginAs(page: Page, userType: "admin" | "user" | "limited") {
  const credentials = {
    admin: { email: "admin@joystick.io", password: "admin123" },
    user: { email: "user@joystick.io", password: "user123" },
    limited: { email: "limited@joystick.io", password: "limited123" },
  };

  await page.goto("/login");
  await page.fill('[data-testid="email"]', credentials[userType].email);
  await page.fill('[data-testid="password"]', credentials[userType].password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL("/");
}
```

### Common Test Patterns

#### Page Object Model

Use page objects for complex interactions:

```typescript
class DeviceListPage {
  constructor(private page: Page) {}

  async searchDevice(name: string) {
    await this.page.fill('[data-testid="device-search"]', name);
  }

  async selectDevice(deviceName: string) {
    await this.page.click(`[data-testid="device-${deviceName}"]`);
  }
}
```

#### Data Attributes

Add data-testid attributes to components for reliable selection:

```tsx
<Button data-testid="login-button">Login</Button>
<Input data-testid="device-search" placeholder="Search devices..." />
```

## Database Seeding Strategy

### Test Data Setup

Create SQL scripts or PocketBase admin scripts to seed test data:

```javascript
// Example seeding script
const seedTestData = async () => {
  // Create test users
  await pb.collection("users").create({
    email: "admin@joystick.io",
    password: "admin123",
    verified: true,
  });

  // Create test devices
  await pb.collection("devices").create({
    name: "Test Device Full",
    device: "test-device-001",
    status: "online",
  });

  // Create test permissions
  await pb.collection("permissions").create({
    name: "admin-dashboard",
    users: ["admin-user-id"],
  });
};
```

## Running Tests

### Local Development

```bash
# Start all services first
npm run dev

# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in headed mode for debugging
npx playwright test --headed

# Generate test report
npx playwright show-report
```

### CI/CD Integration

- Tests run after all services are confirmed running
- Database is reset and reseeded before test suite
- Screenshots/videos captured on failures
- Test reports generated and stored

## Success Criteria

### Coverage Goals

- **Authentication:** 100% coverage of login/logout flows
- **Core Features:** 90% coverage of device management, streaming, actions
- **Advanced Features:** 70% coverage of parameters, dashboard, notifications
- **Error Scenarios:** 80% coverage of error handling and edge cases

### Performance Targets

- Page load times < 3 seconds
- Action execution feedback within 1 second
- Video stream initialization < 5 seconds
- No memory leaks during extended sessions

### Accessibility Requirements

- All interactive elements keyboard accessible
- Proper ARIA labels and roles
- Screen reader compatibility
- Focus management and visible focus indicators

This testing strategy ensures comprehensive validation of the Joystick platform while maintaining realistic scope and priorities for implementation.
