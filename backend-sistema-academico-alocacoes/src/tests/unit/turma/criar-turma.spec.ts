import { expect, describe, it, beforeEach } from "vitest";
import { CriarTurmaUseCase } from "@/use-cases/turma/criar-turma";
import { InMemoryTurmasRepository } from "@/repositories/in-memory/in-memory-turmas-repository";

let turmasRepository: InMemoryTurmasRepository;
let sut: CriarTurmaUseCase;

describe("Criar Turma Use Case", () => {
  beforeEach(() => {
    turmasRepository = new InMemoryTurmasRepository();
    sut = new CriarTurmaUseCase(turmasRepository);
  });

  it("deve ser possível criar uma turma", async () => {
    const { turma } = await sut.execute({
      nome: "Turma A",
      num_alunos: 30,
      turno: "MATUTINO",
      id_curso: "curso-id-teste",
      semestre: 1,
    });

    expect(turma.id).toEqual(expect.any(String));
    expect(turma.semestre).toEqual(1);
    expect(turma.num_alunos).toEqual(30);
    expect(turma.turno).toEqual("MATUTINO");
  });

  it("deve ser possível criar turmas com diferentes turnos", async () => {
    const { turma: turmaMatutino } = await sut.execute({
      nome: "Turma Manhã",
      num_alunos: 25,
      turno: "MATUTINO",
      id_curso: "curso-id-teste-1",
      semestre: 1,
      ativa: true,
    });

    const { turma: turmaVespertino } = await sut.execute({
      nome: "Turma Tarde",
      num_alunos: 28,
      turno: "VESPERTINO",
      id_curso: "curso-id-teste-2",
    });

    const { turma: turmaNoturno } = await sut.execute({
      nome: "Turma Noite",
      num_alunos: 20,
      turno: "NOTURNO",
      id_curso: "curso-id-teste-3",
    });

    expect(turmaMatutino.turno).toEqual("MATUTINO");
    expect(turmaVespertino.turno).toEqual("VESPERTINO");
    expect(turmaNoturno.turno).toEqual("NOTURNO");
  });

  it("deve ser possível criar turmas com diferentes números de alunos", async () => {
    const { turma: turmaPequena } = await sut.execute({
      nome: "Turma Pequena",
      num_alunos: 15,
      turno: "MATUTINO",
      id_curso: "curso-id-teste-4",
    });

    const { turma: turmaGrande } = await sut.execute({
      nome: "Turma Grande",
      num_alunos: 40,
      turno: "VESPERTINO",
      id_curso: "curso-id-teste-5",
    });

    expect(turmaPequena.num_alunos).toEqual(15);
    expect(turmaGrande.num_alunos).toEqual(40);
  });

  it("deve aplicar valores padrão quando semestre e ativa não forem informados", async () => {
    const { turma } = await sut.execute({
      nome: "Turma Padrão",
      num_alunos: 30,
      turno: "MATUTINO",
      id_curso: "curso-id-teste",
      // semestre e ativa não informados
    });

    expect(turma.semestre).toEqual(1); // valor padrão
    expect(turma.ativa).toEqual(true); // valor padrão
  });

  it("deve respeitar valores informados quando semestre e ativa forem fornecidos", async () => {
    const { turma } = await sut.execute({
      nome: "Turma Customizada",
      num_alunos: 25,
      turno: "VESPERTINO",
      id_curso: "curso-id-teste",
      semestre: 3,
      ativa: false,
    });

    expect(turma.semestre).toEqual(3); // valor informado
    expect(turma.ativa).toEqual(false); // valor informado
  });
});
