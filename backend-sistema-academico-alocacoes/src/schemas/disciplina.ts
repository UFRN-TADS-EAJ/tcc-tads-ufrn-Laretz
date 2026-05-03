import { z } from "zod";
import {
  uuidSchema,
  searchSchema,
  sortSchema,
  positiveIntegerSchema,
  positiveNumberSchema,
  codigoSchema,
  nomeSchema,
} from "./common";

// schema: date|string|null -> string|null
const nullableDateToStringTransform = z.union([z.date(), z.string(), z.null()]).transform((val) => {
  if (val instanceof Date) {
    return val.toISOString();
  }
  return val;
});

// schema: enum tipo de sala
export const tipoDeSalaEnum = z.enum(["Sala", "Lab"], {
  message: "Tipo de sala deve ser 'Sala' ou 'Lab'",
});

// schema: params (disciplina)
export const disciplinaParamsSchema = z.object({
  id: uuidSchema,
});

// schema: criar disciplina (body)
export const criarDisciplinaBodySchema = z.object({
  nome: nomeSchema,
  codigo: codigoSchema.optional(),
  carga_horaria: positiveIntegerSchema,
  id_curso: uuidSchema,
  tipo_de_sala: tipoDeSalaEnum.optional().default("Sala"),
  semestre: positiveIntegerSchema.optional().default(1),
  obrigatoria: z.boolean().optional().default(true),
  periodo_letivo: z.string().optional(),
  data_inicio: z.iso.datetime().optional(),
  data_fim_prevista: z.iso.datetime().optional(),
});

// schema: atualizar disciplina (body)
export const atualizarDisciplinaBodySchema = z
  .object({
    nome: nomeSchema.optional(),
    codigo: codigoSchema.optional(),
    carga_horaria: positiveIntegerSchema.optional(),
    tipo_de_sala: tipoDeSalaEnum.optional(),
    semestre: positiveIntegerSchema.optional(),
    obrigatoria: z.boolean().optional(),
    periodo_letivo: z.string().optional(),
    data_inicio: z.string().datetime().optional(),
    data_fim_prevista: z.string().datetime().optional(),
    data_fim_real: z.string().datetime().optional(),
    horario_consolidado: z.string().optional(),
    aulas_ministradas: z.number().int().nonnegative().optional(),
    carga_horaria_atual: positiveNumberSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Pelo menos um campo deve ser fornecido para atualização",
  });

// schema: buscar disciplinas (query)
export const buscarDisciplinasQuerySchema = searchSchema
  .merge(sortSchema)
  .merge(
    z.object({
      curso_id: uuidSchema.optional(),
      turma_id: uuidSchema.optional(),
      semestre: positiveIntegerSchema.optional(),
      tipo_de_sala: tipoDeSalaEnum.optional(),
      obrigatoria: z.coerce.boolean().optional(),
      periodo_letivo: z.string().optional(),
    })
  );

// schema: buscar disciplinas com progresso (query)
export const buscarDisciplinasComProgressoQuerySchema = z.object({
  turmaId: uuidSchema.optional(),
  cursoId: uuidSchema.optional(),
});

// schema: disciplina (response)
export const disciplinaResponseSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  codigo: z.string().nullable(),
  carga_horaria: z.number().int().positive(),
  total_aulas: z.number().int().nonnegative(),
  aulas_ministradas: z.number().int().nonnegative(),
  carga_horaria_atual: z.number().nonnegative(),
  semestre: z.number().int().positive(),
  tipo_de_sala: tipoDeSalaEnum,
  obrigatoria: z.boolean(),
  periodo_letivo: z.string().nullable(),
  data_inicio: nullableDateToStringTransform,
  data_fim_prevista: nullableDateToStringTransform,
  data_fim_real: nullableDateToStringTransform,
  horario_consolidado: z.string().nullable(),
  id_curso: z.string().uuid(),
  curso: z
    .object({
      id: z.string().uuid(),
      nome: z.string(),
      codigo: z.string().nullable(),
    })
    .optional(),
});

// schema: disciplina com progresso (response)
export const disciplinaComProgressoResponseSchema =
  disciplinaResponseSchema.extend({
    percentual_concluido: z.number().min(0).max(200),
    aulas_restantes: z.number().int().nonnegative(),
    status: z.enum(["NAO_INICIADA", "EM_ANDAMENTO", "CONCLUIDA"]),
    progresso_temporal: z.number().min(0).max(200),
    progresso_aulas: z.number().min(0).max(200),
    aulas_previstas_ate_hoje: z.number().int().nonnegative(),
  });

// schema: criar disciplina (response)
export const criarDisciplinaResponseSchema = z.object({
  disciplina: disciplinaResponseSchema,
  message: z.string().optional(),
});

// schema: buscar disciplina (response)
export const buscarDisciplinaResponseSchema = z.object({
  disciplina: disciplinaResponseSchema,
});

// schema: atualizar disciplina (response)
export const atualizarDisciplinaResponseSchema = z.object({
  disciplina: disciplinaResponseSchema,
  message: z.string().optional(),
});

// schema: buscar disciplinas (response)
export const buscarDisciplinasResponseSchema = z.object({
  disciplinas: z.array(disciplinaResponseSchema),
});

// schema: buscar disciplinas com progresso (response)
export const buscarDisciplinasComProgressoResponseSchema = z.object({
  disciplinas: z.array(disciplinaComProgressoResponseSchema),
});
