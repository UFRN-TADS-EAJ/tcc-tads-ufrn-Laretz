import { z } from "zod";
import {
  uuidSchema,
  paginationSchema,
  searchSchema,
  sortSchema,
  turnoEnum,
  positiveIntegerSchema,
  codigoSchema,
  nomeSchema,
  errorResponseSchema,
  validationErrorResponseSchema,
  notFoundResponseSchema,
  internalServerErrorResponseSchema,
} from "./common";

// schema: params (curso)
export const cursoParamsSchema = z.object({
  id: uuidSchema,
});

// schema: criar curso (body)
export const criarCursoBodySchema = z.object({
  codigo: codigoSchema,
  nome: nomeSchema,
  turno: turnoEnum,
  duracao_semestres: positiveIntegerSchema,
});

// schema: atualizar curso (body)
export const atualizarCursoBodySchema = z
  .object({
    codigo: codigoSchema.optional(),
    nome: nomeSchema.optional(),
    turno: turnoEnum.optional(),
    duracao_semestres: positiveIntegerSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Pelo menos um campo deve ser fornecido para atualização",
  });

// schema: buscar cursos (query)
export const buscarCursosQuerySchema = paginationSchema
  .merge(searchSchema)
  .merge(sortSchema)
  .merge(
    z.object({
      turno: turnoEnum.optional(),
      ativo: z.coerce.boolean().optional(),
    })
  );

// schema: curso (response)
export const cursoResponseSchema = z.object({
  id: z.uuid(),
  codigo: z.string(),
  nome: z.string(),
  turno: turnoEnum,
  duracao_semestres: z.number().int().positive(),
  ativo: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

// schema: criar curso (response)
export const criarCursoResponseSchema = z.object({
  curso: cursoResponseSchema,
  message: z.string(),
});

// schema: buscar curso (response)
export const buscarCursoResponseSchema = z.object({
  curso: cursoResponseSchema,
});

// schema: atualizar curso (response)
export const atualizarCursoResponseSchema = z.object({
  curso: cursoResponseSchema,
  message: z.string(),
});

// schema: buscar cursos (response)
export const buscarCursosResponseSchema = z.object({
  cursos: z.array(cursoResponseSchema),
});

// re-export (schemas comuns de erro)
export {
  errorResponseSchema,
  validationErrorResponseSchema,
  notFoundResponseSchema,
  internalServerErrorResponseSchema,
};
