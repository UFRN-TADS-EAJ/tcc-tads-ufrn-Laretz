import { expect, describe, it, beforeEach } from "vitest";
import { BuscarUsuariosCursoUseCase } from "@/use-cases/user-curso/buscar-usuarios-curso";
import { InMemoryUserCursoRepository } from "@/repositories/in-memory/in-memory-user-curso-repository";
import { InMemoryCursosRepository } from "@/repositories/in-memory/in-memory-cursos-repository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let userCursoRepository: InMemoryUserCursoRepository;
let cursosRepository: InMemoryCursosRepository;
let usersRepository: InMemoryUsersRepository;
let sut: BuscarUsuariosCursoUseCase;

describe("Buscar Usuarios Curso Use Case", () => {
  beforeEach(() => {
    cursosRepository = new InMemoryCursosRepository();
    usersRepository = new InMemoryUsersRepository();
    userCursoRepository = new InMemoryUserCursoRepository(
      cursosRepository,
      usersRepository
    );
    sut = new BuscarUsuariosCursoUseCase(userCursoRepository, cursosRepository);
  });

  it("deve ser possível buscar usuários de um curso", async () => {
    const user1 = await usersRepository.create({
      nome: "João Silva",
      email: "joao@example.com",
      senha: "hash",
      role: "PROFESSOR",
    });

    const user2 = await usersRepository.create({
      nome: "Maria Santos",
      email: "maria@example.com",
      senha: "hash",
      role: "PROFESSOR",
    });

    const user3 = await usersRepository.create({
      nome: "Pedro Costa",
      email: "pedro@example.com",
      senha: "hash",
      role: "PROFESSOR",
    });

    const curso = await cursosRepository.create({
      codigo: "SI",
      nome: "Sistemas de Informação",
      turno: "NOTURNO",
      duracao_semestres: 8,
    });

    await userCursoRepository.create({ user: { connect: { id: user1.id } }, curso: { connect: { id: curso.id } }, ativo: true });
    await userCursoRepository.create({ user: { connect: { id: user2.id } }, curso: { connect: { id: curso.id } }, ativo: true });
    await userCursoRepository.create({ user: { connect: { id: user3.id } }, curso: { connect: { id: curso.id } }, ativo: false });

    const { usuarios } = await sut.execute({ id_curso: curso.id });

    expect(usuarios).toHaveLength(2);
    expect(usuarios[0]!.id).toEqual(user1.id);
    expect(usuarios[1]!.id).toEqual(user2.id);
  });

  it("não deve ser possível buscar usuários de um curso inexistente", async () => {
    await expect(() => sut.execute({ id_curso: "curso-inexistente" })).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("deve retornar lista vazia se curso não tem usuários ativos", async () => {
    const curso = await cursosRepository.create({
      codigo: "SI",
      nome: "Sistemas de Informação",
      turno: "NOTURNO",
      duracao_semestres: 8,
    });

    const { usuarios } = await sut.execute({ id_curso: curso.id });
    expect(usuarios).toHaveLength(0);
  });
});