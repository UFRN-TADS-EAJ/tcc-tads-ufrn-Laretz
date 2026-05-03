import { expect, describe, it, beforeEach } from "vitest";
import { BuscarProfessoresDisciplinaUseCase } from "@/use-cases/professor-disciplina/buscar-professores-disciplina";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { InMemoryProfessorDisciplinaRepository } from "@/repositories/in-memory/in-memory-professor-disciplina-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { hash } from "bcryptjs";

let professorDisciplinaRepository: InMemoryProfessorDisciplinaRepository;
let usersRepository: InMemoryUsersRepository;
let disciplinasRepository: InMemoryDisciplinasRepository;
let sut: BuscarProfessoresDisciplinaUseCase;

describe("Buscar Professores Disciplina Use Case", () => {
  beforeEach(() => {
    professorDisciplinaRepository = new InMemoryProfessorDisciplinaRepository();
    usersRepository = new InMemoryUsersRepository();
    disciplinasRepository = new InMemoryDisciplinasRepository();

    // Configurar repositórios no professorDisciplinaRepository
    professorDisciplinaRepository.setUsersRepository(usersRepository);
    professorDisciplinaRepository.setDisciplinasRepository(
      disciplinasRepository
    );

    sut = new BuscarProfessoresDisciplinaUseCase(
      professorDisciplinaRepository,
      disciplinasRepository
    );
  });

  it("deve ser possível buscar professores de uma disciplina", async () => {
    const disciplina = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 60,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    const professor1 = await usersRepository.create({
      nome: "Professor 1",
      email: "professor1@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    const professor2 = await usersRepository.create({
      nome: "Professor 2",
      email: "professor2@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    // Vincular professores à disciplina
    await professorDisciplinaRepository.create({
      user: {
        connect: { id: professor1.id },
      },
      disciplina: {
        connect: { id: disciplina.id },
      },
    });

    await professorDisciplinaRepository.create({
      user: {
        connect: { id: professor2.id },
      },
      disciplina: {
        connect: { id: disciplina.id },
      },
    });

    const { professores } = await sut.execute({
      id_disciplina: disciplina.id,
    });

    expect(professores).toHaveLength(2);
    expect(professores[0]).toEqual(
      expect.objectContaining({
        nome: expect.any(String),
        email: expect.any(String),
        vinculo: expect.objectContaining({
          id: expect.any(String),
          ativo: true,
        }),
      })
    );
  });

  it("não deve ser possível buscar professores de disciplina inexistente", async () => {
    await expect(() =>
      sut.execute({
        id_disciplina: "disciplina-inexistente",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("deve retornar lista vazia se disciplina não tem professores", async () => {
    const disciplina = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 60,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    const { professores } = await sut.execute({
      id_disciplina: disciplina.id,
    });

    expect(professores).toHaveLength(0);
  });

  it("deve retornar apenas vínculos ativos", async () => {
    const disciplina = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 60,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    const professor1 = await usersRepository.create({
      nome: "Professor 1",
      email: "professor1@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    const professor2 = await usersRepository.create({
      nome: "Professor 2",
      email: "professor2@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    // Vincular professores à disciplina
    await professorDisciplinaRepository.create({
      user: {
        connect: { id: professor1.id },
      },
      disciplina: {
        connect: { id: disciplina.id },
      },
    });

    const vinculo2 = await professorDisciplinaRepository.create({
      user: {
        connect: { id: professor2.id },
      },
      disciplina: {
        connect: { id: disciplina.id },
      },
    });

    // Desativar um vínculo
    await professorDisciplinaRepository.update(vinculo2.id, { ativo: false });

    const { professores } = await sut.execute({
      id_disciplina: disciplina.id,
    });

    expect(professores).toHaveLength(1);
    expect(professores[0]!.nome).toBe("Professor 1");
  });
});
