import { FastifyReply, FastifyRequest } from "fastify";
import { metricsQuerySchema } from "@/schemas/feedback";
import { makeBuscarMetricasFeedbackUseCase } from "@/use-cases/@factories/feedback/make-buscar-metricas-feedback-use-case";

// Controller apenas com o handler. O registro da rota fica em routes.ts
export async function buscarMetricasFeedback(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const useCase = makeBuscarMetricasFeedbackUseCase();

    const query = metricsQuerySchema.parse(request.query);
    const params = {
      ...(query.page !== undefined ? { page: query.page } : {}),
      ...(query.feature !== undefined ? { feature: query.feature } : {}),
    };
    const result = await useCase.execute(params);

    return reply.status(200).send(result);
  } catch (error) {
    throw error;
  }
}