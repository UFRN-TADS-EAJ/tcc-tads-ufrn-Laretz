import { z } from "zod";
import { Role } from "@prisma/client";
import {
  uuidSchema,
  searchSchema,
  sortSchema,
  paginationSchema,
  nonEmptyStringSchema,
} from "./common";
import { alocacaoResponseSchema } from "./alocacao";
import { disciplinaProfessorResponseSchema } from "./professor-disciplina";
import {
  horarioResponseSchema,
  horariosGradeConfigResponseSchema,
} from "./horarios";

// schema: params (user)
export const userParamsSchema = z.object({
  id: uuidSchema,
});

// schema: registrar usuario (body)
export const registerUserSchema = z
  .object({
    nome: nonEmptyStringSchema,
    email: z.string().email({
      message: "Email deve ter um formato válido",
    }),
    senha: z.string().min(6, {
      message: "Senha deve ter pelo menos 6 caracteres",
    }),
    role: z.nativeEnum(Role).optional(),
    especializacao: z.string().optional(),
    carga_horaria_max: z.number().positive().optional(),
    preferencia: z.string().optional(),
  })
  .transform((data) => {
    const cleaned: {
      nome: string;
      email: string;
      senha: string;
      role?: Role;
      especializacao?: string;
      carga_horaria_max?: number;
      preferencia?: string;
    } = {
      nome: data.nome,
      email: data.email,
      senha: data.senha,
    };

    if (data.role !== undefined) cleaned.role = data.role;
    if (data.especializacao !== undefined) cleaned.especializacao = data.especializacao;
    if (data.carga_horaria_max !== undefined) cleaned.carga_horaria_max = data.carga_horaria_max;
    if (data.preferencia !== undefined) cleaned.preferencia = data.preferencia;

    return cleaned;
  });

// schema: autenticar usuario (body)
export const authenticateUserSchema = z.object({
  email: z.string().email({
    message: "Email deve ter um formato válido",
  }),
  senha: z.string().min(6, {
    message: "Senha deve ter pelo menos 6 caracteres",
  }),
});

// schema: atualizar usuario (body)
export const updateUserSchema = z.object({
  nome: nonEmptyStringSchema.optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  role: z.nativeEnum(Role).optional(),
  especializacao: z.string().optional(),
  carga_horaria_max: z.number().positive().optional(),
  preferencia: z.string().optional(),
});

// schema: buscar usuarios (query)
export const userQuerySchema = z.object({
  ...searchSchema.shape,
  ...sortSchema.shape,
  ...paginationSchema.shape,
  role: z.nativeEnum(Role).optional(),
});

// schema: refresh token (body)
export const refreshTokenSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

// schema: user (response)
export const userSchema = z.object({
  id: uuidSchema,
  nome: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  especializacao: z.string().nullable(),
  carga_horaria_max: z.number().nullable(),
  preferencia: z.string().nullable(),
});

// schema: auth (response)
export const authResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});

// schema: refresh token (response)
export const refreshResponseSchema = z.object({
  token: z.string(),
});

// schema: user (response wrapper)
export const userResponseSchema = z.union([
  z.object({ usuario: userSchema }),
  z.object({ user: userSchema }),
]);

// schema: listar usuarios (response)
export const usersListResponseSchema = z.object({
  usuarios: z.array(userSchema),
});

// schema: perfil (response)
export const profileResponseSchema = z.object({
  user: userSchema,
});

// schema: verify token (response)
export const verifyTokenResponseSchema = z.object({
  valid: z.boolean(),
  user: z
    .object({
      id: z.string(),
      role: z.nativeEnum(Role),
    })
    .optional(),
});

// schema: bootstrap grade horarios professor (response)
export const gradeHorariosProfessorBootstrapResponseSchema = z.object({
  professor: userSchema,
  alocacoes: z.array(alocacaoResponseSchema),
  cursos: z.array(
    z.object({
      id: uuidSchema,
      codigo: z.string(),
      nome: z.string(),
      turno: z.enum(["MATUTINO", "VESPERTINO", "NOTURNO", "INTEGRAL"]),
      duracao_semestres: z.number(),
      vinculo: z.object({
        id: uuidSchema,
        ativo: z.boolean(),
        created_at: z.string(),
      }),
    }),
  ),
  disciplinas: z.array(disciplinaProfessorResponseSchema),
  gradeConfig: horariosGradeConfigResponseSchema,
  horarios: z.array(horarioResponseSchema),
});

// schema: erro (credenciais invalidas)
export const invalidCredentialsErrorSchema = z.object({
  message: z.string(),
});

// schema: erro (usuario ja existe)
export const userAlreadyExistsErrorSchema = z.object({
  message: z.string(),
});

// schema: erro (usuario nao encontrado)
export const userNotFoundErrorSchema = z.object({
  message: z.string(),
});

// schema: erro (token invalido)
export const invalidTokenErrorSchema = z.object({
  message: z.string(),
});
export type GradeHorariosProfessorBootstrapResponse = z.infer<
  typeof gradeHorariosProfessorBootstrapResponseSchema
>;
