import { describe, it, expect } from "vitest";
import { ListFeedbacksUseCase } from "@/use-cases/feedback/list-feedbacks";
import { PrismaFeedbackRepository } from "@/repositories/prisma-repositories/prisma-feedback-repository";
import { InMemoryFeedbackRepository } from "@/repositories/in-memory/in-memory-feedback-repository";

class FakePrismaFeedbackRepository extends PrismaFeedbackRepository {
  constructor(private mem: InMemoryFeedbackRepository) {
    super();
  }
  async create(data: any) {
    return this.mem.create(data);
  }
  async findMany(params: any) {
    return this.mem.findMany(params) as any;
  }
  async metrics(params?: { page?: string; feature?: string }) {
    return this.mem.metrics(params);
  }
}

describe("ListFeedbacksUseCase", () => {
  it("deve filtrar por page/feature e limitar resultados ordenados por created_at desc", async () => {
    const mem = new InMemoryFeedbackRepository();
    const repo = new FakePrismaFeedbackRepository(mem);

    // cria alguns feedbacks
    await repo.create({
      userId: "u1",
      npsScore: 10,
      comment: "a",
      page: "dashboard",
      feature: "notificacoes",
    });
    await new Promise((r) => setTimeout(r, 2));
    await repo.create({
      userId: "u2",
      npsScore: 7,
      comment: "b",
      page: "dashboard",
      feature: "relatorios",
    });
    await new Promise((r) => setTimeout(r, 2));
    await repo.create({
      userId: "u3",
      npsScore: 5,
      comment: "c",
      page: "grades",
      feature: "notificacoes",
    });

    const sut = new ListFeedbacksUseCase(repo);

    const { feedbacks: porPage } = await sut.execute({ page: "dashboard" });
    expect(porPage.length).toBe(2);
    expect(porPage[0]!.comment).toBe("b");
    expect(porPage[1]!.comment).toBe("a");

    const { feedbacks: porFeatureLimit } = await sut.execute({
      feature: "notificacoes",
      limit: 1,
    });
    expect(porFeatureLimit.length).toBe(1);
  });
});
