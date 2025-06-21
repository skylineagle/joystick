import { pb } from "@/lib/pocketbase";

export async function getIsPermitted<T extends readonly string[]>(
  actionOrActions: T,
  userId: string
): Promise<Record<T[number], boolean>>;
export async function getIsPermitted(
  actionOrActions: string,
  userId: string
): Promise<boolean>;
export async function getIsPermitted<T extends string | readonly string[]>(
  actionOrActions: T,
  userId: string
): Promise<T extends readonly string[] ? Record<T[number], boolean> : boolean> {
  const actions = Array.isArray(actionOrActions)
    ? actionOrActions
    : [actionOrActions];

  const permissions = await pb.collection("permissions").getFullList({
    filter: actions.map((action) => `name="${action}"`).join(" || "),
  });

  if (!Array.isArray(actionOrActions)) {
    const permission = permissions.find((p) => p.name === actionOrActions);
    return (
      permission ? permission.users.includes(userId) : false
    ) as T extends readonly string[] ? Record<T[number], boolean> : boolean;
  }

  const results = {} as Record<
    T extends readonly string[] ? T[number] : never,
    boolean
  >;

  for (const action of actions) {
    const permission = permissions.find((p) => p.name === action);
    results[action as T extends readonly string[] ? T[number] : never] =
      permission ? permission.users.includes(userId) : false;
  }

  return results as T extends readonly string[]
    ? Record<T[number], boolean>
    : boolean;
}
