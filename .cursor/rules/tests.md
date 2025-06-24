# Tests

In the joystick app i use playwright to tests e2e.
when writing tests, follow those rules:

- DO NOT generate test code based on the scenario alone.
- DO run steps one by one using the tools provided by the Playwright MCP.
- Save generated test file in the e2e directory
- Include appropriate assertions to verify the expected behavior
- Structure tests properly with descriptive test titles and comments
- Tests will be running when all other services (rest servers pocketbase and mediamtx) are running.
