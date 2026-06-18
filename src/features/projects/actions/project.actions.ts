"use server";

import { revalidatePath } from "next/cache";
import { projectService } from "../services/project.service";
import { ProjectFormValues } from "../validators/project.schema";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

export async function createProjectAction(data: ProjectFormValues) {
  try {
    const project = await projectService.createProject(data);
    revalidatePath("/portal/projects");
    return { success: true, data: project };
  } catch (error: unknown) {
    console.error("Failed to create project:", error);
    return { success: false, error: getErrorMessage(error, "Failed to create project") };
  }
}

export async function updateProjectAction(id: string, data: Partial<ProjectFormValues>) {
  try {
    const project = await projectService.updateProject(id, data);
    revalidatePath("/portal/projects");
    revalidatePath(`/portal/projects/${id}`);
    return { success: true, data: project };
  } catch (error: unknown) {
    console.error("Failed to update project:", error);
    return { success: false, error: getErrorMessage(error, "Failed to update project") };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await projectService.deleteProject(id);
    revalidatePath("/portal/projects");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete project:", error);
    return { success: false, error: getErrorMessage(error, "Failed to delete project") };
  }
}
