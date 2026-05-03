import { z } from 'zod';
import { 
  uuidSchema, 
  searchSchema, 
  codigoSchema,
  nomeSchema
} from './common';

// schema: params (predio)
export const predioParamsSchema = z.object({
  id: uuidSchema
});

// schema: criar predio (body)
export const createPredioSchema = z.object({
  codigo: codigoSchema,
  nome: nomeSchema,
  descricao: z.string().optional()
});

// schema: atualizar predio (body)
export const updatePredioSchema = z.object({
  codigo: codigoSchema.optional(),
  nome: nomeSchema.optional(),
  descricao: z.string().optional()
});

// schema: buscar predios (query)
export const predioQuerySchema = z.object({
  ...searchSchema.shape,
  sortBy: z
    .enum(["nome", "codigo", "created_at", "updated_at", "descricao"])
    .optional()
    .default("nome"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// schema: predio (response)
export const predioSchema = z.object({
  id: uuidSchema,
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date()
});

// schema: sala simplificada (predio response)
export const salaSimplificadaSchema = z.object({
  id: uuidSchema,
  nome: z.string(),
  numero: z.string().nullable(),
  capacidade: z.number(),
  tipo: z.string(),
  computadores: z.number(),
  ativa: z.boolean(),
});

// schema: predio com salas (response)
export const predioComSalasSchema = predioSchema.extend({
  salas: z.array(salaSimplificadaSchema)
});

// schema: predio (response wrapper)
export const predioResponseSchema = z.object({
  predio: predioSchema
});

// schema: predios (response)
export const prediosListResponseSchema = z.object({
  predios: z.array(predioComSalasSchema)
});
