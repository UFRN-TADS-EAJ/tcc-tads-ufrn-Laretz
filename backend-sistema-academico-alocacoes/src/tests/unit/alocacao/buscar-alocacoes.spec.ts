import { expect, describe, it, beforeEach } from "vitest";
import { BuscarAlocacoesUseCase } from "@/use-cases/alocacao/buscar-alocacoes";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let alocacoesRepository: InMemoryAlocacoesRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: BuscarAlocacoesUseCase;

describe("Buscar Alocações Use Case", () => {
  beforeEach(() => {
    alocacoesRepository = new InMemoryAlocacoesRepository();
    periodosRepository = new InMemoryPeriodosLetivosRepository();
    periodosRepository.items.push({
      id: "periodo-1",
      nome: "2026.1",
      data_inicio: new Date("2026-02-01T00:00:00.000Z"),
      data_fim: new Date("2026-07-31T00:00:00.000Z"),
      ativo: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    sut = new BuscarAlocacoesUseCase(alocacoesRepository, periodosRepository);
  });

  it("deve ser possível buscar alocações com paginação", async () => {
    // Criar algumas alocações para teste
    await alocacoesRepository.createWithCustomData({
      id: "alocacao-1",
      id_user: "user-1",
      id_disciplina: "disciplina-1",
      id_turma: "turma-1",
      id_sala: "sala-1",
      id_horario: "horario-1",
    });

    await alocacoesRepository.createWithCustomData({
      id: "alocacao-2",
      id_user: "user-2",
      id_disciplina: "disciplina-2",
      id_turma: "turma-2",
      id_sala: "sala-2",
      id_horario: "horario-2",
    });

    await alocacoesRepository.createWithCustomData({
      id: "alocacao-3",
      id_user: "user-3",
      id_disciplina: "disciplina-3",
      id_turma: "turma-3",
      id_sala: "sala-3",
      id_horario: "horario-3",
    });

    const { alocacoes } = await sut.execute({
      page: 1,
    });

    expect(alocacoes).toHaveLength(3);
    expect(alocacoes[0]!.id_user).toEqual("user-1");
    expect(alocacoes[1]!.id_user).toEqual("user-2");
    expect(alocacoes[2]!.id_user).toEqual("user-3");
  });

  it("deve retornar lista vazia quando não há alocações", async () => {
    const { alocacoes } = await sut.execute({
      page: 1,
    });

    expect(alocacoes).toHaveLength(0);
  });

  it("deve ser possível buscar alocações em páginas diferentes", async () => {
    // Criar alocações suficientes para testar paginação
    for (let i = 1; i <= 25; i++) {
      await alocacoesRepository.createWithCustomData({
        id: `alocacao-${i}`,
        id_user: `user-${i}`,
        id_disciplina: `disciplina-${i}`,
        id_turma: `turma-${i}`,
        id_sala: `sala-${i}`,
        id_horario: `horario-${i}`,
      });
    }

    const { alocacoes: primeiraPagina } = await sut.execute({
      page: 1,
    });

    const { alocacoes: segundaPagina } = await sut.execute({
      page: 2,
    });

    expect(primeiraPagina).toHaveLength(20); // Assumindo 20 itens por página
    expect(segundaPagina).toHaveLength(5);
  });
});
