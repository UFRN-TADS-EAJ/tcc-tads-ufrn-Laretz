import { describe, it, expect } from "vitest";
import { InMemorySalasRepository } from "@/repositories/in-memory/in-memory-salas-repository";
import { CriarSalaUseCase } from "@/use-cases/sala/criar-sala";

describe("CriarSalaUseCase", () => {
  it("deve criar uma sala com defaults (numero=\"999\", computadores=0) quando não informados", async () => {
    const salasRepo = new InMemorySalasRepository();
    const sut = new CriarSalaUseCase(salasRepo);

    const { sala } = await sut.execute({
      nome: "Sala 101",
      predioId: "predio-abc",
      capacidade: 35,
      tipo: "AULA",
      // numero e computadores omitidos
    });

    expect(sala).toBeDefined();
    expect(sala.nome).toBe("Sala 101");
    expect(sala.predioId).toBe("predio-abc");
    // defaults aplicados pelo use case
    expect(sala.numero).toBe("999");
    expect(sala.computadores).toBe(0);
  });

  it("deve criar uma sala com numero e computadores informados", async () => {
    const salasRepo = new InMemorySalasRepository();
    const sut = new CriarSalaUseCase(salasRepo);

    const { sala } = await sut.execute({
      nome: "Laboratório 1",
      predioId: "predio-xyz",
      capacidade: 20,
      tipo: "LAB",
      numero: "L-01",
      computadores: 15,
    });

    expect(sala).toBeDefined();
    expect(sala.nome).toBe("Laboratório 1");
    expect(sala.predioId).toBe("predio-xyz");
    expect(sala.numero).toBe("L-01");
    expect(sala.computadores).toBe(15);
  });
});