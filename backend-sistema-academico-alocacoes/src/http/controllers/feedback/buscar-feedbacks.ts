import { FastifyReply, FastifyRequest } from "fastify";
import { listFeedbacksQuerySchema } from "@/schemas/feedback";
import { makeBuscarFeedbacksUseCase } from "@/use-cases/@factories/feedback/make-buscar-feedbacks-use-case";

// Controller apenas com o handler. O registro da rota fica em routes.ts
export async function buscarFeedbacks(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const useCase = makeBuscarFeedbacksUseCase();

    const query = listFeedbacksQuerySchema.parse(request.query);
    const params = {
      ...(query.page !== undefined ? { page: query.page } : {}),
      ...(query.feature !== undefined ? { feature: query.feature } : {}),
      ...(query.limit !== undefined ? { limit: query.limit } : {}),
    };
    const { feedbacks } = await useCase.execute(params);

    return reply.status(200).send({ feedbacks });
  } catch (error) {
    throw error;
  }
}