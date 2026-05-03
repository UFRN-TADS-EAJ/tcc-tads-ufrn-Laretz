import { describe, it, expect, beforeEach } from "vitest";
import { ExcluirSalaUseCase } from "@/use-cases/sala/excluir-sala";
import { InMemorySalasRepository } from "@/repositories/in-memory/in-memory-salas-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let salasRepository: InMemorySalasRepository;
let sut: ExcluirSalaUseCase;

describe("Excluir Sala Use Case", () => {
  beforeEach(() => {
    salasRepository = new InMemorySalasRepository();
    sut = new ExcluirSalaUseCase(salasRepository);
  });

  it("deve excluir a sala existente", async () => {
    const sala = await salasRepository.create({
      nome: "Sala 201",
      numero: "201",
      capacidade: 50,
      tipo: "AULA",
      computadores: 10,
      predio: { connect: { id: "predio-1" } },
    } as any);

    await sut.execute({ id: sala.id });

    const encontrada = await salasRepository.findById(sala.id);
    expect(encontrada).toBeNull();
  });

  it("deve lançar RecursoNaoEncontradoError ao excluir sala inexistente", async () => {
    await expect(() =>
      sut.execute({ id: "sala-inexistente" })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});
