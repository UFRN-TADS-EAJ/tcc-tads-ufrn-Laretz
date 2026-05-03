import { Feedback, Prisma } from "@prisma/client";

export interface CreateFeedbackData {
  userId: string;
  npsScore: number;
  comment: string;
  page?: string | null;
  feature?: string | null;
  metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
}

export interface ListFeedbackParams {
  page?: string;
  feature?: string;
  limit?: number;
}

export interface FeedbackMetricsResult {
  total: number;
  averageNps: number | null;
  promoters: number;
  passives: number;
  detractors: number;
  byFeature: Array<{ feature: string | null; count: number; avgNps: number | null }>;
  byPage: Array<{ page: string | null; count: number; avgNps: number | null }>;
}

export interface FeedbackRepository {
  create(data: CreateFeedbackData): Promise<Feedback>;
  findMany(params: ListFeedbackParams): Promise<Feedback[]>;
  metrics(params?: { page?: string; feature?: string }): Promise<FeedbackMetricsResult>;
}