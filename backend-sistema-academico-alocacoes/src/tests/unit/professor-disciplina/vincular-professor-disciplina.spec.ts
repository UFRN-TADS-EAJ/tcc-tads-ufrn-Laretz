import { expect, describe, it, beforeEach } from "vitest";
import { VincularProfessorDisciplinaUseCase } from "@/use-cases/professor-disciplina/vincular-professor-disciplina";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { InMemoryProfessorDisciplinaRepository } from "@/repositories/in-memory/in-memory-professor-disciplina-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { hash } from "bcryptjs";

let professorDisciplinaRepository: InMemoryProfessorDisciplinaRepository;
let usersRepository: InMemoryUsersRepository;
let disciplinasRepository: InMemoryDisciplinasRepository;
let sut: VincularProfessorDisciplinaUseCase;

describe("Vincular Professor Disciplina Use Case", () => {
  beforeEach(() => {
    professorDisciplinaRepository = new InMemoryProfessorDisciplinaRepository();
    usersRepository = new InMemoryUsersRepository();
    disciplinasRepository = new InMemoryDisciplinasRepository();
    sut = new VincularProfessorDisciplinaUseCase(
      professorDisciplinaRepository,
      usersRepository,
      disciplinasRepository
    );
  });

  it("deve ser possível vincular um professor a uma disciplina", async () => {
    const user = await usersRepository.create({
      nome: "Professor Teste",
      email: "professor@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    const disciplina = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 60,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    const { professorDisciplina } = await sut.execute({
      id_user: user.id,
      id_disciplina: disciplina.id,
    });

    expect(professorDisciplina.id).toEqual(expect.any(String));
    expect(professorDisciplina.id_user).toEqual(user.id);
    expect(professorDisciplina.id_disciplina).toEqual(disciplina.id);
    expect(professorDisciplina.ativo).toBe(true);
  });

  it("não deve ser possível vincular professor inexistente", async () => {
    const disciplina = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 60,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    await expect(() =>
      sut.execute({
        id_user: "user-inexistente",
        id_disciplina: disciplina.id,
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("não deve ser possível vincular a disciplina inexistente", async () => {
    const user = await usersRepository.create({
      nome: "Professor Teste",
      email: "professor@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    await expect(() =>
      sut.execute({
        id_user: user.id,
        id_disciplina: "disciplina-inexistente",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("deve retornar vínculo existente se já estiver ativo", async () => {
    const user = await usersRepository.create({
      nome: "Professor Teste",
      email: "professor@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    const disciplina = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 60,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    // Primeiro vínculo
    const { professorDisciplina: primeiro } = await sut.execute({
      id_user: user.id,
      id_disciplina: disciplina.id,
    });

    // Segundo vínculo (deve retornar o mesmo)
    const { professorDisciplina: segundo } = await sut.execute({
      id_user: user.id,
      id_disciplina: disciplina.id,
    });

    expect(segundo.id).toEqual(primeiro.id);
  });

  it("deve reativar vínculo inativo", async () => {
    const user = await usersRepository.create({
      nome: "Professor Teste",
      email: "professor@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    const disciplina = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 60,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    // Criar vínculo
    const vinculo = await professorDisciplinaRepository.create({
      user: {
        connect: { id: user.id },
      },
      disciplina: {
        connect: { id: disciplina.id },
      },
    });

    // Desativar vínculo
    await professorDisciplinaRepository.update(vinculo.id, { ativo: false });

    // Reativar através do use case
    const { professorDisciplina } = await sut.execute({
      id_user: user.id,
      id_disciplina: disciplina.id,
    });

    expect(professorDisciplina.ativo).toBe(true);
    expect(professorDisciplina.id).toEqual(vinculo.id);
  });
});
