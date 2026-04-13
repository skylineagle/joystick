# WiFi Access Point Feature Design

**Date:** 2026-04-13  
**Status:** Approved  
**Scope:** Full-stack — core utils, PocketBase, joystick API, dev-tools seed + mock, React frontend

---

## Overview

Add WiFi Access Point management as a first-class device capability in Joystick, oriented to the Teltonika RUT950/956 router. Devices that support being a WiFi AP are identified by the presence of `run` rows in PocketBase for the relevant WiFi AP actions. The feature allows configuring all AP settings and displaying live status, connected clients, and traffic data.

---

## Architecture

```
Browser → App (React)
  │
  ├─ runAction("get-wifi-ap-status") ──→ POST /api/run/:device/get-wifi-ap-status
  │                                           │ target: "joystick"
  │                                           │ command: "GET /api/wifi-ap/$device/status"
  │                                           ↓
  └─ direct fetch for dashboard ──────→ GET|PUT /api/wifi-ap/:device/...
                                              │
                                         rut.utils.ts (core)
                                              │
                                    Teltonika RUT HTTP API
                                    (or Mock HTTP server in dev)
```

Capability detection: `useIsSupported(deviceId, "get-wifi-ap-status")` queries PocketBase `run` rows for the device's model — same pattern as messaging.

---

## 1. PocketBase Changes

### 1a. New `joystick` target option

Add `joystick` to the `target` select field in the `run` collection (migration). This joins the existing `local` and `device` options.

When the joystick run handler encounters `target: "joystick"`, it treats the `command` field as `"METHOD /path/with/$vars"`, substitutes `$variables` via `parseActionCommand`, and performs an internal self-`fetch` forwarding the action body as JSON.

### 1b. New actions

Four new records in the `actions` collection (migration):

| name | description |
|---|---|
| `get-wifi-ap-status` | Fetch current AP status (enabled, SSID, channel, clients) |
| `get-wifi-clients` | Fetch list of connected WiFi clients with signal and traffic |
| `get-wifi-traffic` | Fetch cumulative TX/RX traffic for the AP interface |
| `set-wifi-ap-config` | Update AP configuration (SSID, password, channel, etc.) |

---

## 2. Core Package: `rut.utils.ts`

**File:** `packages/core/src/rut.utils.ts`

Absorbs and replaces `packages/whisper/src/rut.utils.ts`. Whisper deletes its local copy and imports from `@joystick/core`.

### Exported functions

```typescript
login(baseUrl: string, username: string, password: string): Promise<string>

sendSms(baseUrl: string, username: string, password: string,
        phoneNumber: string, message: string, modem: string): Promise<unknown>

getWifiStatus(baseUrl: string, token: string): Promise<WifiApStatus>
getWifiConfig(baseUrl: string, token: string): Promise<WifiApConfig>
setWifiConfig(baseUrl: string, token: string, config: Partial<WifiApConfig>): Promise<void>
getWifiClients(baseUrl: string, token: string): Promise<WifiClient[]>
getWifiTraffic(baseUrl: string, token: string): Promise<WifiTraffic>
```

All WiFi functions perform `POST /api/login` first to obtain a fresh token (same pattern as SMS), then call the appropriate Teltonika REST endpoint.

### RUT API endpoints used

| Function | HTTP call |
|---|---|
| `getWifiStatus` | `GET /api/network/wireless` |
| `getWifiConfig` | `GET /api/network/wireless` |
| `setWifiConfig` | `PUT /api/network/wireless` |
| `getWifiClients` | `GET /api/network/wireless/clients` |
| `getWifiTraffic` | `GET /api/interfaces` |

### New types (added to `packages/core/src/types/index.ts`)

```typescript
type WifiApStatus = {
  enabled: boolean;
  ssid: string;
  channel: number;
  band: "2.4GHz" | "5GHz";
  frequency: number;
  txPower: number;
  security: string;
  clientCount: number;
}

type WifiApConfig = {
  ssid: string;
  password: string;
  channel: number;
  band: string;
  security: "none" | "psk" | "psk2";
  txPower: number;
  maxClients: number;
  hidden: boolean;
}

type WifiClient = {
  mac: string;
  ip: string;
  hostname: string;
  signal: number;
  txBytes: number;
  rxBytes: number;
  connectedSince: string;
}

type WifiTraffic = {
  interface: string;
  txBytes: number;
  rxBytes: number;
  txPackets: number;
  rxPackets: number;
  timestamp: string;
}
```

### `DeviceInformation` additions

Three optional fields added to `DeviceInformation` in `packages/core/src/types/index.ts`:

```typescript
rutApiPort?: number;      // default 80
rutApiUser?: string;      // fallback: information.user
rutApiPassword?: string;  // fallback: information.password
```

`packages/core/src/index.ts` is updated to re-export all new rut utils functions and WiFi types alongside existing exports.

Two helpers exported from core:

```typescript
getRutApiUrl(info: DeviceInformation): string
getRutApiCredentials(info: DeviceInformation): { user: string; password: string }
```

---

## 3. Joystick Package Changes

### 3a. Updated run handler

**File:** `packages/joystick/src/index.ts`

New branch in `POST /api/run/:device/:action`:

```
target === "joystick":
  1. Split command on first space → [method, pathTemplate]
  2. Substitute $vars in pathTemplate via parseActionCommand
  3. fetch(`http://localhost:${PORT}${path}`, {
       method,
       body: body ? JSON.stringify(body) : undefined,
       headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${JOYSTICK_INTERNAL_SECRET}`
       }
     })
  4. Return the JSON response
```

**New env var:** `JOYSTICK_INTERNAL_SECRET` — a shared secret used to authenticate internal self-calls so they bypass the user auth requirement.

