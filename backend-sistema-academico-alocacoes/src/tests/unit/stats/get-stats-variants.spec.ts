import { describe, it, expect, vi } from "vitest";
import { GetStatsUseCase } from "@/use-cases/stats/get-stats";

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      user: { count: vi.fn().mockResolvedValue(1) },
      curso: { count: vi.fn().mockResolvedValue(1) },
      turma: { count: vi.fn().mockResolvedValue(1) },
      disciplina: { count: vi.fn().mockResolvedValue(1) },
      sala: { count: vi.fn().mockResolvedValue(1) },
      horario: { count: vi.fn().mockResolvedValue(1) },
      alocacao: { count: vi.fn().mockResolvedValue(1), findMany: vi.fn().mockResolvedValue([{ id_sala: "s1" }]) },
      reservaSala: { count: vi.fn().mockResolvedValue(1) },
    }
  };
});

describe("GetStatsUseCase — variações de dia da semana", () => {
  it("SEGUNDA", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T10:00:00Z"));
    const sut = new GetStatsUseCase();
    const res = await sut.execute();
    expect(res.hoje.dia_semana).toBe("SEGUNDA");
    vi.useRealTimers();
  });

  it("SABADO", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-06T10:00:00Z"));
    const sut = new GetStatsUseCase();
    const res = await sut.execute();
    expect(res.hoje.dia_semana).toBe("SABADO");
    vi.useRealTimers();
  });
});