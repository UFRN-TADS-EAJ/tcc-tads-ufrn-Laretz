import { describe, it, expect } from "vitest";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";
import { BuscarAlocacoesTurnoManhaUseCase } from "@/use-cases/alocacao/buscar-alocacoes-turno-manha";

describe("BuscarAlocacoesTurnoManhaUseCase", () => {
  it("deve retornar apenas alocações com horário de início antes das 12h (paginado)", async () => {
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

    // cria 15 alocações de manhã
    for (let i = 0; i < 15; i++) {
      await repo.createWithCustomData({
        horario: {
          id: `hm-${i}`,
          codigo: "M1",
          dia_semana: "SEGUNDA",
          horario_inicio: new Date("2024-01-01T08:00:00"),
          horario_fim: new Date("2024-01-01T09:00:00"),
        },
      } as any);
    }
    // cria 12 alocações à tarde
    for (let i = 0; i < 12; i++) {
      await repo.createWithCustomData({
        horario: {
          id: `ht-${i}`,
          codigo: "T1",
          dia_semana: "TERCA",
          horario_inicio: new Date("2024-01-01T13:00:00"),
          horario_fim: new Date("2024-01-01T14:00:00"),
        },
      } as any);
    }

    const sut = new BuscarAlocacoesTurnoManhaUseCase(repo, periodosRepository);
    const page1 = await sut.execute({ page: 1 });
    const page2 = await sut.execute({ page: 2 });

    expect(page1.alocacoes).toHaveLength(15); // só manhã
    expect(page2.alocacoes).toHaveLength(0);
  });
});
