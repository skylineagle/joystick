import { pb } from "@/lib/pocketbase";

export async function getIsPermitted(action: string, userId: string) {
  const permissions = await pb.collection("permissions").getFullList({
    filter: `name="${action}"`,
  });

  if (!permissions || permissions.length !== 1) {
    return false;
  }

  return permissions[0].users.includes(userId);
}
