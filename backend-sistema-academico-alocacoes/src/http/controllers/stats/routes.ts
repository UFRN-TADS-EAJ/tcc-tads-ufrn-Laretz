import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { statsResponseSchema } from "@/schemas/stats";
import { internalServerErrorResponseSchema } from "@/schemas/curso";
import { makeGetStatsUseCase } from "@/use-cases/@factories/stats/make-get-stats-use-case";

export async function routesStats(app: FastifyTypedInstance) {
  // GET /stats - Estatísticas gerais para o Dashboard
  app.get(
    "/stats",
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ["Dashboard 📊"],
        summary: "Estatísticas gerais do sistema",
        description: "KPIs consolidados para exibição no Dashboard",
        response: {
          200: statsResponseSchema,
          401: internalServerErrorResponseSchema, // reaproveitando schema genérico para evitar duplicar
          500: internalServerErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const getStatsUseCase = makeGetStatsUseCase();
        const data = await getStatsUseCase.execute();
        return reply.status(200).send(data);
      } catch (err) {
        request.log.error({ err }, "Erro ao gerar estatísticas do dashboard");
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
}