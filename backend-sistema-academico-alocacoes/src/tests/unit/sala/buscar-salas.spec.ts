import { describe, it, expect, beforeEach } from "vitest";
import { BuscarSalasUseCase } from "@/use-cases/sala/buscar-salas";
import { InMemorySalasRepository } from "@/repositories/in-memory/in-memory-salas-repository";

let salasRepository: InMemorySalasRepository;
let sut: BuscarSalasUseCase;

describe("Buscar Salas Use Case", () => {
  beforeEach(() => {
    salasRepository = new InMemorySalasRepository();
    sut = new BuscarSalasUseCase(salasRepository);
  });

  it("deve retornar lista vazia quando não houver salas", async () => {
    const { salas } = await sut.execute({ page: 1 });
    expect(salas).toHaveLength(0);
  });

  it("deve paginar resultados (20 por página)", async () => {
    for (let i = 1; i <= 25; i++) {
      await salasRepository.create({
        nome: `Sala ${i}`,
        numero: `${i}`,
        capacidade: 30 + i,
        tipo: "AULA",
        computadores: 0,
        predio: { connect: { id: "predio-1" } },
      } as any);
    }

    const { salas: primeiraPagina } = await sut.execute({ page: 1 });
    const { salas: segundaPagina } = await sut.execute({ page: 2 });

    expect(primeiraPagina).toHaveLength(20);
    expect(segundaPagina).toHaveLength(5);
    expect(primeiraPagina[0]!.nome).toBe("Sala 1");
    expect(segundaPagina[0]!.nome).toBe("Sala 21");
  });
});
