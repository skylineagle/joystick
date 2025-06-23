import { DEFAULT_API_KEY, POCKETBASE_URL } from "@/config";
import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import PocketBase from "pocketbase";

export interface AuthContext {
  user: any | null;
  userId: string | null;
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
      async ({ headers, query, bearer: bearerToken, status }) => {
        let authContext: AuthContext = {
          user: null,
          userId: null,
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
          authContext.userId = systemUserId;
          console.log("Using internal auth");
          return { auth: authContext };
        }

        if (apiKeyHeader === DEFAULT_API_KEY) {
          authContext.isApiKey = true;
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
            }

            return { auth: authContext };
          } catch (error) {
            console.error("PocketBase token validation failed:", error);
          }
        }

        return status(401, "Unauthorized");
      }
    );
};
