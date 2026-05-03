import { PrismaFeedbackRepository } from "@/repositories/prisma-repositories/prisma-feedback-repository";
import { FeedbackMetricsResult } from "@/repositories/feedback-repository";

interface GetFeedbackMetricsUseCaseRequest {
  page?: string;
  feature?: string;
}

interface GetFeedbackMetricsUseCaseResponse extends FeedbackMetricsResult {}

export class GetFeedbackMetricsUseCase {
  constructor(private repo: PrismaFeedbackRepository) {}

  async execute(req: GetFeedbackMetricsUseCaseRequest): Promise<GetFeedbackMetricsUseCaseResponse> {
    const result = await this.repo.metrics({
      ...(req.page !== undefined ? { page: req.page } : {}),
      ...(req.feature !== undefined ? { feature: req.feature } : {}),
    });
    return result;
  }
}