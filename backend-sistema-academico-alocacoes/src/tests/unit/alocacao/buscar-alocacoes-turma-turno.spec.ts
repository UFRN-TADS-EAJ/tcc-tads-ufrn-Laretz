import { describe, it, expect } from "vitest";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";
import { BuscarAlocacoesTurmaTurnoUseCase } from "@/use-cases/alocacao/buscar-alocacoes-turma-turno";

describe("BuscarAlocacoesTurmaTurnoUseCase", () => {
  it("deve filtrar por turma e turno (manhã/tarde/noite) com paginação", async () => {
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
    const turmaId = "turma-1";

    // manhã (< 12)
    for (let i = 0; i < 15; i++) {
      await repo.createWithCustomData({
        id_turma: turmaId,
        horario: {
          id: `h-m-${i}`,
          codigo: "M1",
          dia_semana: "SEGUNDA",
          horario_inicio: new Date("2024-01-01T08:00:00"),
          horario_fim: new Date("2024-01-01T09:00:00"),
        },
      } as any);
    }
    // tarde (>=12 <18)
    for (let i = 0; i < 10; i++) {
      await repo.createWithCustomData({
        id_turma: turmaId,
        horario: {
          id: `h-t-${i}`,
          codigo: "T1",
          dia_semana: "TERCA",
          horario_inicio: new Date("2024-01-01T13:00:00"),
          horario_fim: new Date("2024-01-01T14:00:00"),
        },
      } as any);
    }
    // noite (>=18)
    for (let i = 0; i < 7; i++) {
      await repo.createWithCustomData({
        id_turma: turmaId,
        horario: {
          id: `h-n-${i}`,
          codigo: "N1",
          dia_semana: "QUARTA",
          horario_inicio: new Date("2024-01-01T19:00:00"),
          horario_fim: new Date("2024-01-01T20:00:00"),
        },
      } as any);
    }

    const sut = new BuscarAlocacoesTurmaTurnoUseCase(repo, periodosRepository);

    const manha = await sut.execute({ id_turma: turmaId, turno: "manha", page: 1 });
    expect(manha.alocacoes).toHaveLength(15);

    const tarde = await sut.execute({ id_turma: turmaId, turno: "tarde", page: 1 });
    expect(tarde.alocacoes).toHaveLength(10);

    const noite = await sut.execute({ id_turma: turmaId, turno: "noite", page: 1 });
    expect(noite.alocacoes).toHaveLength(7);
  });

  it("deve retornar vazio quando turma não possuir alocações no turno", async () => {
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
    const sut = new BuscarAlocacoesTurmaTurnoUseCase(repo, periodosRepository);
    const { alocacoes } = await sut.execute({ id_turma: "turma-x", turno: "manha", page: 1 });
    expect(alocacoes).toHaveLength(0);
  });
});
