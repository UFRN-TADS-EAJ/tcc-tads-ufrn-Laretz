import { expect, describe, it, beforeEach } from "vitest";
import { BuscarDisciplinasProfessorUseCase } from "@/use-cases/professor-disciplina/buscar-disciplinas-professor";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { InMemoryProfessorDisciplinaRepository } from "@/repositories/in-memory/in-memory-professor-disciplina-repository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { hash } from "bcryptjs";

let professorDisciplinaRepository: InMemoryProfessorDisciplinaRepository;
let usersRepository: InMemoryUsersRepository;
let disciplinasRepository: InMemoryDisciplinasRepository;
let sut: BuscarDisciplinasProfessorUseCase;

describe("Buscar Disciplinas Professor Use Case", () => {
  beforeEach(() => {
    professorDisciplinaRepository = new InMemoryProfessorDisciplinaRepository();
    usersRepository = new InMemoryUsersRepository();
    disciplinasRepository = new InMemoryDisciplinasRepository();

    // Configurar repositórios no professorDisciplinaRepository
    professorDisciplinaRepository.setUsersRepository(usersRepository);
    professorDisciplinaRepository.setDisciplinasRepository(
      disciplinasRepository
    );

    sut = new BuscarDisciplinasProfessorUseCase(
      professorDisciplinaRepository,
      disciplinasRepository,
      usersRepository
    );
  });

  it("deve ser possível buscar disciplinas de um professor", async () => {
    const user = await usersRepository.create({
      nome: "Professor Teste",
      email: "professor@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    const disciplina1 = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 60,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    const disciplina2 = await disciplinasRepository.create({
      nome: "Física",
      carga_horaria: 80,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    // Vincular professor às disciplinas
    await professorDisciplinaRepository.create({
      user: {
        connect: { id: user.id },
      },
      disciplina: {
        connect: { id: disciplina1.id },
      },
    });

    await professorDisciplinaRepository.create({
      user: {
        connect: { id: user.id },
      },
      disciplina: {
        connect: { id: disciplina2.id },
      },
    });

    const { disciplinas } = await sut.execute({
      id_user: user.id,
    });

    expect(disciplinas).toHaveLength(2);
    expect(disciplinas[0]).toEqual(
      expect.objectContaining({
        nome: expect.any(String),
        carga_horaria: expect.any(Number),
        vinculo: expect.objectContaining({
          id: expect.any(String),
          ativo: true,
        }),
      })
    );
  });

  it("não deve ser possível buscar disciplinas de usuário inexistente", async () => {
    await expect(() =>
      sut.execute({
        id_user: "user-inexistente",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("deve retornar lista vazia se professor não tem disciplinas", async () => {
    const user = await usersRepository.create({
      nome: "Professor Teste",
      email: "professor@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    const { disciplinas } = await sut.execute({
      id_user: user.id,
    });

    expect(disciplinas).toHaveLength(0);
  });

  it("deve retornar apenas disciplinas ativas", async () => {
    const user = await usersRepository.create({
      nome: "Professor Teste",
      email: "professor@test.com",
      senha: await hash("123456", 6),
      role: "PROFESSOR",
    });

    const disciplina1 = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 60,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    const disciplina2 = await disciplinasRepository.create({
      nome: "Física",
      carga_horaria: 80,
      curso: {
        connect: { id: "curso-1" },
      },
    });

    // Vincular professor às disciplinas
    await professorDisciplinaRepository.create({
      user: {
        connect: { id: user.id },
      },
      disciplina: {
        connect: { id: disciplina1.id },
      },
    });

    const vinculo2 = await professorDisciplinaRepository.create({
      user: {
        connect: { id: user.id },
      },
      disciplina: {
        connect: { id: disciplina2.id },
      },
    });

    // Desativar um vínculo
    await professorDisciplinaRepository.update(vinculo2.id, { ativo: false });

    const { disciplinas } = await sut.execute({
      id_user: user.id,
    });

    expect(disciplinas).toHaveLength(1);
    expect(disciplinas[0]!.nome).toBe("Matemática");
  });
});
