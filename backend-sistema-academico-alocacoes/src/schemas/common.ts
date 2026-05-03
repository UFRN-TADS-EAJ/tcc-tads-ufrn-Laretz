import { z } from "zod";

/* schemas comuns (reutilizáveis) */

// schema: uuid
export const uuidSchema = z.uuid({
  message: "Deve ser um UUID válido"
});

// schema: paginacao
export const paginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined) return 1;
      if (typeof val === 'string') return parseInt(val, 10);
      return val;
    })
    .refine((val) => val > 0, {
      message: "Página deve ser maior que 0"
    }),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined) return 20;
      if (typeof val === 'string') return parseInt(val, 10);
      return val;
    })
    .refine((val) => val > 0 && val <= 100, {
      message: "Limite deve estar entre 1 e 100"
    })
});

// schema: busca
export const searchSchema = z.object({
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim())
    .refine((val) => !val || val.length >= 2, {
      message: "Busca deve ter pelo menos 2 caracteres"
    })
});

// schema: ordenacao
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc")
});

// schema: turno
export const turnoEnum = z.enum(["MATUTINO", "VESPERTINO", "NOTURNO", "INTEGRAL"], {
  message: "Turno deve ser MATUTINO, VESPERTINO, NOTURNO ou INTEGRAL"
});

// schema: string nao vazia
export const nonEmptyStringSchema = z
  .string()
  .min(1, "Campo obrigatório")
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, {
    message: "Campo não pode estar vazio"
  });

// schema: numero positivo
export const positiveNumberSchema = z
  .number()
  .positive("Deve ser um número positivo");

// schema: inteiro positivo
export const positiveIntegerSchema = z
  .number()
  .int("Deve ser um número inteiro")
  .positive("Deve ser um número positivo");

// schema: codigo
export const codigoSchema = z
  .string()
  .min(1, "Código é obrigatório")
  .max(20, "Código deve ter no máximo 20 caracteres")
  .regex(/^[A-Z0-9-_]+$/i, "Código deve conter apenas letras, números, hífens e underscores")
  .transform((val) => val.trim().toUpperCase());

// schema: nome
export const nomeSchema = z
  .string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .transform((val) => val.trim())
  .refine((val) => val.length >= 2, {
    message: "Nome não pode estar vazio após remoção de espaços"
  });

// schema: erro (padrao)
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// schema: erro (validacao)
export const validationErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

// schema: erro (not found)
export const notFoundResponseSchema = z.object({
  error: z.string().default("Recurso não encontrado"),
  message: z.string(),
});

// schema: erro (500)
export const internalServerErrorResponseSchema = z.object({
  message: z.string().default("Ocorreu um erro inesperado"),
});
