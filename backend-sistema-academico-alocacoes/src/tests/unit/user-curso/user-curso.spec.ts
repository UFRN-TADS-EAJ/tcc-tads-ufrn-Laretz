import { describe, it, expect, beforeEach } from "vitest";
import { VincularUserCursoUseCase } from "@/use-cases/user-curso/vincular-user-curso";
import { DesvincularUserCursoUseCase } from "@/use-cases/user-curso/desvincular-user-curso";
import { BuscarCursosUsuarioUseCase } from "@/use-cases/user-curso/buscar-cursos-usuario";
import { BuscarUsuariosCursoUseCase } from "@/use-cases/user-curso/buscar-usuarios-curso";
import { InMemoryUserCursoRepository } from "@/repositories/in-memory/in-memory-user-curso-repository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { InMemoryCursosRepository } from "@/repositories/in-memory/in-memory-cursos-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { UserCursoAlreadyExistsError } from "@/use-cases/errors/user-curso-already-exists-error";

let userCursoRepository: InMemoryUserCursoRepository;
let usersRepository: InMemoryUsersRepository;
let cursosRepository: InMemoryCursosRepository;
let vincularUseCase: VincularUserCursoUseCase;
let desvincularUseCase: DesvincularUserCursoUseCase;
let buscarCursosUseCase: BuscarCursosUsuarioUseCase;
let buscarUsuariosUseCase: BuscarUsuariosCursoUseCase;

describe("Use Cases UserCurso", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    cursosRepository = new InMemoryCursosRepository();
    userCursoRepository = new InMemoryUserCursoRepository(
      cursosRepository,
      usersRepository
    );
    
    vincularUseCase = new VincularUserCursoUseCase(
      userCursoRepository,
      usersRepository,
      cursosRepository
    );
    
    desvincularUseCase = new DesvincularUserCursoUseCase(
      userCursoRepository
    );
    
    buscarCursosUseCase = new BuscarCursosUsuarioUseCase(
      userCursoRepository,
      usersRepository
    );
    
    buscarUsuariosUseCase = new BuscarUsuariosCursoUseCase(
      userCursoRepository,
      cursosRepository
    );
  });

  describe("Vincular User Curso", () => {
    it("deve ser possível vincular um usuário a um curso", async () => {
      const user = await usersRepository.create({
        nome: "Professor Teste",
        email: "professor@teste.com",
        senha: "123456",
        role: "PROFESSOR",
      });

      const curso = await cursosRepository.create({
        codigo: "TADS",
        nome: "Tecnologia em Análise e Desenvolvimento de Sistemas",
        turno: "MATUTINO",
        duracao_semestres: 8,
      });

      const { userCurso } = await vincularUseCase.execute({
        id_user: user.id,
        id_curso: curso.id,
      });

      expect(userCurso).toEqual(
        expect.objectContaining({
          id_user: user.id,
          id_curso: curso.id,
          ativo: true,
        })
      );
    });

    it("não deve ser possível vincular usuário inexistente", async () => {
      const curso = await cursosRepository.create({
        codigo: "TADS",
        nome: "Tecnologia em Análise e Desenvolvimento de Sistemas",
        turno: "MATUTINO",
        duracao_semestres: 8,
      });

      await expect(() =>
        vincularUseCase.execute({
          id_user: "user-inexistente",
          id_curso: curso.id,
        })
      ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
    });

    it("não deve ser possível vincular a curso inexistente", async () => {
      const user = await usersRepository.create({
        nome: "Professor Teste",
        email: "professor@teste.com",
        senha: "123456",
        role: "PROFESSOR",
      });

      await expect(() =>
        vincularUseCase.execute({
          id_user: user.id,
          id_curso: "curso-inexistente",
        })
      ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
    });
  });

  describe("Buscar Cursos do Usuário", () => {
    it("deve ser possível buscar cursos de um usuário", async () => {
      const user = await usersRepository.create({
        nome: "Professor Teste",
        email: "professor@teste.com",
        senha: "123456",
        role: "PROFESSOR",
      });

      const curso1 = await cursosRepository.create({
        codigo: "TADS",
        nome: "Tecnologia em Análise e Desenvolvimento de Sistemas",
        turno: "MATUTINO",
        duracao_semestres: 8,
      });

      const curso2 = await cursosRepository.create({
        codigo: "SI",
        nome: "Sistemas de Informação",
        turno: "NOTURNO",
        duracao_semestres: 8,
      });

      await vincularUseCase.execute({
        id_user: user.id,
        id_curso: curso1.id,
      });

      await vincularUseCase.execute({
        id_user: user.id,
        id_curso: curso2.id,
      });

      const { cursos } = await buscarCursosUseCase.execute({
        id_user: user.id,
      });

      expect(cursos).toHaveLength(2);
      expect(cursos).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            codigo: "TADS",
            nome: "Tecnologia em Análise e Desenvolvimento de Sistemas",
          }),
          expect.objectContaining({
            codigo: "SI",
            nome: "Sistemas de Informação",
          }),
        ])
      );
    });
  });

  describe("Buscar Usuários do Curso", () => {
    it("deve ser possível buscar usuários de um curso", async () => {
      const user1 = await usersRepository.create({
        nome: "Professor 1",
        email: "professor1@teste.com",
        senha: "123456",
        role: "PROFESSOR",
      });

      const user2 = await usersRepository.create({
        nome: "Professor 2",
        email: "professor2@teste.com",
        senha: "123456",
        role: "PROFESSOR",
      });

      const curso = await cursosRepository.create({
        codigo: "TADS",
        nome: "Tecnologia em Análise e Desenvolvimento de Sistemas",
        turno: "MATUTINO",
        duracao_semestres: 8,
      });

      await vincularUseCase.execute({
        id_user: user1.id,
        id_curso: curso.id,
      });

      await vincularUseCase.execute({
        id_user: user2.id,
        id_curso: curso.id,
      });

      const { usuarios } = await buscarUsuariosUseCase.execute({
        id_curso: curso.id,
      });

      expect(usuarios).toHaveLength(2);
      expect(usuarios).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            nome: "Professor 1",
            email: "professor1@teste.com",
          }),
          expect.objectContaining({
            nome: "Professor 2",
            email: "professor2@teste.com",
          }),
        ])
      );
    });
  });

  describe("Erros — UserCursoAlreadyExistsError (teste direto)", () => {
    it("deve instanciar e lançar UserCursoAlreadyExistsError corretamente", async () => {
      const error = new UserCursoAlreadyExistsError();
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("Error");
      expect(typeof error.message).toBe("string");

      try {
        throw error;
      } catch (e: any) {
        expect(e).toBeInstanceOf(UserCursoAlreadyExistsError);
        expect(e.stack).toEqual(expect.any(String));
      }
    });
  });
});
