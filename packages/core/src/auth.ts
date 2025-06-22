import { DEFAULT_API_KEY, POCKETBASE_URL } from "@/config";
import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import PocketBase from "pocketbase";

export interface AuthContext {
  user: any | null;
  userId: string | null;
  permissions: string[];
  isApiKey: boolean;
  isInternal: boolean;
}

export interface AuthOptions {
  required?: boolean;
  permissions?: string[];
  allowInternal?: boolean;
  deviceId?: string;
}

const isInternalRequest = (
  headers: Record<string, string | undefined>
): boolean => {
  const forwardedFor = headers["x-forwarded-for"];
  const realIp = headers["x-real-ip"];
  const remoteAddr = headers["x-remote-addr"];
  console.log(remoteAddr, realIp);

  const internalIps = [
    "127.0.0.1",
    "::1",
    "localhost",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "10.0.0.0/8",
  ];

  const clientIp = forwardedFor || realIp || remoteAddr;
  if (clientIp && internalIps.some((ip) => clientIp.includes(ip))) {
    return true;
  }

  const userAgent = headers["user-agent"];
  if (
    userAgent &&
    (userAgent.includes("curl") ||
      userAgent.includes("node") ||
      userAgent.includes("bun"))
  ) {
    return true;
  }

  return false;
};

export const createAuthPlugin = (
  pb: PocketBase,
  jwtSecret: string = "joystick-secret"
) => {
  return new Elysia({ name: "auth" })
    .use(bearer())
    .use(
      jwt({
        name: "jwt",
        secret: jwtSecret,
      })
    )
    .derive(
      { as: "global" },
      async ({ headers, query, bearer: bearerToken }) => {
        let authContext: AuthContext = {
          user: null,
          userId: null,
          permissions: [],
          isApiKey: false,
          isInternal: false,
        };

        const apiKeyHeader = headers["x-api-key"] || headers["X-API-Key"];
        const tokenQuery = query.token as string;
        const { id: systemUserId } = await pb
          .collection("users")
          .getFirstListItem(`email = "system@joystick.io"`);

        if (isInternalRequest(headers)) {
          authContext.isInternal = true;
          authContext.permissions = ["*"];
          authContext.userId = systemUserId;
          console.log("Using internal auth");
          return { auth: authContext };
        }

        if (apiKeyHeader === DEFAULT_API_KEY) {
          authContext.isApiKey = true;
          authContext.permissions = ["*"];
          authContext.userId = systemUserId;
          console.log("Using API key auth");
          return { auth: authContext };
        }

        const token = bearerToken || tokenQuery;

        if (token) {
          console.log("Using JWT auth - validating with PocketBase");
          try {
            // Instead of verifying the JWT ourselves, validate it with PocketBase
            // by trying to get the authenticated user
            const tempPb = new PocketBase(POCKETBASE_URL);
            tempPb.authStore.save(token, null);

            // Try to refresh the auth to validate the token
            const authData = await tempPb.collection("users").authRefresh();

            if (authData && authData.record) {
              console.log("PocketBase token validation successful");
              authContext.user = authData.record;
              authContext.userId = authData.record.id;

              const permissions = await pb
                .collection("permissions")
                .getFullList({
                  filter: `users ~ "${authData.record.id}"`,
                });
              authContext.permissions = permissions.map((p: any) => p.name);
            }
          } catch (error) {
            console.error("PocketBase token validation failed:", error);
          }
        }

        return { auth: authContext };
      }
    );
};

