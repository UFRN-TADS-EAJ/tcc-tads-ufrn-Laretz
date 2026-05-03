import { PrismaFeedbackRepository } from "@/repositories/prisma-repositories/prisma-feedback-repository";
import { CreateFeedbackUseCase } from "@/use-cases/feedback/create-feedback";

export function makeCriarFeedbackUseCase() {
  const repo = new PrismaFeedbackRepository();
  const useCase = new CreateFeedbackUseCase(repo);
  return useCase;
}