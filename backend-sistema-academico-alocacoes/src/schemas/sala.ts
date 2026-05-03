import { z } from "zod";
import {
  uuidSchema,
  searchSchema,
  sortSchema,
  positiveIntegerSchema,
  nomeSchema,
} from "./common";

// schema: params (sala)
export const salaParamsSchema = z.object({
  id: uuidSchema,
});

// schema: criar sala (body)
export const createSalaSchema = z.object({
  nome: nomeSchema,
  numero: z.string().optional(),
  predioId: uuidSchema,
  capacidade: positiveIntegerSchema,
  tipo: z.string(),
  computadores: z
    .number()
    .int("Deve ser um número inteiro")
    .min(0, "Deve ser um número inteiro não negativo")
    .optional()
    .default(0),
});

// schema: atualizar sala (body)
export const updateSalaSchema = z.object({
  nome: nomeSchema.optional(),
  numero: z.string().optional(),
  predioId: uuidSchema.optional(),
  capacidade: positiveIntegerSchema.optional(),
  tipo: z.string().optional(),
  computadores: z
    .number()
    .int("Deve ser um número inteiro")
    .min(0, "Deve ser um número inteiro não negativo")
    .optional(),
});

// schema: buscar salas (query)
export const salaQuerySchema = z.object({
  ...searchSchema.shape,
  ...sortSchema.shape,
  predioId: uuidSchema.optional(),
});

// schema: sala (response)
export const salaSchema = z.object({
  id: uuidSchema,
  nome: z.string(),
  numero: z.string().nullable(),
  capacidade: z.number(),
  tipo: z.string(),
  computadores: z.number(),
  predioId: z.string().nullable(),
  ativa: z.boolean(),
});

// schema: sala com predio (response)
export const salaComPredioSchema = salaSchema.extend({
  predio: z
    .object({
      id: uuidSchema,
      codigo: z.string(),
      nome: z.string(),
    })
    .nullable(),
});

// schema: sala (response wrapper)
export const salaResponseSchema = z.object({
  sala: salaSchema,
});

// schema: salas (response)
export const salasListResponseSchema = z.object({
  salas: z.array(salaComPredioSchema),
});

// schema: buscar salas por predio (params)
export const buscarSalasPorPredioParamsSchema = z.object({
  predioId: uuidSchema,
});
