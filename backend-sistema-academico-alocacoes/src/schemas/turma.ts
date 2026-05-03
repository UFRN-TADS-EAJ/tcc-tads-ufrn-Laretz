import { z } from 'zod';
import { 
  uuidSchema, 
  paginationSchema, 
  searchSchema, 
  sortSchema,
  nomeSchema,
  turnoEnum
} from './common';

// schema: params (turma)
export const turmaParamsSchema = z.object({
  id: uuidSchema
});

// schema: criar turma (body)
export const createTurmaSchema = z.object({
  nome: nomeSchema,
  num_alunos: z.number().int().positive({ message: 'Número de alunos deve ser positivo' }),
  turno: turnoEnum,
  id_curso: uuidSchema,
  semestre: z.number().int().positive({ message: 'Semestre deve ser positivo' }),
  ativa: z.boolean().optional()
});

// schema: atualizar turma (body)
export const updateTurmaSchema = z.object({
  nome: nomeSchema.optional(),
  num_alunos: z.number().int().positive({ message: 'Número de alunos deve ser positivo' }).optional(),
  turno: turnoEnum.optional(),
  id_curso: uuidSchema.optional(),
  semestre: z.number().int().positive({ message: 'Semestre deve ser positivo' }).optional(),
  ativa: z.boolean().optional()
});

// schema: buscar turmas (query)
export const turmaQuerySchema = z.object({
  ...paginationSchema.shape,
  ...searchSchema.shape,
  ...sortSchema.shape,
  turno: turnoEnum.optional(),
  semestre: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()).optional(),
  ativa: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  id_curso: uuidSchema.optional()
});

// schema: turma (response)
export const turmaSchema = z.object({
  id: uuidSchema,
  nome: z.string(),
  num_alunos: z.number(),
  turno: z.string(),
  id_curso: z.string(),
  semestre: z.number(),
  ativa: z.boolean()
});

// schema: turma (response wrapper)
export const turmaResponseSchema = z.object({
  turma: turmaSchema
});

// schema: turmas (response paginado)
export const turmasListResponseSchema = z.object({
  turmas: z.array(turmaSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
});
