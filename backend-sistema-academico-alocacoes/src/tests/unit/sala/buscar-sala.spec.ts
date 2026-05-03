import { describe, it, expect, beforeEach } from "vitest";
import { BuscarSalaUseCase } from "@/use-cases/sala/buscar-sala";
import { InMemorySalasRepository } from "@/repositories/in-memory/in-memory-salas-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let salasRepository: InMemorySalasRepository;
let sut: BuscarSalaUseCase;

describe("Buscar Sala Use Case", () => {
  beforeEach(() => {
    salasRepository = new InMemorySalasRepository();
    sut = new BuscarSalaUseCase(salasRepository);
  });

  it("deve retornar a sala pelo id", async () => {
    const criada = await salasRepository.create({
      nome: "Sala 101",
      numero: "101",
      capacidade: 40,
      tipo: "AULA",
      computadores: 0,
      predio: { connect: { id: "predio-1" } },
    } as any);

    const { sala } = await sut.execute({ id: criada.id });

    expect(sala).toEqual(
      expect.objectContaining({
        id: criada.id,
        nome: "Sala 101",
        capacidade: 40,
      })
    );
  });

  it("deve lançar RecursoNaoEncontradoError para id inexistente", async () => {
    await expect(() =>
      sut.execute({ id: "sala-inexistente" })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});
