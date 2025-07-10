import { InngestCommHandler, type ServeHandlerOptions } from "inngest";
import { Elysia } from "elysia";

export const createInngestHandler = (options: ServeHandlerOptions) => {
  const handler = new InngestCommHandler({
    frameworkName: "elysia",
    fetch: fetch.bind(globalThis),
    ...options,
    handler: (req: Request) => {
      return {
        body: () => req.json(),
        headers: (key) => req.headers.get(key),
        method: () => req.method,
        url: () => new URL(req.url),
        transformResponse: ({ body, status, headers }) => {
          return new Response(body, { status, headers });
        },
      };
    },
  });

  const inngestHandler = handler.createHandler();

  return new Elysia()
    .post("/api/inngest", (context) => inngestHandler(context.request))
    .get("/api/inngest", (context) => inngestHandler(context.request))
    .put("/api/inngest", (context) => inngestHandler(context.request));
};
