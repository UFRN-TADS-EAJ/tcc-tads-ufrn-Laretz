import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { z } from "zod";
import {
  createReservaSalaSchema,
  reservasQuerySchema,
  reservaParamsSchema,
  seriesParamsSchema,
  reservaSalaResponseSchema,
  reservasListResponseSchema,
} from "@/schemas/reserva-sala";
import {
  internalServerErrorResponseSchema,
  validationErrorResponseSchema,
  notFoundResponseSchema,
} from "@/schemas/curso";

import { criarReservaSala } from "./criar-reserva";
import { buscarReservasSala } from "./buscar-reservas";
import { cancelarReservaSala } from "./cancelar-reserva";
import { cancelarSerieReservasSala } from "./cancelar-serie";

export async function routesReservasSala(app: FastifyTypedInstance) {
  // POST /reservas-sala - Criar reserva (ADMIN ou COORDENADOR)
  app.post(
    "/reservas-sala",
    {
      onRequest: [verifyJWT, verifyUseRole("COORDENADOR")],
      schema: {
        description: "Criação de reserva de sala avulsa ou recorrente semanal",
        tags: ["Reservas de Sala 📅"],
        body: createReservaSalaSchema,
        response: {
          201: z.object({
            reservas: z.array(reservaSalaResponseSchema.shape.reserva),
          }),
          400: validationErrorResponseSchema,
          409: z.object({
            message: z.string(),
            conflicts: z.array(
              z.object({
                type: z.enum(["ALOCACAO", "RESERVA"]),
                date: z.string().optional(),
              })
            ),
          }),
          500: internalServerErrorResponseSchema,
        },
      },
    },
    criarReservaSala
  );

  // GET /reservas-sala - Listar reservas
  app.get(
    "/reservas-sala",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Listagem de reservas de sala com filtros",
        tags: ["Reservas de Sala 📅"],
        querystring: reservasQuerySchema,
        response: {
          200: reservasListResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarReservasSala
  );

  // DELETE /reservas-sala/:id - Cancelar reserva
  app.delete(
    "/reservas-sala/:id",
    {
      onRequest: [verifyJWT, verifyUseRole("COORDENADOR")],
      schema: {
        description: "Cancelamento de reserva de sala",
        tags: ["Reservas de Sala 📅"],
        params: reservaParamsSchema,
        response: {
          200: z.object({ message: z.string() }),
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    cancelarReservaSala
  );

  // DELETE /reservas-sala/series/:seriesId - Cancelar série inteira
  app.delete(
    "/reservas-sala/series/:seriesId",
    {
      onRequest: [verifyJWT, verifyUseRole("COORDENADOR")],
      schema: {
        description: "Cancelamento de série de reservas",
        tags: ["Reservas de Sala 📅"],
        params: seriesParamsSchema,
        response: {
          200: z.object({ message: z.string() }),
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    cancelarSerieReservasSala
  );
}