### 3b. New WiFi AP routes

**New file:** `packages/joystick/src/wifi-ap.ts` — Elysia plugin mounted on the main app.

| Method | Route | Handler |
|---|---|---|
| `GET` | `/api/wifi-ap/:device/status` | `getWifiStatus` |
| `GET` | `/api/wifi-ap/:device/clients` | `getWifiClients` |
| `GET` | `/api/wifi-ap/:device/traffic` | `getWifiTraffic` |
| `GET` | `/api/wifi-ap/:device/config` | `getWifiConfig` |
| `PUT` | `/api/wifi-ap/:device/config` | `setWifiConfig` |

Each route:
1. Loads device from PocketBase (auth: standard or internal secret)
2. Calls `getRutApiUrl` + `getRutApiCredentials` from core
3. Calls the appropriate `rut.utils.ts` function
4. Returns typed JSON response

---

## 4. Dev-tools: Seed + Mock

### 4a. Seed script

**New file:** `packages/dev-tools/src/seed/seed-rut.ts`  
**New script in `package.json`:** `"seed:rut": "bun run src/seed/seed-rut.ts"`

Creates:
1. All 4 WiFi AP action records in PocketBase
2. Model `Mock RUT950` with standard params schema, stream type `mediamtx`, modes `["off", "live", "auto"]`
3. Device `dev-mock-rut950-01` with `DeviceInformation` including `rutApiPort: 9100`, `host: "127.0.0.1"`, SSH port from constants, mock SSH credentials
4. `run` rows for the model:

| action | command | target |
|---|---|---|
| `get-wifi-ap-status` | `GET /api/wifi-ap/$device/status` | `joystick` |
| `get-wifi-clients` | `GET /api/wifi-ap/$device/clients` | `joystick` |
| `get-wifi-traffic` | `GET /api/wifi-ap/$device/traffic` | `joystick` |
| `set-wifi-ap-config` | `PUT /api/wifi-ap/$device/config` | `joystick` |
| `healthcheck` | `echo true` | `device` |
| `set-mode` | `echo '{"ok":true,"mode":"$mode"}'` | `device` |
| `get-battery` | *(standard echo)* | `device` |
| `get-cpsi` | *(standard echo)* | `device` |
| `get-temp` | *(standard echo)* | `device` |

### 4b. Mock HTTP server

**New file:** `packages/dev-tools/src/device-mock/rut-mock.ts`  
**New script:** `"mock-rut": "bun run src/device-mock/rut-mock.ts"`

Bun HTTP server on port `RUT_MOCK_PORT = 9100` (added to constants). Maintains in-memory state for AP config so PUT changes are reflected in subsequent GETs.

| Endpoint | Behaviour |
|---|---|
| `POST /api/login` | Always returns `{success: true, data: {token: "mock-token-rut"}}` |
| `GET /api/network/wireless` | Returns AP status + current in-memory config |
| `PUT /api/network/wireless` | Merges body into in-memory config, returns updated state |
| `GET /api/network/wireless/clients` | Returns 3 static mock clients with randomised signal |
| `GET /api/interfaces` | Returns mock traffic counters that increment on each call |

Default mock state: `ssid: "MockAP-RUT950"`, `password: "mockpass1"`, `channel: 6`, `band: "2.4GHz"`, `security: "psk2"`, `txPower: 20`, `maxClients: 32`, `hidden: false`, `enabled: true`.

---

## 5. Frontend: WiFi AP Page

### Route & capability gate

Route: `/devices/:id/wifi-ap`  
Gated by: `useIsSupported(deviceId, "get-wifi-ap-status")`  
Nav link hidden when not supported.

### File structure

```
packages/app/src/pages/wifi-ap/
  wifi-ap-page.tsx          ← container, 10s polling
  wifi-ap-status-card.tsx   ← AP toggle, SSID, channel, band, security, client count
  wifi-ap-clients-table.tsx ← MAC, IP, hostname, signal bar, TX/RX bytes, uptime
  wifi-ap-traffic-card.tsx  ← TX/RX totals + delta per poll
  wifi-ap-config-form.tsx   ← SSID, password, channel, band, security, max clients,
                               TX power slider, hidden toggle; submit via runAction

packages/app/src/hooks/
  use-wifi-ap.ts            ← parallel fetch of status + clients + traffic; loading/error/data
```

### Config form submission

Uses `runAction("set-wifi-ap-config", configBody)` — routes through `POST /api/run/:device/set-wifi-ap-config` → `target: joystick` → `PUT /api/wifi-ap/:device/config`.

---

## Error Handling

- RUT API login failure: surface as `503 Service Unavailable` with message `"Could not authenticate with device API"`
- Device not found in PocketBase: `404`
- RUT API returns non-ok: propagate status + message
- Internal `joystick` target self-call failure: return original error body from inner response
- Frontend: per-section error states (status/clients/traffic fail independently)

---

## Testing Checklist

1. Run `bun run seed:rut` — verify model, device, run rows created in PocketBase
2. Start `bun run mock-rut` — verify mock server responds on port 9100
3. Call `GET /api/wifi-ap/<deviceId>/status` — verify mock data returned
4. Call `PUT /api/wifi-ap/<deviceId>/config` with new SSID — verify subsequent GET reflects change
5. Call `POST /api/run/<deviceId>/get-wifi-ap-status` — verify `target: joystick` routing works
6. Open `/devices/<id>/wifi-ap` in app — verify page renders with status/clients/traffic
7. Submit config form — verify SSID update flows end-to-end
8. Open a non-RUT device page — verify WiFi AP nav link is hidden
