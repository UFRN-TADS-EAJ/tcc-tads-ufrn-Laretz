import { PrismaFeedbackRepository } from "@/repositories/prisma-repositories/prisma-feedback-repository";
import { Feedback } from "@prisma/client";

interface ListFeedbacksUseCaseRequest {
  page?: string;
  feature?: string;
  limit?: number;
}

interface ListFeedbacksUseCaseResponse {
  feedbacks: (Feedback & { user?: { id: string; nome: string; email: string; role: string } })[];
}

export class ListFeedbacksUseCase {
  constructor(private repo: PrismaFeedbackRepository) {}

  async execute(req: ListFeedbacksUseCaseRequest): Promise<ListFeedbacksUseCaseResponse> {
    const feedbacks = await this.repo.findMany({
      ...(req.page !== undefined ? { page: req.page } : {}),
      ...(req.feature !== undefined ? { feature: req.feature } : {}),
      ...(req.limit !== undefined ? { limit: req.limit } : {}),
    });
    return { feedbacks };
  }
}