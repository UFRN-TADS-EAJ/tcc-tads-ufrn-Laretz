import { describe, it, expect, beforeEach } from "vitest";
import { BuscarTurmasUseCase } from "@/use-cases/turma/buscar-turmas";
import { InMemoryTurmasRepository } from "@/repositories/in-memory/in-memory-turmas-repository";

let turmasRepository: InMemoryTurmasRepository;
let sut: BuscarTurmasUseCase;

describe("Buscar Turmas Use Case", () => {
  beforeEach(() => {
    turmasRepository = new InMemoryTurmasRepository();
    sut = new BuscarTurmasUseCase(turmasRepository);
  });

  it("deve ser possível buscar turmas", async () => {
    // Criar algumas turmas
    await turmasRepository.create({
      nome: "Turma A",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    await turmasRepository.create({
      nome: "Turma B",
      num_alunos: 25,
      turno: "VESPERTINO",
      semestre: 2,
      curso: {
        connect: { id: "curso-2" },
      },
    });

    const { turmas } = await sut.execute({
      page: 1,
    });

    expect(turmas).toHaveLength(2);
    expect(turmas[0]?.nome).toEqual("Turma A");
    expect(turmas[1]?.nome).toEqual("Turma B");
  });

  it("deve retornar array vazio quando não há turmas", async () => {
    const { turmas } = await sut.execute({
      page: 1,
    });

    expect(turmas).toHaveLength(0);
  });

  it("deve respeitar a paginação", async () => {
    // Criar 25 turmas para testar paginação
    for (let i = 1; i <= 25; i++) {
      await turmasRepository.create({
        nome: `Turma ${i.toString().padStart(2, "0")}`,
        num_alunos: 30,
        turno: "MATUTINO",
        semestre: 1,
        curso: {
          connect: { id: "curso-1" },
        },
      });
    }

    const primeiraPagina = await sut.execute({ page: 1 });
    const segundaPagina = await sut.execute({ page: 2 });

    expect(primeiraPagina.turmas).toHaveLength(20);
    expect(segundaPagina.turmas).toHaveLength(5);
    expect(primeiraPagina.turmas[0]?.nome).toEqual("Turma 01");
    expect(segundaPagina.turmas[0]?.nome).toEqual("Turma 21");
  });

  it("deve retornar array vazio para página inexistente", async () => {
    await turmasRepository.create({
      nome: "Turma A",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    const { turmas } = await sut.execute({
      page: 5,
    });

    expect(turmas).toHaveLength(0);
  });

  it("deve retornar turmas com todas as propriedades corretas", async () => {
    await turmasRepository.create({
      nome: "Turma Teste",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    const { turmas } = await sut.execute({
      page: 1,
    });

    expect(turmas[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        nome: "Turma Teste",
        num_alunos: 30,
        turno: "MATUTINO",
        id_curso: "curso-1",
        ativa: expect.any(Boolean),
        semestre: expect.any(Number),
      }),
    );
  });
});
