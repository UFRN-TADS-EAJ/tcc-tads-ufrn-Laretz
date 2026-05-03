import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { z } from "zod";
import {
  createPeriodoLetivoSchema,
  periodoLetivoParamsSchema,
  periodoLetivoResponseSchema,
  periodosLetivosListResponseSchema,
  periodosLetivosListQuerySchema,
  avancarPeriodoLetivoSchema,
} from "@/schemas/periodo-letivo";

import { buscarPeriodoLetivoAtivo } from "./buscar-ativo";
import { listarPeriodosLetivos } from "./listar";
import { criarPeriodoLetivo } from "./criar";
import { ativarPeriodoLetivo } from "./ativar";
import { avancarPeriodoLetivo } from "./avancar";

export async function routesPeriodosLetivos(app: FastifyTypedInstance) {
  app.get(
    "/periodos-letivos/ativo",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Períodos Letivos 📆"],
        description: "Retorna o período letivo ativo",
        response: { 200: periodoLetivoResponseSchema },
      },
    },
    buscarPeriodoLetivoAtivo,
  );

  app.get(
    "/periodos-letivos",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        tags: ["Períodos Letivos 📆"],
        description: "Lista períodos letivos cadastrados",
        querystring: periodosLetivosListQuerySchema,
        response: { 200: periodosLetivosListResponseSchema },
      },
    },
    listarPeriodosLetivos,
  );

  app.post(
    "/periodos-letivos",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        tags: ["Períodos Letivos 📆"],
        description: "Cria um novo período letivo",
        body: createPeriodoLetivoSchema,
        response: { 201: periodoLetivoResponseSchema },
      },
    },
    criarPeriodoLetivo,
  );

  app.patch(
    "/periodos-letivos/:id/ativar",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        tags: ["Períodos Letivos 📆"],
        description: "Ativa um período letivo (desativa o atual)",
        params: periodoLetivoParamsSchema,
        response: { 200: periodoLetivoResponseSchema },
      },
    },
    ativarPeriodoLetivo,
  );

  app.post(
    "/periodos-letivos/avancar",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        tags: ["Períodos Letivos 📆"],
        description: "Encerra o período ativo e cria/ativa o próximo",
        body: avancarPeriodoLetivoSchema,
        response: {
          201: z.object({
            encerrados: z.number(),
            periodo: periodoLetivoResponseSchema.shape.periodo,
          }),
        },
      },
    },
    avancarPeriodoLetivo,
  );
}
