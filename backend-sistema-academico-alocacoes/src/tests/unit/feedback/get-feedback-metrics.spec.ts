import { describe, it, expect } from "vitest";
import { GetFeedbackMetricsUseCase } from "@/use-cases/feedback/get-feedback-metrics";
import { PrismaFeedbackRepository } from "@/repositories/prisma-repositories/prisma-feedback-repository";
import { InMemoryFeedbackRepository } from "@/repositories/in-memory/in-memory-feedback-repository";

class FakePrismaFeedbackRepository extends PrismaFeedbackRepository {
  constructor(private mem: InMemoryFeedbackRepository) { super(); }
  async create(data: any) { return this.mem.create(data); }
  async findMany(params: any) { return this.mem.findMany(params) as any; }
  async metrics(params?: { page?: string; feature?: string }) { return this.mem.metrics(params); }
}

describe("GetFeedbackMetricsUseCase", () => {
  it("deve calcular NPS e contagens de promotores/passivos/detratores, com filtros", async () => {
    const mem = new InMemoryFeedbackRepository();
    const repo = new FakePrismaFeedbackRepository(mem);

    // Dados: 2 promotores (9,10), 1 passivo (7), 2 detratores (3,6)
    await repo.create({ userId: "u1", npsScore: 9, comment: "p1", page: "dashboard", feature: "notificacoes" });
    await repo.create({ userId: "u2", npsScore: 10, comment: "p2", page: "dashboard", feature: "relatorios" });
    await repo.create({ userId: "u3", npsScore: 7, comment: "pa1", page: "grades", feature: "notificacoes" });
    await repo.create({ userId: "u4", npsScore: 3, comment: "d1", page: "dashboard", feature: "notificacoes" });
    await repo.create({ userId: "u5", npsScore: 6, comment: "d2", page: "dashboard", feature: "relatorios" });

    const sut = new GetFeedbackMetricsUseCase(repo);

    const metrics = await sut.execute({});
    expect(metrics.total).toBe(5);
    expect(metrics.promoters).toBe(2);
    expect(metrics.passives).toBe(1);
    expect(metrics.detractors).toBe(2);
    // Média NPS geral
    expect(metrics.averageNps).toBeCloseTo((9 + 10 + 7 + 3 + 6) / 5, 2);

    const filtPage = await sut.execute({ page: "dashboard" });
    expect(filtPage.total).toBe(4);

    const filtFeature = await sut.execute({ feature: "notificacoes" });
    expect(filtFeature.total).toBe(3);
  });
});