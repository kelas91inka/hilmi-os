import { z } from "zod";
import { PROJECT_STATUS, PROJECT_VISIBILITY } from "../types/project.types";

export const projectSchema = z.object({
  title: z.string().min(1, { message: "Judul project tidak boleh kosong" }),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(PROJECT_STATUS).default(PROJECT_STATUS.PLANNING),
  visibility: z.nativeEnum(PROJECT_VISIBILITY).default(PROJECT_VISIBILITY.PRIVATE),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const projectTimelineSchema = z.object({
  title: z.string().min(1, { message: "Judul milestone tidak boleh kosong" }),
  description: z.string().optional().nullable(),
  event_date: z.string().optional().nullable(),
});

export type ProjectTimelineFormValues = z.infer<typeof projectTimelineSchema>;
