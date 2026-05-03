import { PrismaFeedbackRepository } from "@/repositories/prisma-repositories/prisma-feedback-repository";
import { Feedback, Prisma } from "@prisma/client";

interface CreateFeedbackUseCaseRequest {
  userId: string;
  npsScore: number;
  comment: string;
  page?: string;
  feature?: string;
  metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}

interface CreateFeedbackUseCaseResponse {
  feedback: Feedback;
}

export class CreateFeedbackUseCase {
  constructor(private repo: PrismaFeedbackRepository) {}

  async execute(req: CreateFeedbackUseCaseRequest): Promise<CreateFeedbackUseCaseResponse> {
    const feedback = await this.repo.create({
      userId: req.userId,
      npsScore: req.npsScore,
      comment: req.comment,
      page: req.page ?? null,
      feature: req.feature ?? null,
      ...(req.metadata !== undefined ? { metadata: req.metadata } : {}),
    });

    return { feedback };
  }
}