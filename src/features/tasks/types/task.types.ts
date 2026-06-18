import { Database } from "@/types/database.types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export type TaskTag = Database["public"]["Tables"]["task_tags"]["Row"];
export type TaskTagInsert = Database["public"]["Tables"]["task_tags"]["Insert"];

export type TaskWithTags = Task & {
  task_tags?: TaskTag[];
};

export const TASK_STATUS = {
  BELUM_DIMULAI: "belum_dimulai",
  SEDANG_DIKERJAKAN: "sedang_dikerjakan",
  SELESAI: "selesai",
  DITUNDA: "ditunda",
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  RENDAH: "rendah",
  NORMAL: "normal",
  TINGGI: "tinggi",
  KRITIS: "kritis",
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
