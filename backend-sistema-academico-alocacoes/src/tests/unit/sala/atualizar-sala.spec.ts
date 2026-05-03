import { describe, it, expect } from "vitest";
import { InMemorySalasRepository } from "@/repositories/in-memory/in-memory-salas-repository";
import { AtualizarSalaUseCase } from "@/use-cases/sala/atualizar-sala";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

describe("AtualizarSalaUseCase", () => {
  it("deve atualizar nome, capacidade, tipo e predioId", async () => {
    const salasRepo = new InMemorySalasRepository();
    // cria sala inicial
    const salaInicial = await salasRepo.create({
      nome: "Sala Antiga",
      numero: "001",
      capacidade: 30,
      tipo: "AULA",
      computadores: 0,
      predio: { connect: { id: "predio-1" } },
    });

    const sut = new AtualizarSalaUseCase(salasRepo);
    const { sala } = await sut.execute({
      id: salaInicial.id,
      nome: "Sala Nova",
      capacidade: 40,
      tipo: "LAB",
      predioId: "predio-2",
    });

    expect(sala.nome).toBe("Sala Nova");
    expect(sala.capacidade).toBe(40);
    expect(sala.tipo).toBe("LAB");
    expect(sala.predioId).toBe("predio-2");
  });

  it("deve lançar RecursoNaoEncontradoError para ID inexistente", async () => {
    const salasRepo = new InMemorySalasRepository();
    const sut = new AtualizarSalaUseCase(salasRepo);

    await expect(
      sut.execute({
        id: "sala-inexistente",
        nome: "Sala X",
        capacidade: 10,
        tipo: "AULA",
        predioId: "predio-3",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});