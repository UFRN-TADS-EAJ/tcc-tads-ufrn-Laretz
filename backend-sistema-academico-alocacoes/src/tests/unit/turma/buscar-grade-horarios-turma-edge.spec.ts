import { describe, it, expect } from "vitest";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";
import { BuscarGradeHorariosTurmaUseCase } from "@/use-cases/turma/buscar-grade-horarios-turma";

describe("BuscarGradeHorariosTurmaUseCase — casos de dados incompletos", () => {
  it("deve ignorar alocação sem relações obrigatórias", async () => {
    const repo = new InMemoryAlocacoesRepository();
    const periodosRepository = new InMemoryPeriodosLetivosRepository();
    periodosRepository.items.push({
      id: "periodo-1",
      nome: "2026.1",
      data_inicio: new Date("2026-02-01T00:00:00.000Z"),
      data_fim: new Date("2026-07-31T00:00:00.000Z"),
      ativo: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const a = await repo.createWithCustomData({ id_turma: "t1" });
    const idx = repo.items.findIndex(i => i.id === a.id);
    (repo.items[idx] as any).horario = undefined;
    const sut = new BuscarGradeHorariosTurmaUseCase(
      repo as any,
      periodosRepository,
    );
    const res = await sut.execute({ turmaId: "t1" });
    expect(res.resumo.totalAlocacoes).toBeGreaterThan(0);
  });

  it("deve ignorar alocação com dia/código inexistentes na grade", async () => {
    const repo = new InMemoryAlocacoesRepository();
    const periodosRepository = new InMemoryPeriodosLetivosRepository();
    periodosRepository.items.push({
      id: "periodo-1",
      nome: "2026.1",
      data_inicio: new Date("2026-02-01T00:00:00.000Z"),
      data_fim: new Date("2026-07-31T00:00:00.000Z"),
      ativo: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const a = await repo.createWithCustomData({ id_turma: "t2", horario: { id: "h-x", codigo: "X9", dia_semana: "DOMINGO", horario_inicio: new Date(), horario_fim: new Date() } as any });
    const sut = new BuscarGradeHorariosTurmaUseCase(
      repo as any,
      periodosRepository,
    );
    const res = await sut.execute({ turmaId: "t2" });
    const filled = Object.values(res.grade).flatMap((day: any) => Object.values(day)).filter((v) => v !== null).length;
    expect(filled).toBe(0);
  });
});
