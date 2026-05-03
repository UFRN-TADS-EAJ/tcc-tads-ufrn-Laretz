import type { Feedback, Prisma } from "@prisma/client";
import {
  CreateFeedbackData,
  FeedbackMetricsResult,
  FeedbackRepository,
  ListFeedbackParams,
} from "../feedback-repository";

export class InMemoryFeedbackRepository implements FeedbackRepository {
  public items: Feedback[] = [];

  async create(data: CreateFeedbackData): Promise<Feedback> {
    const feedback: Feedback = {
      id: `feedback-${this.items.length + 1}`,
      userId: data.userId,
      npsScore: data.npsScore,
      comment: data.comment,
      page: data.page ?? null,
      feature: data.feature ?? null,
      metadata:
        data.metadata !== undefined
          ? ((data.metadata as unknown) as Prisma.JsonValue)
          : null,
      created_at: new Date(),
    };

    this.items.push(feedback);
    return feedback;
  }

  async findMany(params: ListFeedbackParams): Promise<Feedback[]> {
    const { page, feature, limit } = params;
    let result = this.items.slice();
    if (page) result = result.filter((f) => f.page === page);
    if (feature) result = result.filter((f) => f.feature === feature);
    result = result.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return typeof limit === "number" ? result.slice(0, limit) : result;
  }

  async metrics(params?: { page?: string; feature?: string }): Promise<FeedbackMetricsResult> {
    let dataset = this.items.slice();
    if (params?.page) dataset = dataset.filter((f) => f.page === params.page);
    if (params?.feature) dataset = dataset.filter((f) => f.feature === params.feature);

    const total = dataset.length;
    const averageNps = total > 0 ? Number((dataset.reduce((sum, f) => sum + f.npsScore, 0) / total).toFixed(2)) : null;
    const promoters = dataset.filter((f) => f.npsScore >= 9).length;
    const passives = dataset.filter((f) => f.npsScore >= 7 && f.npsScore <= 8).length;
    const detractors = dataset.filter((f) => f.npsScore <= 6).length;

    const groupAvg = (items: Feedback[]) => {
      const t = items.length;
      return t > 0 ? Number((items.reduce((sum, f) => sum + f.npsScore, 0) / t).toFixed(2)) : null;
    };

    const byFeatureMap = new Map<string | null, Feedback[]>();
    const byPageMap = new Map<string | null, Feedback[]>();
    for (const f of dataset) {
      byFeatureMap.set(f.feature ?? null, [...(byFeatureMap.get(f.feature ?? null) ?? []), f]);
      byPageMap.set(f.page ?? null, [...(byPageMap.get(f.page ?? null) ?? []), f]);
    }

    const byFeature = Array.from(byFeatureMap.entries()).map(([feature, items]) => ({
      feature,
      count: items.length,
      avgNps: groupAvg(items),
    }));

    const byPage = Array.from(byPageMap.entries()).map(([page, items]) => ({
      page,
      count: items.length,
      avgNps: groupAvg(items),
    }));

    return {
      total,
      averageNps,
      promoters,
      passives,
      detractors,
      byFeature,
      byPage,
    };
  }
}
