import { FastifyInstance } from "fastify";
import { z } from "zod";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";

// Importação dos controllers
import { criarAlocacao } from "./criar-alocacao";
import { buscarAlocacoes } from "./buscar-alocacoes";
import { buscarAlocacao } from "./buscar-alocacao";
import { atualizarAlocacao } from "./atualizar-alocacao";
import { excluirAlocacao } from "./excluir-alocacao";
import { buscarGradeHorarios } from "./buscar-grade-horarios";
import { buscarGradeHorarios as buscarGradeHorariosGeral } from "./buscar-grade-horarios-geral";
import { buscarAlocacoesTurnoManha } from "./buscar-alocacoes-turno-manha";
import { buscarAlocacoesTurmaTurno } from "./buscar-alocacoes-turma-turno";
import { buscarAlocacoesPorTurma } from "./buscar-alocacoes-por-turma";
import { excluirTodasAlocacoesTurma } from "./excluir-todas-alocacoes-turma";
import { buscarAlocacoesProfessor } from "./buscar-alocacoes-professor";
import { buscarQuantidadeAulasPorProfessor } from "./buscar-quantidade-aulas-professores";
import { excluirAlocacoesDisciplinaTurma } from "./excluir-alocacoes-disciplina-turma-controller";
import { buscarHorariosConflitos } from "./buscar-horarios-conflitos";
import { buscarGradeHorariosBootstrap } from "./buscar-grade-horarios-bootstrap";
import { buscarAlocacoesBootstrap } from "./buscar-alocacoes-bootstrap";

// Importação dos schemas
import {
  alocacaoParamsSchema,
  createAlocacaoSchema,
  updateAlocacaoSchema,
  alocacoesQuerySchema,
  gradeHorariosQuerySchema,
  horariosConflitosQuerySchema,
  gradeHorariosBootstrapQuerySchema,
  alocacoesBootstrapQuerySchema,
  alocacoesProfessorParamsSchema,
  alocacoesTurmaTurnoParamsSchema,
  excluirAlocacoesTurmaParamsSchema,
  excluirAlocacoesDisciplinaTurmaParamsSchema,
  alocacaoResponseSchema,
  createAlocacaoResponseSchema,
  alocacoesListResponseSchema,
  gradeHorariosResponseSchema,
  horariosConflitosResponseSchema,
  gradeHorariosBootstrapResponseSchema,
  alocacoesBootstrapResponseSchema,
  quantidadeAulasProfessorResponseSchema,
  alocacaoNotFoundErrorSchema,
  conflictErrorSchema,
  alocacaoValidationErrorSchema,
  invalidTokenErrorSchema,
  validationErrorResponseSchema,
  internalServerErrorResponseSchema,
} from "@/schemas";

