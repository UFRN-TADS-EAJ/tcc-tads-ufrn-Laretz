import { z } from "zod";
import { Role } from "@prisma/client";
import { validationErrorResponseSchema, internalServerErrorResponseSchema } from "./common";

// schema: criar feedback (body)
export const createFeedbackBodySchema = z.object({
  npsScore: z.number().int().min(0).max(10),
  comment: z.string().min(1).max(1000),
  page: z.string().optional(),
  feature: z.string().optional(),
  metadata: z.any().optional(),
});

// schema: listar feedbacks (query)
export const listFeedbacksQuerySchema = z.object({
  page: z.string().optional(),
  feature: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

// schema: metricas feedback (query)
export const metricsQuerySchema = z.object({
  page: z.string().optional(),
  feature: z.string().optional(),
});

// schema: user (feedback)
export const feedbackUserSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

// schema: feedback (item)
export const feedbackSchema = z.object({
  id: z.string(),
  userId: z.string(),
  npsScore: z.number().int(),
  comment: z.string(),
  page: z.string().nullable().optional(),
  feature: z.string().nullable().optional(),
  metadata: z.any().optional(),
  created_at: z.date(),
  user: feedbackUserSchema.optional(),
});

// schema: criar feedback (response)
export const createFeedbackResponseSchema = z.object({
  feedback: feedbackSchema,
  message: z.string().default("Feedback registrado com sucesso"),
});

// schema: listar feedbacks (response)
export const listFeedbacksResponseSchema = z.object({
  feedbacks: z.array(feedbackSchema),
});

// schema: metricas feedback (response)
export const feedbackMetricsSchema = z.object({
  total: z.number().int(),
  averageNps: z.number().nullable(),
  promoters: z.number().int(),
  passives: z.number().int(),
  detractors: z.number().int(),
  byFeature: z.array(
    z.object({ feature: z.string().nullable(), count: z.number().int(), avgNps: z.number().nullable() })
  ),
  byPage: z.array(
    z.object({ page: z.string().nullable(), count: z.number().int(), avgNps: z.number().nullable() })
  ),
});

export { validationErrorResponseSchema, internalServerErrorResponseSchema };
