import { z } from "zod";
import { uuidSchema } from "./common";

// schema: params (user)
export const idUserParamsSchema = z.object({
  id_user: uuidSchema,
});

// schema: params (disciplina)
export const idDisciplinaParamsSchema = z.object({
  id_disciplina: uuidSchema,
});

// schema: vincular professor-disciplina (body)
export const vincularProfessorDisciplinaSchema = z.object({
  id_user: uuidSchema,
  id_disciplina: uuidSchema,
});

// schema: desvincular professor-disciplina (body)
export const desvincularProfessorDisciplinaSchema = z.object({
  id_user: uuidSchema,
  id_disciplina: uuidSchema,
});

// schema: disciplina (professor response)
export const disciplinaProfessorResponseSchema = z.object({
  id: uuidSchema,
  nome: z.string(),
  carga_horaria: z.number(),
  total_aulas: z.number(),
  carga_horaria_atual: z.number(),
  tipo_de_sala: z.enum(["Sala", "Lab"]),
  codigo: z.string().nullable(),
  semestre: z.number(),
  obrigatoria: z.boolean(),
  curso: z.object({
    id: uuidSchema,
    nome: z.string(),
    codigo: z.string(),
  }),
  vinculo: z.object({
    id: uuidSchema,
    ativo: z.boolean(),
    created_at: z.string(),
  }),
});

// schema: professor (disciplina response)
export const professorResponseSchema = z.object({
  id: uuidSchema,
  nome: z.string(),
  email: z.string().email(),
  especializacao: z.string().nullable(),
  carga_horaria_max: z.number().nullable(),
  preferencia: z.string().nullable(),
  vinculo: z.object({
    id: uuidSchema,
    ativo: z.boolean(),
    created_at: z.string(),
  }),
});

// schema: vinculo professor-disciplina (response)
export const professorDisciplinaResponseSchema = z.object({
  id: uuidSchema,
  id_user: uuidSchema,
  id_disciplina: uuidSchema,
  ativo: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

// schema: success (response)
export const successResponseSchema = z.object({
  success: z.boolean(),
});

// schema: listar disciplinas do professor (response)
export const disciplinasProfessorResponseSchema = z.object({
  disciplinas: z.array(disciplinaProfessorResponseSchema),
});

// schema: listar professores da disciplina (response)
export const professoresDisciplinaResponseSchema = z.object({
  professores: z.array(professorResponseSchema),
});

// schema: bootstrap professor-disciplina (response)
export const professorDisciplinaBootstrapResponseSchema = z.object({
  professores: z.array(
    z.object({
      id: uuidSchema,
      nome: z.string(),
      email: z.string().email(),
      especializacao: z.string().nullable(),
    }),
  ),
  disciplinas: z.array(
    z.object({
      id: uuidSchema,
      nome: z.string(),
      codigo: z.string().nullable(),
      carga_horaria: z.number(),
      tipo_de_sala: z.enum(["Sala", "Lab"]),
      semestre: z.number(),
      obrigatoria: z.boolean(),
      curso: z.object({
        id: uuidSchema,
        nome: z.string(),
        codigo: z.string(),
      }),
    }),
  ),
  cursos: z.array(
    z.object({
      id: uuidSchema,
      nome: z.string(),
      codigo: z.string(),
    }),
  ),
});
export type ProfessorDisciplinaResponse = z.infer<
  typeof professorDisciplinaResponseSchema
>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type DisciplinasProfessorResponse = z.infer<
  typeof disciplinasProfessorResponseSchema
>;
export type ProfessoresDisciplinaResponse = z.infer<
  typeof professoresDisciplinaResponseSchema
>;
export type ProfessorDisciplinaBootstrapResponse = z.infer<
  typeof professorDisciplinaBootstrapResponseSchema
>;
