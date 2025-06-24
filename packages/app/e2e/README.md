# E2E Testing for Joystick

This directory contains end-to-end tests for the Joystick device management platform using Playwright.

## Overview

The E2E tests validate the complete user journey across all features and user roles, following the comprehensive testing strategy outlined in `.cursor/rules/e2e-testing.md`.

## Prerequisites

Before running tests, ensure all services are running:

- **Joystick** (main device control service)
- **Baker** (automation service)
- **Panel** (SSH session management)
- **Switcher** (MediaMTX source management)
- **Whisper** (SMS communication)
- **Studio** (event management)
- **PocketBase** (database)
- **MediaMTX** (media server)
- **Frontend** development server

## Test Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Install Playwright Browsers

```bash
bunx playwright install
```

### 3. Database Setup

Test data is automatically seeded before tests run using Playwright's global setup. The system creates:

- **Test Users:**
  - `admin@joystick.io` / `admin123` (full permissions)
  - `user@joystick.io` / `Aa123456` (standard permissions)
  - `limited@joystick.io` / `limited123` (limited permissions)
- **Test Devices:**
  - `test-device-001` (full capabilities)
  - `test-device-002` (limited capabilities)
  - `test-device-003` (offline device)

No manual seeding is required - the tests handle this automatically.

### 4. Start Services

Make sure all services are running:

```bash
# From project root
docker-compose up -d
```

## Running Tests

### Basic Commands

```bash
# Run all tests
bun run test

# Run authentication tests only
bun run test:auth

# Run tests in headed mode (see browser)
bun run test:headed

# Run tests with debugging
bun run test:debug

# Open Playwright UI for interactive testing
bun run test:ui

# View test report
bun run test:report
```

### Advanced Commands

```bash
# Run specific test file
bunx playwright test auth.spec.ts

# Run tests matching pattern
bunx playwright test --grep "login"

# Run tests in specific browser
bunx playwright test --project=chromium

# Run tests with video recording
bunx playwright test --video=on

# Run tests with screenshots on failure
bunx playwright test --screenshot=only-on-failure
```

## Test Structure

### Current Implementation Status

#### ✅ Phase 1: Core Functionality (Implemented)

- **Authentication & Authorization** (`auth.spec.ts`)
  - Login/logout flows
  - Session management
  - Route protection
  - Permission-based access
  - Error handling
  - UI/UX validation

#### 🚧 Phase 2: Advanced Features (Planned)

- Navigation & Layout
- Device Management Core
- Stream View Basics
- Action Execution
- Parameter Management
- Dashboard Management
- Notifications System
- Settings Management

#### 📋 Phase 3: Specialized Features (Future)

- Terminal Access
- Gallery & Media Management
- Admin Features

### Test Organization

```
e2e/
├── auth.spec.ts              # Authentication & Authorization tests
├── helpers/
│   ├── auth-helper.ts        # Reusable auth utilities
│   └── db-helper.ts          # Database seeding and cleanup utilities
├── setup/
│   ├── global-setup.ts       # Global test setup (database seeding)
│   └── global-teardown.ts    # Global test teardown (cleanup)
└── README.md                 # This file
```

## Test Data Management

### Automatic Database Management

Test data is automatically managed by Playwright's global setup and teardown:

- **Global Setup**: Seeds fresh test data before all tests run
- **Global Teardown**: Cleans up test data after all tests complete
- **Per-Test Cleanup**: Each test starts with a clean authentication state

The system is idempotent - it won't create duplicates if data already exists.

### Test Users

| Email                 | Password     | Permissions | Use Case                       |
| --------------------- | ------------ | ----------- | ------------------------------ |
| `admin@joystick.io`   | `admin123`   | All (`*`)   | Full admin access testing      |
| `user@joystick.io`    | `Aa123456`   | Standard    | Regular user workflow testing  |
| `limited@joystick.io` | `limited123` | Media only  | Permission restriction testing |

## Helper Functions

The `helpers/auth-helper.ts` provides reusable functions:

```typescript
import { loginAs, logout, clearAuthState } from "./helpers/auth-helper";

// Login as specific user type
await loginAs(page, "admin");
await loginAs(page, "user");
await loginAs(page, "limited");

// Logout current user
await logout(page);

// Clear authentication state
await clearAuthState(page);
```

## Test Configuration

Key configuration in `playwright.config.ts`:

- **Base URL:** `http://localhost:5173`
- **Browsers:** Chrome, Firefox, Safari
- **Retries:** 2 on CI, 0 locally
- **Screenshots:** Only on failure
- **Videos:** Retained on failure
- **Traces:** On first retry

## Debugging Tests

### Interactive Debugging

```bash
# Open Playwright UI
bun run test:ui

# Debug specific test
bunx playwright test auth.spec.ts --debug
```

### Viewing Test Results

```bash
# Generate and view HTML report
bun run test:report
```

### Screenshots and Videos

Test artifacts are saved to:

- `test-results/` - Screenshots, videos, traces
- `playwright-report/` - HTML test report

## Best Practices

### 1. Test Data Attributes

Use `data-testid` attributes for reliable element selection:

```tsx
<Button data-testid="login-button">Login</Button>
```

```typescript
await page.getByTestId("login-button").click();
```

### 2. Waiting for Elements

Use Playwright's auto-waiting features:

```typescript
// Good - auto-waits for element
await page.getByTestId("login-button").click();

// Avoid - manual waiting
await page.waitForSelector('[data-testid="login-button"]');
```

### 3. Test Isolation

Each test should be independent:

```typescript
test.beforeEach(async ({ page }) => {
  await clearAuthState(page);
});
```

### 4. Descriptive Test Names

```typescript
test("should successfully login with valid admin credentials", async ({
  page,
}) => {
  // Test implementation
});
```

## Troubleshooting

### Common Issues

1. **Services Not Running**

   ```
   Error: connect ECONNREFUSED 127.0.0.1:5173
   ```

   **Solution:** Start all services with `docker-compose up -d`

2. **Test Data Missing**

   ```
   Error: Invalid credentials
   ```

   **Solution:** Check that PocketBase is running and admin credentials are correct. Test data is automatically seeded.

3. **Browser Not Installed**

   ```
   Error: Browser not found
   ```

   **Solution:** Run `bunx playwright install`

4. **Flaky Tests**
   - Check network conditions
   - Increase timeouts if needed
   - Ensure services are stable

### Getting Help

- Check test reports: `bun run test:report`
- Run with debugging: `bun run test:debug`
- Use Playwright UI: `bun run test:ui`
- Review test artifacts in `test-results/`

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate data-testid attributes to components
3. Use helper functions for common operations
4. Include both positive and negative test cases
5. Update this README if adding new test categories

## Next Steps

The current implementation covers Phase 1 (Authentication & Authorization). Next phases will include:

1. **Navigation & Layout Tests** - Core navigation and responsive behavior
2. **Device Management Tests** - Device operations and display
3. **Stream View Tests** - Video streaming and controls
4. **Action Execution Tests** - Device action workflows

See `.cursor/rules/e2e-testing.md` for the complete testing strategy.
