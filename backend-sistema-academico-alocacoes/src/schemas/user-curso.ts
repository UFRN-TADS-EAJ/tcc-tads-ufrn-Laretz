import { z } from "zod";
import {
  uuidSchema,
  paginationSchema,
  searchSchema,
  sortSchema,
} from "./common";

// schema: params (user)
export const userCursoUserParamsSchema = z.object({
  id_user: uuidSchema,
});

// schema: params (curso)
export const userCursoCursoParamsSchema = z.object({
  id_curso: uuidSchema,
});

// schema: vincular user-curso (body)
export const vincularUserCursoSchema = z.object({
  id_user: uuidSchema,
  id_curso: uuidSchema,
});

// schema: desvincular user-curso (body)
export const desvincularUserCursoSchema = z.object({
  id_user: uuidSchema,
  id_curso: uuidSchema,
});

// schema: buscar user-curso (query)
export const userCursoQuerySchema = z.object({
  ...paginationSchema.shape,
  ...searchSchema.shape,
  ...sortSchema.shape,
});

// schema: curso vinculado (response)
export const cursoVinculadoResponseSchema = z.object({
  id: uuidSchema,
  codigo: z.string(),
  nome: z.string(),
  turno: z.enum(["MATUTINO", "VESPERTINO", "NOTURNO", "INTEGRAL"]),
  duracao_semestres: z.number(),
  vinculo: z.object({
    id: uuidSchema,
    ativo: z.boolean(),
    created_at: z.date(),
  }),
});

// schema: usuario vinculado (response)
export const usuarioResponseSchema = z.object({
  id: uuidSchema,
  nome: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "PROFESSOR", "COORDENADOR"]),
  especializacao: z.string().nullable(),
  carga_horaria_max: z.number().nullable(),
  preferencia: z.string().nullable(),
  vinculo: z.object({
    id: uuidSchema,
    ativo: z.boolean(),
    created_at: z.date(),
  }),
});

// schema: vinculo user-curso (response)
export const userCursoResponseSchema = z.object({
  id: uuidSchema,
  id_user: uuidSchema,
  id_curso: uuidSchema,
  ativo: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

// schema: cursos do usuario (response)
export const cursosUsuarioListResponseSchema = z.object({
  cursos: z.array(cursoVinculadoResponseSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional(),
});

// schema: usuarios do curso (response)
export const usuariosCursoListResponseSchema = z.object({
  usuarios: z.array(usuarioResponseSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional(),
});
