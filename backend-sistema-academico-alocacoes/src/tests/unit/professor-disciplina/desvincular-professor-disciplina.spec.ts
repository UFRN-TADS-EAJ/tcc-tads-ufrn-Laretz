import { expect, describe, it, beforeEach } from "vitest";
import { DesvincularProfessorDisciplinaUseCase } from "@/use-cases/professor-disciplina/desvincular-professor-disciplina";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { InMemoryProfessorDisciplinaRepository } from "@/repositories/in-memory/in-memory-professor-disciplina-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { hash } from "bcryptjs";

let professorDisciplinaRepository: InMemoryProfessorDisciplinaRepository;
let usersRepository: InMemoryUsersRepository;
let disciplinasRepository: InMemoryDisciplinasRepository;
let sut: DesvincularProfessorDisciplinaUseCase;

describe("Desvincular Professor Disciplina Use Case", () => {
  beforeEach(() => {
    professorDisciplinaRepository = new InMemoryProfessorDisciplinaRepository();
    usersRepository = new InMemoryUsersRepository();
    disciplinasRepository = new InMemoryDisciplinasRepository();
    sut = new DesvincularProfessorDisciplinaUseCase(
      professorDisciplinaRepository
    );
  });

  it("deve ser possível desvincular um professor de uma disciplina", async () => {
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

    // Criar vínculo primeiro
    const vinculo = await professorDisciplinaRepository.create({
      user: {
        connect: { id: user.id },
      },
      disciplina: {
        connect: { id: disciplina.id },
      },
    });

    const { success } = await sut.execute({
      id_user: user.id,
      id_disciplina: disciplina.id,
    });

    expect(success).toBe(true);

    // Verificar se o vínculo foi desativado
    const vinculoAtualizado = await professorDisciplinaRepository.findById(
      vinculo.id
    );
    expect(vinculoAtualizado?.ativo).toBe(false);
  });

  it("não deve ser possível desvincular vínculo inexistente", async () => {
    await expect(() =>
      sut.execute({
        id_user: "user-inexistente",
        id_disciplina: "disciplina-inexistente",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("não deve ser possível desvincular vínculo já inativo", async () => {
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

    // Criar vínculo inativo
    await professorDisciplinaRepository.create({
      user: {
        connect: { id: user.id },
      },
      disciplina: {
        connect: { id: disciplina.id },
      },
      ativo: false,
    });

    await expect(() =>
      sut.execute({
        id_user: user.id,
        id_disciplina: disciplina.id,
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});
