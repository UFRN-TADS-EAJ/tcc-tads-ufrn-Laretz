import { FastifyReply, FastifyRequest } from "fastify";
import { createFeedbackBodySchema } from "@/schemas/feedback";
import { makeCriarFeedbackUseCase } from "@/use-cases/@factories/feedback/make-criar-feedback-use-case";

export async function criarFeedback(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { npsScore, comment, page, feature, metadata } =
    createFeedbackBodySchema.parse(request.body);
  const userId = (request as any).user?.sub; // sub vem do JWT

  try {
    const useCase = makeCriarFeedbackUseCase();

    const payload = {
      userId,
      npsScore,
      comment,
      ...(page !== undefined ? { page } : {}),
      ...(feature !== undefined ? { feature } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
    };

    const { feedback } = await useCase.execute(payload);

    return reply
      .status(201)
      .send({ feedback, message: "Feedback registrado com sucesso" });
  } catch (error) {
    throw error;
  }
}
