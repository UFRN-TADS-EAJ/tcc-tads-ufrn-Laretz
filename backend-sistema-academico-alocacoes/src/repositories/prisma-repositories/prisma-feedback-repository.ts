import { prisma } from "@/lib/prisma";
import { FeedbackRepository, CreateFeedbackData, ListFeedbackParams, FeedbackMetricsResult } from "../feedback-repository";

export class PrismaFeedbackRepository implements FeedbackRepository {
  async create(data: CreateFeedbackData) {
    return prisma.feedback.create({ data });
  }

  async findMany(params: ListFeedbackParams) {
    const { page, feature, limit = 100 } = params;
    return prisma.feedback.findMany({
      where: {
        ...(page ? { page } : {}),
        ...(feature ? { feature } : {}),
      },
      orderBy: { created_at: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, nome: true, email: true, role: true } },
      },
    });
  }

  async metrics(params?: { page?: string; feature?: string }): Promise<FeedbackMetricsResult> {
    const where = {
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.feature ? { feature: params.feature } : {}),
    };

    const total = await prisma.feedback.count({ where });

    const avgAgg = await prisma.feedback.aggregate({
      where,
      _avg: { npsScore: true },
    });

    const [promoters, passives, detractors] = await Promise.all([
      prisma.feedback.count({ where: { ...where, npsScore: { gte: 9 } } }),
      prisma.feedback.count({ where: { ...where, npsScore: { gte: 7, lte: 8 } } }),
      prisma.feedback.count({ where: { ...where, npsScore: { lte: 6 } } }),
    ]);

    const byFeatureRows = await prisma.feedback.groupBy({
      by: ["feature"],
      where,
      _count: { _all: true },
      _avg: { npsScore: true },
    });
    const byFeature = byFeatureRows
      .map((r) => ({ feature: r.feature, count: r._count._all, avgNps: r._avg.npsScore }))
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

    const byPageRows = await prisma.feedback.groupBy({
      by: ["page"],
      where,
      _count: { _all: true },
      _avg: { npsScore: true },
    });
    const byPage = byPageRows
      .map((r) => ({ page: r.page, count: r._count._all, avgNps: r._avg.npsScore }))
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

    return {
      total,
      averageNps: avgAgg._avg.npsScore ?? null,
      promoters,
      passives,
      detractors,
      byFeature,
      byPage,
    };
  }
}