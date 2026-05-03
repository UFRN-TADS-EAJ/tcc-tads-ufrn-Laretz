import { describe, it, expect } from "vitest";
import { CreateFeedbackUseCase } from "@/use-cases/feedback/create-feedback";
import { PrismaFeedbackRepository } from "@/repositories/prisma-repositories/prisma-feedback-repository";
import { InMemoryFeedbackRepository } from "@/repositories/in-memory/in-memory-feedback-repository";

class FakePrismaFeedbackRepository extends PrismaFeedbackRepository {
  constructor(private mem: InMemoryFeedbackRepository) { super(); }
  async create(data: any) { return this.mem.create(data); }
  async findMany(params: any) { return this.mem.findMany(params) as any; }
  async metrics(params?: { page?: string; feature?: string }) { return this.mem.metrics(params); }
}

describe("CreateFeedbackUseCase", () => {
  it("deve criar feedback com metadata opcional", async () => {
    const mem = new InMemoryFeedbackRepository();
    const repo = new FakePrismaFeedbackRepository(mem);
    const sut = new CreateFeedbackUseCase(repo);

    const { feedback } = await sut.execute({
      userId: "user-1",
      npsScore: 9,
      comment: "Ótimo",
      page: "dashboard",
      feature: "notificacoes",
      metadata: { contexto: "unit" },
    });

    expect(feedback).toBeDefined();
    expect(feedback.userId).toBe("user-1");
    expect(feedback.npsScore).toBe(9);
    expect(feedback.comment).toBe("Ótimo");
    expect(feedback.page).toBe("dashboard");
    expect(feedback.feature).toBe("notificacoes");
    expect(feedback.metadata).toStrictEqual({ contexto: "unit" });
  });
});