// Authentication guards for different levels of access control
export const authGuard = {
  // Basic authentication required (any valid auth method)
  required: (permissions: string[] = []) => ({
    beforeHandle: async ({ auth, set }: any) => {
      console.log("Required auth guard:", {
        userId: auth?.userId,
        isInternal: auth?.isInternal,
        isApiKey: auth?.isApiKey,
        permissions: auth?.permissions,
        requiredPermissions: permissions,
      });

      // Check if authenticated
      if (!auth?.userId) {
        console.log("Required auth guard: No authentication found");
        set.status = 401;
        return { error: "Authentication required" };
      }

      // Check permissions if specified
      if (
        permissions.length > 0 &&
        !auth?.isApiKey &&
        !auth?.isInternal &&
        !auth?.permissions?.includes("*")
      ) {
        const hasPermission = permissions.some((permission) =>
          auth?.permissions?.includes(permission)
        );
        if (!hasPermission) {
          console.log("Required auth guard: Missing required permissions");
          set.status = 403;
          return {
            error: `Missing required permissions: ${permissions.join(", ")}`,
          };
        }
      }

      console.log("Required auth guard: Authentication passed");
    },
  }),

  // Require specific permissions
  permissions: (permissions: string[] = []) => ({
    beforeHandle: async ({ auth, set }: any) => {
      console.log("Permission guard:", {
        required: permissions,
        userPermissions: auth?.permissions,
        isApiKey: auth?.isApiKey,
        isInternal: auth?.isInternal,
      });

      // API keys and internal requests have full permissions
      if (
        auth?.isApiKey ||
        auth?.isInternal ||
        auth?.permissions?.includes("*")
      ) {
        console.log("Permission guard: Full permissions granted");
        return;
      }

      if (permissions.length > 0) {
        const hasPermission = permissions.some((permission) =>
          auth?.permissions?.includes(permission)
        );
        if (!hasPermission) {
          console.log("Permission guard: Missing required permissions");
          set.status = 403;
          return {
            error: `Missing required permissions: ${permissions.join(", ")}`,
          };
        }
      }

      console.log("Permission guard: Permissions validated");
    },
  }),

  // Require device access (checks devices.allow[] field)
  device: (pb: PocketBase, permissions: string[] = []) => ({
    beforeHandle: async ({ auth, params, set }: any) => {
      console.log("Device guard:", {
        device: params?.device,
        userId: auth?.userId,
        isApiKey: auth?.isApiKey,
        isInternal: auth?.isInternal,
        requiredPermissions: permissions,
      });

      // API keys and internal requests have full access
      if (auth?.isApiKey || auth?.isInternal) {
        console.log("Device guard: Full access granted (API key/internal)");
        return;
      }

      // Check permissions first if required
      if (permissions.length > 0 && !auth?.permissions?.includes("*")) {
        const hasPermission = permissions.some((permission) =>
          auth?.permissions?.includes(permission)
        );
        if (!hasPermission) {
          console.log("Device guard: Missing required permissions");
          set.status = 403;
          return {
            error: `Missing required permissions: ${permissions.join(", ")}`,
          };
        }
      }

      // Check device access if device parameter exists
      if (params && "device" in params) {
        try {
          const device = await pb
            .collection("devices")
            .getOne(params.device as string);

          if (
            !device.allow ||
            !auth?.userId ||
            !device.allow.includes(auth.userId)
          ) {
            console.log("Device guard: Access denied to device");
            set.status = 403;
            return {
              error:
                "Access denied: You don't have permission to access this device",
            };
          }
          console.log("Device guard: Device access granted");
        } catch (error) {
          console.log("Device guard: Device not found");
          set.status = 404;
          return { error: "Device not found" };
        }
      }

      console.log("Device guard: All checks passed");
    },
  }),

  // Allow public access (bypass global auth for specific endpoints)
  public: () => ({
    beforeHandle: async ({ set }: any) => {
      // Override the global auth requirement
      console.log("Public guard: Allowing public access");
      return;
    },
  }),

  // Internal requests only
  internal: () => ({
    beforeHandle: async ({ auth, set }: any) => {
      console.log("Internal guard:", {
        userId: auth?.userId,
        isInternal: auth?.isInternal,
        isApiKey: auth?.isApiKey,
      });

      // Allow internal requests and API keys
      if (auth?.isInternal || auth?.isApiKey) {
        console.log("Internal guard: Access granted");
        return;
      }

      console.log("Internal guard: Access denied");
      set.status = 403;
      return { error: "Internal access only" };
    },
  }),

  // Strict auth - no internal/API key bypass
  strict: (permissions: string[] = []) => ({
    beforeHandle: async ({ auth, set }: any) => {
      console.log("Strict guard:", {
        userId: auth?.userId,
        isApiKey: auth?.isApiKey,
        isInternal: auth?.isInternal,
        requiredPermissions: permissions,
      });

      // Strict mode: require real user authentication
      if (!auth?.userId || auth.isApiKey || auth.isInternal) {
        console.log("Strict guard: Real user authentication required");
        set.status = 401;
        return { error: "User authentication required" };
      }

      if (permissions.length > 0) {
        const hasPermission = permissions.some((permission) =>
          auth?.permissions?.includes(permission)
        );
        if (!hasPermission) {
          console.log("Strict guard: Missing required permissions");
          set.status = 403;
          return {
            error: `Missing required permissions: ${permissions.join(", ")}`,
          };
        }
      }

      console.log("Strict guard: User authentication validated");
    },
  }),
};
