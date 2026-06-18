"use server";

import { revalidatePath } from "next/cache";
import { taskService } from "../services/task.service";
import { taskSchema, TaskFormValues } from "../validators/task.schema";
import { TaskStatus } from "../types/task.types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

export async function createTaskAction(data: TaskFormValues) {
  try {
    const parsedData = taskSchema.parse(data);
    await taskService.createTask(parsedData);
    revalidatePath("/portal/tasks");
    revalidatePath("/portal/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating task:", error);
    return { success: false, error: getErrorMessage(error, "Error creating task") };
  }
}

export async function updateTaskAction(id: string, data: Partial<TaskFormValues>) {
  try {
    await taskService.updateTask(id, data);
    revalidatePath("/portal/tasks");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating task:", error);
    return { success: false, error: getErrorMessage(error, "Error updating task") };
  }
}

export async function updateTaskStatusAction(id: string, status: TaskStatus) {
  try {
    await taskService.updateTaskStatus(id, status);
    revalidatePath("/portal/tasks");
    revalidatePath("/portal/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating task status:", error);
    return { success: false, error: getErrorMessage(error, "Error updating task status") };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    await taskService.deleteTask(id);
    revalidatePath("/portal/tasks");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting task:", error);
    return { success: false, error: getErrorMessage(error, "Error deleting task") };
  }
}
