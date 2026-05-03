import { z } from "zod";
import { positiveIntegerSchema } from "./common";

// schema: date|string -> string
const dateToStringTransform = z
  .union([z.date(), z.string()])
  .transform((val) => {
    if (val instanceof Date) {
      return val.toISOString();
    }
    return val;
  });

// schema: date|string|null -> string|null
const nullableDateToStringTransform = z
  .union([z.date(), z.string(), z.null()])
  .transform((val) => {
    if (val instanceof Date) {
      return val.toISOString();
    }
    return val;
  });

// schema: params (alocacao)
export const alocacaoParamsSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

// schema: criar alocacao (body)
export const createAlocacaoSchema = z
  .object({
    id_user: z.string().uuid("ID do usuário deve ser um UUID válido"),
    id_curso_disciplina: z
      .string()
      .uuid("ID de cursoDisciplina deve ser um UUID válido"),
    id_turma: z.string().uuid("ID da turma deve ser um UUID válido"),
    id_sala: z.string().uuid("ID da sala deve ser um UUID válido"),
    id_horario: z
      .string()
      .uuid("ID do horário deve ser um UUID válido")
      .optional(),
    id_horarios: z
      .array(z.string().uuid("ID do horário deve ser um UUID válido"))
      .optional(),
  })
  .refine(
    (data) => {
      return (
        (data.id_horario && !data.id_horarios) ||
        (!data.id_horario && data.id_horarios)
      );
    },
    {
      message:
        "Deve fornecer exatamente um dos campos: 'id_horario' ou 'id_horarios'",
    },
  );

// schema: atualizar alocacao (body)
export const updateAlocacaoSchema = z.object({
  id_user: z.string().uuid("ID do usuário deve ser um UUID válido").optional(),
  id_curso_disciplina: z.string().uuid("ID de cursoDisciplina deve ser um UUID válido").optional(),
  id_turma: z.string().uuid("ID da turma deve ser um UUID válido").optional(),
  id_sala: z.string().uuid("ID da sala deve ser um UUID válido").optional(),
  id_horario: z.string().uuid("ID do horário deve ser um UUID válido").optional(),
});

// schema: buscar alocacoes (query)
export const alocacoesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  id_turma: z.string().uuid("ID da turma deve ser um UUID válido").optional(),
});

// schema: buscar grade horarios (query)
export const gradeHorariosQuerySchema = z.object({
  id_turma: z.string().uuid("ID da turma deve ser um UUID válido").optional(),
  id_user: z.string().uuid("ID do usuário deve ser um UUID válido").optional(),
  id_sala: z.string().uuid("ID da sala deve ser um UUID válido").optional(),
  periodoId: z.string().uuid("ID do período deve ser um UUID válido").optional(),
});

// schema: buscar horarios conflitos (query)
export const horariosConflitosQuerySchema = z.object({
  id_turma: z.string().uuid("ID da turma deve ser um UUID válido").optional(),
  id_user: z.string().uuid("ID do usuário deve ser um UUID válido").optional(),
  id_sala: z.string().uuid("ID da sala deve ser um UUID válido").optional(),
  periodoId: z.string().uuid("ID do período deve ser um UUID válido").optional(),
  regime: z.enum(["SUPERIOR", "TECNICO"]).optional(),
});

// schema: alocacoes por professor (params)
export const alocacoesProfessorParamsSchema = z.object({
  id_professor: z.string().uuid("ID do professor deve ser um UUID válido"),
});

// schema: alocacoes por turma (params)
export const alocacoesTurmaTurnoParamsSchema = z.object({
  id_turma: z.string().uuid("ID da turma deve ser um UUID válido"),
});

// schema: alocacoes por turno (query)
export const alocacoesTurmaTurnoQuerySchema = z.object({
  turno: z.string().min(1, "Turno é obrigatório"),
  page: z.coerce.number().int().positive().default(1),
});

// schema: excluir alocacoes da turma (params)
export const excluirAlocacoesTurmaParamsSchema = z.object({
  id_turma: z.string().uuid("ID da turma deve ser um UUID válido"),
});

// schema: excluir alocacoes da disciplina na turma (params)
export const excluirAlocacoesDisciplinaTurmaParamsSchema = z.object({
  id_turma: z.string().uuid("ID da turma deve ser um UUID válido"),
  id_disciplina: z.string().uuid("ID da disciplina deve ser um UUID válido"),
});

// schema: horario (alocacao response)
export const horarioAlocacaoResponseSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  dia_semana: z.string(),
  horario_inicio: dateToStringTransform,
  horario_fim: dateToStringTransform,
});

