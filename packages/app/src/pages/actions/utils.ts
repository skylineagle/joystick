import { ActionSchema, SchemaProperty } from "@/types/types";
import { z } from "zod";

export function buildZodSchema(schema: ActionSchema): z.ZodType {
  const properties: Record<string, z.ZodType> = {};

  Object.entries(schema.properties || {}).forEach(
    ([key, value]: [string, SchemaProperty]) => {
      switch (value.type) {
        case "string":
          properties[key] = z.string();
          if (value.enum)
            properties[key] = z.enum(value.enum as [string, ...string[]]);
          break;
        case "number":
          properties[key] = z.coerce.number();
          break;
        case "integer":
          properties[key] = z.coerce.number().int();
          break;
        case "boolean":
          properties[key] = z.boolean().default(false);
          break;
        default:
          properties[key] = z.any();
      }

      if (!schema.required?.includes(key)) {
        properties[key] = properties[key].optional();
      }
    }
  );

  return z.object(properties);
}

export function isActionSchema(obj: unknown): obj is ActionSchema {
  if (!obj || typeof obj !== "object") return false;
  const schema = obj as Record<string, unknown>;
  return "properties" in schema && typeof schema.properties === "object";
}
