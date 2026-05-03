import { PrismaFeedbackRepository } from "@/repositories/prisma-repositories/prisma-feedback-repository";
import { GetFeedbackMetricsUseCase } from "@/use-cases/feedback/get-feedback-metrics";

export function makeBuscarMetricasFeedbackUseCase() {
  const repo = new PrismaFeedbackRepository();
  const useCase = new GetFeedbackMetricsUseCase(repo);
  return useCase;
}