import { PrismaFeedbackRepository } from "@/repositories/prisma-repositories/prisma-feedback-repository";
import { ListFeedbacksUseCase } from "@/use-cases/feedback/list-feedbacks";

export function makeBuscarFeedbacksUseCase() {
  const repo = new PrismaFeedbackRepository();
  const useCase = new ListFeedbacksUseCase(repo);
  return useCase;
}