export async function routesAlocacoes(app: FastifyInstance) {
  // Criar alocação
  app.post(
    "/alocacoes",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        tags: ["Alocações"],
        summary: "Criar nova alocação",
        description:
          "Cria uma nova alocação de professor, disciplina, turma e sala em horário(s) específico(s)",
        body: createAlocacaoSchema,
      },
    },
    criarAlocacao,
  );

  // Buscar todas as alocações
  app.get(
    "/alocacoes",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Alocações"],
        summary: "Listar alocações",
        description: "Lista todas as alocações com paginação",
        querystring: alocacoesQuerySchema,
        response: {
          200: alocacoesListResponseSchema,
          401: invalidTokenErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarAlocacoes,
  );

  // Buscar alocações do turno da manhã
  app.get(
    "/alocacoes/turno/manha",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Alocações"],
        summary: "Buscar alocações do turno da manhã",
        description: "Lista todas as alocações do turno da manhã",
        response: {
          200: alocacoesListResponseSchema,
          401: invalidTokenErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarAlocacoesTurnoManha,
  );

  // Buscar alocações por turma e turno
  app.get(
    "/alocacoes/turma/:id_turma/turno",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Alocações"],
        summary: "Buscar alocações por turma e turno",
        description: "Lista alocações de uma turma específica em um turno",
        params: alocacoesTurmaTurnoParamsSchema,
        response: {
          200: alocacoesListResponseSchema,
          401: invalidTokenErrorSchema,
          404: alocacaoNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarAlocacoesTurmaTurno,
  );

  // Buscar todas as alocações de uma turma (sem paginação)
  app.get(
    "/alocacoes/turma/:id_turma/completa",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Alocações"],
        summary: "Buscar todas as alocações de uma turma",
        description:
          "Lista todas as alocações de uma turma específica sem paginação",
        params: z.object({
          id_turma: z.string().uuid(),
        }),
        response: {
          200: alocacoesListResponseSchema,
          401: invalidTokenErrorSchema,
          404: alocacaoNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarAlocacoesPorTurma,
  );

  // Buscar alocações por professor
  app.get(
    "/alocacoes/professor/:id_professor",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Alocações"],
        summary: "Buscar alocações por professor",
        description: "Lista todas as alocações de um professor específico",
        params: alocacoesProfessorParamsSchema,
        response: {
          200: alocacoesListResponseSchema,
          401: invalidTokenErrorSchema,
          404: alocacaoNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarAlocacoesProfessor,
  );

  // Buscar quantidade de aulas por professor
  app.get(
    "/alocacoes/aulas-professor",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Alocações"],
        summary: "Buscar quantidade de aulas por professor",
        description:
          "Lista a quantidade de aulas e carga horária de cada professor",
        response: {
          200: quantidadeAulasProfessorResponseSchema,
          401: invalidTokenErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarQuantidadeAulasPorProfessor,
  );

  // Buscar alocação por ID
  app.get(
    "/alocacoes/:id",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Alocações"],
        summary: "Buscar alocação por ID",
        description: "Busca uma alocação específica pelo seu ID",
        params: alocacaoParamsSchema,
        response: {
          200: z.object({ alocacao: alocacaoResponseSchema }),
          401: invalidTokenErrorSchema,
          404: alocacaoNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarAlocacao,
  );

  // Atualizar alocação
  app.put(
    "/alocacoes/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        tags: ["Alocações"],
        summary: "Atualizar alocação",
        description: "Atualiza os dados de uma alocação existente",
        params: alocacaoParamsSchema,
        body: updateAlocacaoSchema,
        response: {
          200: z.object({ alocacao: alocacaoResponseSchema }),
          400: validationErrorResponseSchema,
          401: invalidTokenErrorSchema,
          403: invalidTokenErrorSchema,
          404: alocacaoNotFoundErrorSchema,
          409: conflictErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    atualizarAlocacao,
  );

  // Excluir alocação
  app.delete(
    "/alocacoes/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        tags: ["Alocações"],
        summary: "Excluir alocação",
        description: "Remove uma alocação do sistema",
        params: alocacaoParamsSchema,
        response: {
          204: z.void().describe("Alocação excluída com sucesso"),
          401: invalidTokenErrorSchema,
          403: invalidTokenErrorSchema,
          404: alocacaoNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirAlocacao,
  );

  // Excluir todas as alocações de uma turma
  app.delete(
    "/alocacoes/turma/:id_turma/todas",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        tags: ["Alocações"],
        summary: "Excluir todas as alocações de uma turma",
        description: "Remove todas as alocações de uma turma específica",
        params: excluirAlocacoesTurmaParamsSchema,
        response: {
          204: z.void().describe("Alocações da turma excluídas com sucesso"),
          401: invalidTokenErrorSchema,
          403: invalidTokenErrorSchema,
          404: alocacaoNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirTodasAlocacoesTurma,
  );

  // Excluir todas as alocações de uma disciplina em uma turma
  app.delete(
    "/alocacoes/turma/:id_turma/disciplina/:id_disciplina",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        tags: ["Alocações"],
        summary: "Excluir alocações por turma e disciplina",
        description:
          "Remove todas as alocações de uma disciplina específica em uma turma",
        params: excluirAlocacoesDisciplinaTurmaParamsSchema,
        response: {
          204: z
            .void()
            .describe("Alocações da disciplina na turma excluídas com sucesso"),
          401: invalidTokenErrorSchema,
          403: invalidTokenErrorSchema,
          404: alocacaoNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirAlocacoesDisciplinaTurma,
  );

  // Buscar grade de horários
  app.get(
    "/grade-horarios",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Grade de Horários"],
        summary: "Buscar grade de horários",
        description:
          "Busca a grade de horários filtrada por turma, professor ou sala",
        querystring: gradeHorariosQuerySchema,
        response: {
          200: gradeHorariosResponseSchema,
          401: invalidTokenErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarGradeHorarios,
  );

  app.get(
    "/alocacoes/bootstrap",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Alocações"],
        summary: "Bootstrap de alocações",
        description:
          "Carrega turmas, salas, professores, disciplinas e horários para reduzir chamadas do front",
        querystring: alocacoesBootstrapQuerySchema,
        response: {
          200: alocacoesBootstrapResponseSchema,
          401: invalidTokenErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarAlocacoesBootstrap,
  );

  app.get(
    "/grade-horarios/bootstrap",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Grade de Horários"],
        summary: "Bootstrap da grade de horários",
        description:
          "Carrega turmas, salas, professores, períodos e a configuração (dias/códigos) da grade para reduzir chamadas do front",
        querystring: gradeHorariosBootstrapQuerySchema,
        response: {
          200: gradeHorariosBootstrapResponseSchema,
          401: invalidTokenErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarGradeHorariosBootstrap,
  );

  // Buscar conflitos de horários (professor/sala/turma) para um regime
  app.get(
    "/alocacoes/horarios-conflitos",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Alocações"],
        summary: "Buscar conflitos de horários",
        description:
          "Retorna um mapa de horárioId -> tipo de conflito (professor/sala/turma) considerando o período ativo (ou periodoId) e o regime",
        querystring: horariosConflitosQuerySchema,
        response: {
          200: horariosConflitosResponseSchema,
          401: invalidTokenErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarHorariosConflitos,
  );

  // Buscar grade de horários geral
  app.get(
    "/alocacoes/grade-horarios-geral",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Grade de Horários"],
        summary: "Buscar grade de horários geral",
        description:
          "Busca a grade de horários geral filtrada por turma, professor ou sala",
        querystring: gradeHorariosQuerySchema,
        response: {
          200: gradeHorariosResponseSchema,
          401: invalidTokenErrorSchema,
          404: alocacaoNotFoundErrorSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarGradeHorariosGeral,
  );
}
