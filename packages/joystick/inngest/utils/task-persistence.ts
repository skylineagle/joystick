import { logger } from "@/logger";
import { pb } from "@/pocketbase";
import type { OfflineActionPayload, TaskStatus } from "../types";

export interface TaskStep {
  name: string;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export const createTask = async (
  eventId: string,
  eventData: OfflineActionPayload
) => {
  await pb.collection("tasks").create({
    inngest_event_id: eventId,
    device: eventData.deviceId,
    action_name: eventData.action,
    parameters: eventData.params || {},
    ttl: eventData.ttl,
    // status: "off",
    status: "pending",
    started_at: new Date().toISOString(),
  });
};

export const updateTaskStatus = async (
  eventId: string,
  status: TaskStatus,
  errorMessage?: string
) => {
  const tasks = await pb.collection("tasks").getFullList({
    filter: `inngest_event_id = "${eventId}"`,
  });

  if (tasks.length > 0) {
    const task = tasks[0];
    logger.warn(status);
    const updateData: any = {
      // status,
    };

    if (status === "completed" || status === "failed" || status === "timeout") {
      updateData.completed_at = new Date().toISOString();
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    await pb.collection("tasks").update(task.id, updateData);
  }
};

export const updateTaskProgress = async (
  eventId: string,
  step: string,
  status: TaskStatus,
  errorMessage?: string
) => {
  const tasks = await pb.collection("tasks").getFullList({
    filter: `inngest_event_id = "${eventId}"`,
  });

  if (tasks.length > 0) {
    const task = tasks[0];
    const currentSteps = (task.steps as TaskStep[]) || [];

    const updatedSteps = [...currentSteps];
    const stepIndex = updatedSteps.findIndex((s) => s.name === step);

    if (stepIndex >= 0) {
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status,
        ...(status === "running"
          ? { startedAt: new Date().toISOString() }
          : {}),
        ...(status === "completed" ||
        status === "failed" ||
        status === "timeout"
          ? { completedAt: new Date().toISOString() }
          : {}),
        ...(errorMessage ? { error: errorMessage } : {}),
      };
    } else {
      updatedSteps.push({
        name: step,
        status,
        ...(status === "running"
          ? { startedAt: new Date().toISOString() }
          : {}),
        ...(status === "completed" ||
        status === "failed" ||
        status === "timeout"
          ? { completedAt: new Date().toISOString() }
          : {}),
        ...(errorMessage ? { error: errorMessage } : {}),
      });
    }

    const stepMappings: Record<string, string> = {
      "getting-ready": "getting-ready",
      "waiting-for-device": "waiting-for-device",
      "running-action": "running-action",
    };

    await pb.collection("tasks").update(task.id, {
      current_step: stepMappings[step],
      steps: updatedSteps,
      status:
        status === "timeout"
          ? "timeout"
          : status === "failed"
          ? "failed"
          : task.status,
    });
  }
};
