import { z } from "zod";

const dateToStringTransform = z.union([z.date(), z.string()]).transform((v) =>
  v instanceof Date ? v.toISOString().slice(0, 10) : v,
);

// schema: params (período letivo)
export const periodoLetivoParamsSchema = z.object({
  id: z.string().uuid(),
});

const periodoLetivoBodySchema = z.object({
  nome: z.string().min(3),
  data_inicio: z.string().or(z.date()),
  data_fim: z.string().or(z.date()),
});

// schema: body criar período letivo
export const createPeriodoLetivoSchema = periodoLetivoBodySchema;

// schema: body avançar período letivo
export const avancarPeriodoLetivoSchema = periodoLetivoBodySchema;

// schema: core (período letivo)
export const periodoLetivoCoreSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  data_inicio: dateToStringTransform,
  data_fim: dateToStringTransform,
  ativo: z.boolean(),
  status: z.enum(["ATIVO", "ENCERRADO", "FUTURO"]),
  created_at: z.string(),
  updated_at: z.string(),
});

// schema: response (período letivo)
export const periodoLetivoResponseSchema = z.object({
  periodo: periodoLetivoCoreSchema,
});

// schema: query listar períodos letivos
export const periodosLetivosListQuerySchema = z.object({
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// schema: response listar períodos letivos
export const periodosLetivosListResponseSchema = z.object({
  periodos: z.array(periodoLetivoCoreSchema),
});
