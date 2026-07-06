import { z } from "zod";
import { TASK_STATUS, TASK_PRIORITY } from "../types/task.types";

export const taskSchema = z.object({
  title: z.string().min(1, { message: "Judul tidak boleh kosong" }),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TASK_STATUS).default(TASK_STATUS.BELUM_DIMULAI),
  priority: z.nativeEnum(TASK_PRIORITY).default(TASK_PRIORITY.NORMAL),
  due_date: z.string().optional().nullable(),
  project_id: z.union([z.string().uuid(), z.literal(""), z.literal("none")]).optional().nullable().transform(val => (val === "" || val === "none" ? null : val)),
  goal_id: z.union([z.string().uuid(), z.literal(""), z.literal("none")]).optional().nullable().transform(val => (val === "" || val === "none" ? null : val)),
  tags: z.array(z.string()).default([]),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
