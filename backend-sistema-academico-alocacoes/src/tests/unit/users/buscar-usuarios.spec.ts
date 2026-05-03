import { describe, it, expect } from "vitest";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { BuscarUsuariosUseCase } from "@/use-cases/users/buscar-usuarios";

describe("BuscarUsuariosUseCase", () => {
  it("deve listar usuários com filtro de busca", async () => {
    const repo = new InMemoryUsersRepository();
    await repo.create({
      nome: "Ana Maria",
      email: "ana@ex.com",
      senha: "h",
      role: "PROFESSOR",
      especializacao: "Matemática",
    });
    await repo.create({
      nome: "Bruno",
      email: "bruno@ex.com",
      senha: "h",
      role: "ADMIN",
      especializacao: "Física",
    });
    await repo.create({
      nome: "Carlos",
      email: "carlos@ex.com",
      senha: "h",
      role: "PROFESSOR",
      especializacao: "Geografia",
    });

    const sut = new BuscarUsuariosUseCase(repo);
    const { usuarios } = await sut.execute({ page: 1, search: "br" });
    expect(usuarios.length).toBe(1);
    expect(usuarios[0]!.nome).toBe("Bruno");
  });

  it("deve listar usuários sem filtro (página 1)", async () => {
    const repo = new InMemoryUsersRepository();
    await repo.create({
      nome: "A",
      email: "a@ex.com",
      senha: "h",
      role: "PROFESSOR",
    });
    await repo.create({
      nome: "B",
      email: "b@ex.com",
      senha: "h",
      role: "PROFESSOR",
    });

    const sut = new BuscarUsuariosUseCase(repo);
    const { usuarios } = await sut.execute({ page: 1 });
    expect(usuarios.length).toBe(2);
  });
});
