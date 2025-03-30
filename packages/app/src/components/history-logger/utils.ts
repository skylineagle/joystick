import { UsersResponse } from "@/types/db.types";

export function getUserDisplayName(user?: UsersResponse) {
  return user?.username
    ? user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0].toUpperCase();
}

export function getActionDisplayName(actionName: string) {
  return actionName.replaceAll("-", " ").replaceAll("_", " ");
}
