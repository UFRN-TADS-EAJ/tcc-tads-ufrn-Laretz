import { z } from "zod";

const recurrenceRuleSchema = z.enum(["WEEKLY"]);

// schema: body criar reserva
export const createReservaSalaSchema = z.object({
  salaId: z.string().uuid(),
  horarioId: z.string().uuid(),
  date: z.string().or(z.date()),
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  recurrenceRule: recurrenceRuleSchema.optional(),
  recurrenceEnd: z.string().or(z.date()).optional(),
});

// schema: query buscar reservas
export const reservasQuerySchema = z.object({
  salaId: z.string().uuid().optional(),
  horarioId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
});

// schema: params (reserva)
export const reservaParamsSchema = z.object({
  id: z.string().uuid(),
});

// schema: params (série)
export const seriesParamsSchema = z.object({
  seriesId: z.string().uuid(),
});

// schema: core (reserva)
export const reservaSalaCoreSchema = z.object({
  id: z.string().uuid(),
  salaId: z.string().uuid(),
  horarioId: z.string().uuid(),
  date: z.string(),
  titulo: z.string(),
  descricao: z.string().nullable().optional(),
  criado_por: z.string().uuid(),
  status: z.enum(["ATIVA", "CANCELADA"]),
  recurrenceRule: recurrenceRuleSchema.nullable().optional(),
  recurrenceEnd: z.string().nullable().optional(),
  seriesId: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  criadorNome: z.string().optional(),
});

// schema: response (reserva)
export const reservaSalaResponseSchema = z.object({
  reserva: reservaSalaCoreSchema,
});

// schema: response listar reservas
export const reservasListResponseSchema = z.object({
  reservas: z.array(reservaSalaCoreSchema),
});
