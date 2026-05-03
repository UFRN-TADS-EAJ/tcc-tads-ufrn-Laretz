import { expect, describe, it, beforeEach } from "vitest";
import { BuscarCursosUsuarioUseCase } from "@/use-cases/user-curso/buscar-cursos-usuario";
import { InMemoryUserCursoRepository } from "@/repositories/in-memory/in-memory-user-curso-repository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { InMemoryCursosRepository } from "@/repositories/in-memory/in-memory-cursos-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let userCursoRepository: InMemoryUserCursoRepository;
let usersRepository: InMemoryUsersRepository;
let cursosRepository: InMemoryCursosRepository;
let sut: BuscarCursosUsuarioUseCase;

describe("Buscar Cursos Usuario Use Case", () => {
  beforeEach(() => {
    cursosRepository = new InMemoryCursosRepository();
    usersRepository = new InMemoryUsersRepository();
    userCursoRepository = new InMemoryUserCursoRepository(
      cursosRepository,
      usersRepository
    );
    sut = new BuscarCursosUsuarioUseCase(userCursoRepository, usersRepository);
  });

  it("deve ser possível buscar cursos de um usuário", async () => {
    const user = await usersRepository.create({
      nome: "João Silva",
      email: "joao@example.com",
      senha: "hash",
      role: "PROFESSOR",
    });

    const curso1 = await cursosRepository.create({ codigo: "SI", nome: "Sistemas de Informação", turno: "NOTURNO", duracao_semestres: 8 });
    const curso2 = await cursosRepository.create({ codigo: "CC", nome: "Ciência da Computação", turno: "MATUTINO", duracao_semestres: 8 });
    const curso3 = await cursosRepository.create({ codigo: "ADS", nome: "Análise e Desenvolvimento de Sistemas", turno: "NOTURNO", duracao_semestres: 6 });

    await userCursoRepository.create({ user: { connect: { id: user.id } }, curso: { connect: { id: curso1.id } }, ativo: true });
    await userCursoRepository.create({ user: { connect: { id: user.id } }, curso: { connect: { id: curso2.id } }, ativo: true });
    await userCursoRepository.create({ user: { connect: { id: user.id } }, curso: { connect: { id: curso3.id } }, ativo: false });

    const { cursos } = await sut.execute({ id_user: user.id });
    expect(cursos).toHaveLength(2);
    expect(cursos[0]!.id).toEqual(curso1.id);
    expect(cursos[1]!.id).toEqual(curso2.id);
  });

  it("não deve ser possível buscar cursos de um usuário inexistente", async () => {
    await expect(() => sut.execute({ id_user: "user-inexistente" })).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("deve retornar lista vazia se usuário não tem cursos ativos", async () => {
    const user = await usersRepository.create({ nome: "Professor Teste", email: "professor@teste.com", senha: "hash", role: "PROFESSOR" });
    const { cursos } = await sut.execute({ id_user: user.id });
    expect(cursos).toHaveLength(0);
  });
});