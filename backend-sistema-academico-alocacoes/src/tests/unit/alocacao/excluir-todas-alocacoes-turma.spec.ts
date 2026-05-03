import { describe, it, expect } from "vitest";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";
import { ExcluirTodasAlocacoesTurmaUseCase } from "@/use-cases/alocacao/excluir-todas-alocacoes-turma";

describe("ExcluirTodasAlocacoesTurmaUseCase", () => {
  it("deve excluir todas as alocações de uma turma", async () => {
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
    const turmaId = "turma-xyz";
    // cria alocações da turma
    for (let i = 0; i < 10; i++) {
      await repo.createWithCustomData({ id_turma: turmaId });
    }
    // cria alocações de outra turma
    for (let i = 0; i < 5; i++) {
      await repo.createWithCustomData({ id_turma: "turma-outro" });
    }

    expect(repo.items.filter(a => a.id_turma === turmaId)).toHaveLength(10);

    const sut = new ExcluirTodasAlocacoesTurmaUseCase(repo, periodosRepository);
    const result = await sut.execute({ id_turma: turmaId });
    expect(result.message).toContain("excluídas");

    expect(repo.items.filter(a => a.id_turma === turmaId)).toHaveLength(0);
    expect(repo.items.filter(a => a.id_turma === "turma-outro")).toHaveLength(5);
  });
});