// schema: disciplina (alocacao response)
export const disciplinaAlocacaoResponseSchema = z.object({
  id: z.string(),
  nome: z.string(),
  codigo: z.string().nullable(),
  carga_horaria: z.number(),
  carga_horaria_atual: z.number(),
  total_aulas: z.number(),
  aulas_ministradas: z.number(),
  tipo_de_sala: z.string(),
  data_inicio: nullableDateToStringTransform,
  data_fim_prevista: nullableDateToStringTransform,
  data_fim_real: nullableDateToStringTransform,
  periodo_letivo: z.string().nullable(),
  horario_consolidado: z.string().nullable(),
  id_curso: z.string(),
  semestre: z.number(),
  obrigatoria: z.boolean(),
});

// schema: usuario (alocacao response)
export const usuarioAlocacaoResponseSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string(),
  role: z.string(),
  especializacao: z.string().nullable(),
  carga_horaria_max: z.number().nullable(),
  preferencia: z.string().nullable(),
});

// schema: turma (alocacao response)
export const turmaAlocacaoResponseSchema = z.object({
  id: z.string(),
  nome: z.string(),
  num_alunos: z.number(),
  semestre: z.number(),
  turno: z.string(),
  id_curso: z.string(),
  ativa: z.boolean(),
});

// schema: predio (alocacao response)
export const predioAlocacaoResponseSchema = z.object({
  id: z.string(),
  nome: z.string(),
  codigo: z.string(),
  descricao: z.string().nullable(),
});

// schema: sala (alocacao response)
export const salaAlocacaoResponseSchema = z.object({
  id: z.string(),
  nome: z.string(),
  ativa: z.boolean(),
  numero: z.string().nullable(),
  capacidade: z.number(),
  tipo: z.string(),
  computadores: z.number(),
  predioId: z.string().nullable(),
  predio: predioAlocacaoResponseSchema.nullable().optional(),
});

// schema: alocacao (response)
export const alocacaoResponseSchema = z.object({
  id: z.string(),
  id_user: z.string(),
  id_curso_disciplina: z.string(),
  id_turma: z.string(),
  id_sala: z.string(),
  id_horario: z.string(),
  created_at: dateToStringTransform,
  user: usuarioAlocacaoResponseSchema.optional(),
  disciplina: disciplinaAlocacaoResponseSchema.optional(),
  turma: turmaAlocacaoResponseSchema.optional(),
  sala: salaAlocacaoResponseSchema.optional(),
  horario: horarioAlocacaoResponseSchema.optional(),
});

// schema: alocacao (grade response)
export const gradeAlocacaoResponseSchema = z.object({
  id: z.string(),
  id_user: z.string(),
  id_disciplina: z.string(),
  id_turma: z.string(),
  id_sala: z.string(),
  id_horario: z.string(),
  is_modulo_principal: z.boolean(),
  created_at: dateToStringTransform,
  user: usuarioAlocacaoResponseSchema.optional(),
  disciplina: disciplinaAlocacaoResponseSchema.optional(),
  turma: turmaAlocacaoResponseSchema.optional(),
  sala: salaAlocacaoResponseSchema.optional(),
  horario: horarioAlocacaoResponseSchema.optional(),
});

// schema: criar alocacao (response)
export const createAlocacaoResponseSchema = z.union([
  z.object({ alocacao: alocacaoResponseSchema, conflitos: z.any().optional() }),
  z.object({
    alocacoes: z.array(alocacaoResponseSchema),
    conflitos: z.any().optional(),
  }),
]);

// schema: alocacao simples (response)
export const alocacaoSimpleResponseSchema = z.object({
  id: z.string(),
  id_user: z.string(),
  id_curso_disciplina: z.string(),
  id_turma: z.string(),
  id_sala: z.string(),
  id_horario: z.string(),
  created_at: dateToStringTransform,
});

// schema: listar alocacoes (response)
export const alocacoesListResponseSchema = z.object({
  alocacoes: z.array(alocacaoResponseSchema),
});

// schema: slot (grade response)
export const horarioAlocacaoSchema = z.object({
  id: z.string(),
  dia_semana: z.string(),
  horario_inicio: dateToStringTransform,
  horario_fim: dateToStringTransform,
  disciplina: z.object({
    id: z.string(),
    nome: z.string(),
    cargaHorariaTotal: z.number(),
  }),
  professor: z.object({
    id: z.string(),
    nome: z.string(),
    especializacao: z.string().nullable(),
  }),
  sala: z.object({
    id: z.string(),
    nome: z.string(),
    predio: z.string(),
    capacidade: z.number(),
    tipo: z.string(),
  }),
  turma: z.object({
    id: z.string(),
    nome: z.string(),
    num_alunos: z.number(),
    periodo: z.number(),
    turno: z.string(),
  }),
});

// schema: grade horarios (response)
export const gradeHorariosResponseSchema = z.object({
  gradeHorarios: z.object({
    segunda: z.array(horarioAlocacaoSchema),
    terca: z.array(horarioAlocacaoSchema),
    quarta: z.array(horarioAlocacaoSchema),
    quinta: z.array(horarioAlocacaoSchema),
    sexta: z.array(horarioAlocacaoSchema),
    sabado: z.array(horarioAlocacaoSchema),
  }),
  grade: z.record(
    z.string(),
    z.record(z.string(), z.array(gradeAlocacaoResponseSchema)),
  ),
});

