import { describe, it, expect } from "vitest";
import { BuscarUsuariosUseCase } from "@/use-cases/users/buscar-usuarios";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";

class RepoUndefined extends InMemoryUsersRepository {
  async findMany(page: number, search?: string) { return undefined as any; }
}

describe("BuscarUsuariosUseCase — fallback quando repo retorna undefined", () => {
  it("deve retornar lista vazia quando findMany retorna undefined", async () => {
    const repo = new RepoUndefined();
    const sut = new BuscarUsuariosUseCase(repo);
    const { usuarios } = await sut.execute({ page: 1 });
    expect(usuarios).toStrictEqual([]);
  });
});