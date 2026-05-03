import { describe, it, expect } from "vitest";
import { InMemorySalasRepository } from "@/repositories/in-memory/in-memory-salas-repository";
import { BuscarSalasPorPredioUseCase } from "@/use-cases/sala/buscar-salas-por-predio";

describe("BuscarSalasPorPredioUseCase", () => {
  it("deve retornar apenas as salas do predio informado", async () => {
    const salasRepo = new InMemorySalasRepository();
    await salasRepo.create({
      nome: "Sala A",
      numero: "A-01",
      capacidade: 30,
      tipo: "AULA",
      computadores: 0,
      predio: { connect: { id: "predio-1" } },
    });
    await salasRepo.create({
      nome: "Sala B",
      numero: "B-01",
      capacidade: 40,
      tipo: "LAB",
      computadores: 10,
      predio: { connect: { id: "predio-2" } },
    });
    await salasRepo.create({
      nome: "Sala C",
      numero: "C-01",
      capacidade: 20,
      tipo: "AULA",
      computadores: 0,
      predio: { connect: { id: "predio-1" } },
    });

    const sut = new BuscarSalasPorPredioUseCase(salasRepo);
    const { salas } = await sut.execute({ predioId: "predio-1" });

    expect(salas).toHaveLength(2);
    expect(salas.map((s) => s.nome)).toEqual(["Sala A", "Sala C"]);
  });

  it("deve retornar lista vazia quando não houver salas no predio", async () => {
    const salasRepo = new InMemorySalasRepository();
    await salasRepo.create({
      nome: "Sala D",
      numero: "D-01",
      capacidade: 25,
      tipo: "AULA",
      computadores: 0,
      predio: { connect: { id: "predio-3" } },
    });

    const sut = new BuscarSalasPorPredioUseCase(salasRepo);
    const { salas } = await sut.execute({ predioId: "predio-sem-salas" });
    expect(salas).toHaveLength(0);
  });
});