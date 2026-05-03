import { z } from "zod";
import { uuidSchema, paginationSchema, searchSchema, sortSchema } from "./common";

// schema: date|string -> string
const dateToStringTransform = z.union([z.date(), z.string()]).transform((val) => {
  if (val instanceof Date) {
    return val.toISOString();
  }
  return val;
});

// schema: params (horario)
export const idHorarioParamsSchema = z.object({
  id: uuidSchema,
});

// schema: criar horario (body)
export const criarHorarioSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório").transform((v) => v.trim().toUpperCase()),
  dia_semana: z.string().min(1, "Dia da semana é obrigatório"),
  horario_inicio: z.string().transform(str => new Date(str)),
  horario_fim: z.string().transform(str => new Date(str)),
});

// schema: criar horario (codigo)
export const criarHorarioCodigoSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório").transform((v) => v.trim().toUpperCase()),
});

// schema: atualizar horario (body)
export const atualizarHorarioSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório").transform((v) => v.trim().toUpperCase()).optional(),
  dia_semana: z.string().min(1, "Dia da semana é obrigatório").optional(),
  horario_inicio: z.string().transform(str => new Date(str)).optional(),
  horario_fim: z.string().transform(str => new Date(str)).optional(),
});

// schema: buscar horarios (query)
export const buscarHorariosQuerySchema = z.object({
  ...paginationSchema.shape,
  ...searchSchema.shape,
  dia_semana: z.string().optional(),
  regime: z.enum(["SUPERIOR", "TECNICO"]).optional(),
  ...sortSchema.shape,
  orderBy: z.enum(["codigo", "dia_semana", "horario_inicio", "horario_fim", "created_at"]).default("codigo"),
});

// schema: grade config (query)
export const horariosGradeConfigQuerySchema = z.object({
  regime: z.enum(["SUPERIOR", "TECNICO"]).optional(),
});

// schema: horario (response)
export const horarioResponseSchema = z.object({
  id: uuidSchema,
  codigo: z.string(),
  dia_semana: z.string(),
  horario_inicio: dateToStringTransform,
  horario_fim: dateToStringTransform,
  regime: z.enum(["SUPERIOR", "TECNICO"]).optional(),
});

// schema: horarios (response paginado)
export const horariosListResponseSchema = z.object({
  horarios: z.array(horarioResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// schema: horarios (response simples)
export const horariosSimpleResponseSchema = z.object({
  horarios: z.array(horarioResponseSchema),
});

// schema: grade config (response)
export const horariosGradeConfigResponseSchema = z.object({
  regime: z.enum(["SUPERIOR", "TECNICO"]),
  dias: z.array(z.object({ key: z.string(), label: z.string() })),
  codigos: z.array(z.string()),
});
export type HorariosGradeConfigResponse = z.infer<typeof horariosGradeConfigResponseSchema>;