// schema: carga horaria professores (response)
export const quantidadeAulasProfessorResponseSchema = z.object({
  cargaHoraria: z.record(z.string(), z.number()),
});

export const horariosConflitosResponseSchema = z.object({
  conflitos: z.record(
    z.string(),
    z.enum([
      "professor",
      "sala",
      "turma",
      "professor_sala",
      "professor_turma",
      "sala_turma",
      "todos",
    ]),
  ),
});

export const gradeHorariosBootstrapQuerySchema = z.object({
  regime: z.enum(["SUPERIOR", "TECNICO"]).optional(),
  orderPeriodos: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const gradeHorariosBootstrapResponseSchema = z.object({
  turmas: z.array(
    z.object({
      id: z.string().uuid(),
      nome: z.string(),
    }),
  ),
  salas: z.array(
    z.object({
      id: z.string().uuid(),
      nome: z.string(),
      predio: z
        .object({
          id: z.string().uuid(),
          nome: z.string(),
          codigo: z.string(),
          descricao: z.string().nullable(),
        })
        .nullable(),
    }),
  ),
  professores: z.array(
    z.object({
      id: z.string().uuid(),
      nome: z.string(),
      email: z.string(),
      role: z.enum(["ADMIN", "PROFESSOR", "COORDENADOR"]),
    }),
  ),
  periodoAtivo: z
    .object({
      id: z.string().uuid(),
      nome: z.string(),
    })
    .nullable(),
  periodos: z.array(
    z.object({
      id: z.string().uuid(),
      nome: z.string(),
      status: z.enum(["ATIVO", "ENCERRADO", "FUTURO"]),
    }),
  ),
  gradeConfig: z.object({
    regime: z.enum(["SUPERIOR", "TECNICO"]),
    dias: z.array(z.object({ key: z.string(), label: z.string() })),
    codigos: z.array(z.string()),
  }),
});

export const alocacoesBootstrapQuerySchema = z.object({
  regime: z.enum(["SUPERIOR", "TECNICO"]).optional(),
});

export const alocacoesBootstrapResponseSchema = z.object({
  turmas: z.array(
    z.object({
      id: z.string().uuid(),
      nome: z.string(),
      id_curso: z.string().uuid(),
      turno: z.string(),
      semestre: z.number(),
    }),
  ),
  salas: z.array(
    z.object({
      id: z.string().uuid(),
      nome: z.string(),
      capacidade: z.number(),
      tipo: z.string(),
      computadores: z.number(),
      predio: z.object({
        id: z.string().uuid(),
        nome: z.string(),
        codigo: z.string(),
      }),
    }),
  ),
  professores: z.array(
    z.object({
      id: z.string().uuid(),
      nome: z.string(),
      email: z.string(),
      role: z.enum(["ADMIN", "PROFESSOR", "COORDENADOR"]),
    }),
  ),
  disciplinas: z.array(
    z.object({
      id: z.string().uuid(),
      nome: z.string(),
      codigo: z.string().nullable(),
      carga_horaria: z.number(),
      tipo_de_sala: z.enum(["Sala", "Lab"]),
      semestre: z.number(),
      obrigatoria: z.boolean(),
      id_curso: z.string().uuid(),
    }),
  ),
  horarios: z.array(
    z.object({
      id: z.string().uuid(),
      codigo: z.string(),
      dia_semana: z.string(),
      horario_inicio: z.string(),
      horario_fim: z.string(),
    }),
  ),
});

// schema: erro (alocacao nao encontrada)
export const alocacaoNotFoundErrorSchema = z.object({
  message: z.string().default("Alocação não encontrada"),
});

// schema: erro (conflito)
export const conflictErrorSchema = z.object({
  message: z.string(),
});

// schema: erro (validacao)
export const alocacaoValidationErrorSchema = z.object({
  message: z.string(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});
export type HorariosConflitosQueryRequest = z.infer<
  typeof horariosConflitosQuerySchema
>;
export type GradeHorariosResponse = z.infer<typeof gradeHorariosResponseSchema>;
export type HorariosConflitosResponse = z.infer<
  typeof horariosConflitosResponseSchema
>;
export type GradeHorariosBootstrapQueryRequest = z.infer<
  typeof gradeHorariosBootstrapQuerySchema
>;
export type GradeHorariosBootstrapResponse = z.infer<
  typeof gradeHorariosBootstrapResponseSchema
>;
export type AlocacoesBootstrapQueryRequest = z.infer<
  typeof alocacoesBootstrapQuerySchema
>;
export type AlocacoesBootstrapResponse = z.infer<
  typeof alocacoesBootstrapResponseSchema
>;

export type GradeAlocacaoDTO = z.infer<typeof gradeAlocacaoResponseSchema>;
export type HorarioAlocacaoDTO = z.infer<typeof horarioAlocacaoSchema>;
