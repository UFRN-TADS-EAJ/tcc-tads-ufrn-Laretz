import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { z } from "zod";
import {
  idHorarioParamsSchema,
  criarHorarioSchema,
  criarHorarioCodigoSchema,
  atualizarHorarioSchema,
  buscarHorariosQuerySchema,
  horarioResponseSchema,
  horariosListResponseSchema,
  horariosSimpleResponseSchema,
  horariosGradeConfigQuerySchema,
  horariosGradeConfigResponseSchema,
} from "@/schemas/horarios";
import {
  notFoundResponseSchema,
  internalServerErrorResponseSchema,
  validationErrorResponseSchema,
  errorResponseSchema,
} from "@/schemas/curso";

// Importar controllers
import { criarHorario } from "./criar-horario";
import { criarHorarioCodigo } from "./criar-horario-codigo";
import { buscarHorarios } from "./buscar-horarios";
import { buscarHorariosGradeConfig } from "./buscar-horarios-grade-config";
import { buscarHorario } from "./buscar-horario";
import { atualizarHorario } from "./atualizar-horario";
import { excluirHorario } from "./excluir-horario";

export const routesHorarios = async (app: FastifyTypedInstance) => {
  // POST /horarios - Criar horário
  app.post(
    "/horarios",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para criar um novo horário",
        tags: ["Horários ⏰"],
        body: criarHorarioSchema,
        response: {
          201: horarioResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarHorario
  );

  // POST /horarios/codigo - Criar horário por código
  app.post(
    "/horarios/codigo",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para criar horário através de código",
        tags: ["Horários ⏰"],
        body: criarHorarioCodigoSchema,
        response: {
          201: horarioResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarHorarioCodigo
  );

  // GET /horarios - Buscar todos os horários
  app.get(
    "/horarios",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar todos os horários",
        tags: ["Horários ⏰"],
        querystring: buscarHorariosQuerySchema,
        response: {
          200: horariosSimpleResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarHorarios
  );

  app.get(
    "/horarios/grade-config",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Configuração da grade (dias e códigos) para um regime",
        tags: ["Horários ⏰"],
        querystring: horariosGradeConfigQuerySchema,
        response: {
          200: horariosGradeConfigResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarHorariosGradeConfig,
  );

  // GET /horarios/:id - Buscar horário por ID
  app.get(
    "/horarios/:id",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar horário por ID",
        tags: ["Horários ⏰"],
        params: idHorarioParamsSchema,
        response: {
          200: horarioResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarHorario
  );

  // PUT /horarios/:id - Atualizar horário
  app.put(
    "/horarios/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para atualizar horário",
        tags: ["Horários ⏰"],
        params: idHorarioParamsSchema,
        body: atualizarHorarioSchema,
        response: {
          200: horarioResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    atualizarHorario
  );

  // DELETE /horarios/:id - Excluir horário
  app.delete(
    "/horarios/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para excluir horário",
        tags: ["Horários ⏰"],
        params: idHorarioParamsSchema,
        response: {
          204: z.object({ message: z.string() }),
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    excluirHorario
  );
};
