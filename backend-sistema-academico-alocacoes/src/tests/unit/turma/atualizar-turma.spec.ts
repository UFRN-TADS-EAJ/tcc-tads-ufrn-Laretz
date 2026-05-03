import { expect, describe, it, beforeEach } from "vitest";
import { AtualizarTurmaUseCase } from "@/use-cases/turma/atualizar-turma";
import { InMemoryTurmasRepository } from "@/repositories/in-memory/in-memory-turmas-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let turmasRepository: InMemoryTurmasRepository;
let sut: AtualizarTurmaUseCase;

describe("Atualizar Turma Use Case", () => {
  beforeEach(() => {
    turmasRepository = new InMemoryTurmasRepository();
    sut = new AtualizarTurmaUseCase(turmasRepository);
  });

  it("deve ser possível atualizar todos os campos de uma turma", async () => {
    const turmaCriada = await turmasRepository.create({
      nome: "Turma A",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      curso: {
        connect: {
          id: "curso-id-teste",
        },
      },
    });

    const { turma } = await sut.execute({
      id: turmaCriada.id,
      nome: "Turma A Atualizada",
      num_alunos: 35,
      turno: "VESPERTINO",
      semestre: 2,
    });

    expect(turma.id).toEqual(turmaCriada.id);
    expect(turma.nome).toEqual("Turma A Atualizada");
    expect(turma.num_alunos).toEqual(35);
    expect(turma.semestre).toEqual(2);
    expect(turma.turno).toEqual("VESPERTINO");
  });

  it("deve ser possível atualizar apenas o nome da turma", async () => {
    const turmaCriada = await turmasRepository.create({
      nome: "Turma A",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      curso: {
        connect: {
          id: "curso-id-teste",
        },
      },
    });

    const { turma } = await sut.execute({
      id: turmaCriada.id,
      nome: "Novo Nome",
    });

    expect(turma.nome).toEqual("Novo Nome");
    expect(turma.num_alunos).toEqual(30); // Mantém valor original
    expect(turma.semestre).toEqual(1); // Mantém valor original
    expect(turma.turno).toEqual("MATUTINO"); // Mantém valor original
  });

  it("deve ser possível atualizar apenas o número de alunos", async () => {
    const turmaCriada = await turmasRepository.create({
      nome: "Turma A",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      curso: {
        connect: {
          id: "curso-id-teste",
        },
      },
    });

    const { turma } = await sut.execute({
      id: turmaCriada.id,
      num_alunos: 40,
    });

    expect(turma.nome).toEqual("Turma A"); // Mantém valor original
    expect(turma.num_alunos).toEqual(40);
    expect(turma.semestre).toEqual(1); // Mantém valor original
    expect(turma.turno).toEqual("MATUTINO"); // Mantém valor original
  });

  it("deve ser possível atualizar apenas o semestre", async () => {
    const turmaCriada = await turmasRepository.create({
      nome: "Turma A",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      curso: {
        connect: {
          id: "curso-id-teste",
        },
      },
    });

    const { turma } = await sut.execute({
      id: turmaCriada.id,
      semestre: 3,
    });

    expect(turma.nome).toEqual("Turma A"); // Mantém valor original
    expect(turma.num_alunos).toEqual(30); // Mantém valor original
    expect(turma.semestre).toEqual(3);
    expect(turma.turno).toEqual("MATUTINO"); // Mantém valor original
  });

  it("deve ser possível atualizar apenas o turno", async () => {
    const turmaCriada = await turmasRepository.create({
      nome: "Turma A",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      curso: {
        connect: {
          id: "curso-id-teste",
        },
      },
    });

    const { turma } = await sut.execute({
      id: turmaCriada.id,
      turno: "NOTURNO",
    });

    expect(turma.nome).toEqual("Turma A"); // Mantém valor original
    expect(turma.num_alunos).toEqual(30); // Mantém valor original
    expect(turma.semestre).toEqual(1); // Mantém valor original
    expect(turma.turno).toEqual("NOTURNO");
  });

  it("deve lançar erro quando tentar atualizar turma inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: "id-inexistente",
        nome: "Novo Nome",
      }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("deve manter dados originais quando todos os campos são undefined", async () => {
    const turmaCriada = await turmasRepository.create({
      nome: "Turma Original",
      num_alunos: 25,
      semestre: 2,
      turno: "VESPERTINO",
      curso: {
        connect: {
          id: "curso-id-teste",
        },
      },
    });

    const { turma } = await sut.execute({
      id: turmaCriada.id,
    });

    expect(turma.nome).toEqual("Turma Original");
    expect(turma.num_alunos).toEqual(25);
    expect(turma.semestre).toEqual(2);
    expect(turma.turno).toEqual("VESPERTINO");
  });
});
