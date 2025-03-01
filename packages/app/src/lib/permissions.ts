import { pb } from "@/lib/pocketbase";
import { RuleResponse, UserResponse } from "@/types/types";

export async function getIsPermitted(action: string, userId: string) {
  const user = await pb.collection("users").getOne<UserResponse>(userId, {
    expand: "level",
  });
  const level = user.expand.level.name;

  const actionsData = await pb.collection("actions").getFullList({
    filter: `name="${action}"`,
  });

  if (!actionsData) {
    return false;
  }

  const actionId = actionsData[0].id;

  const data = await pb.collection("levels").getFullList({
    filter: `name="${level}"`,
  });

  if (!data || data.length !== 1) {
    return false;
  }

  const levelId = data[0].id;

  const allowedActions = await pb
    .collection("rules")
    .getFirstListItem<RuleResponse>(`allow="${levelId}"`, {
      expand: "action",
    });

  return allowedActions.action.includes(actionId);
}
