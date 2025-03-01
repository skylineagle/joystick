import { pb } from "@/lib/pocketbase";
import { RuleResponse } from "@/types/types";

export async function getIsPermitted(action: string, userId: string) {
  console.log(userId, action);

  const actionsData = await pb.collection("actions").getFullList({
    filter: `name="${action}"`,
  });
  console.log(action, actionsData);

  if (!actionsData) {
    console.log("no actions data");
    return false;
  }

  const actionId = actionsData[0].id;
  console.log("1");

  const allowedActions = await pb
    .collection("rules")
    .getFullList<RuleResponse>({
      filter: `allow="${userId}"`,
    });

  if (!allowedActions || allowedActions.length !== 1) {
    return false;
  }

  console.log("2");

  console.log(allowedActions);
  return allowedActions[0].action.includes(actionId);
}
