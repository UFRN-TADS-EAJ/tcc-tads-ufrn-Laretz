import { describe, it, expect } from "vitest";
import { BuscarSalasUseCase } from "@/use-cases/sala/buscar-salas";
import { InMemorySalasRepository } from "@/repositories/in-memory/in-memory-salas-repository";

class RepoUndefinedSalas extends InMemorySalasRepository {
  async findMany(page: number) { return undefined as any; }
}

describe("BuscarSalasUseCase — fallback quando repo retorna undefined", () => {
  it("deve retornar lista vazia quando findMany retorna undefined", async () => {
    const repo = new RepoUndefinedSalas();
    const sut = new BuscarSalasUseCase(repo as any);
    const { salas } = await sut.execute({ page: 1 });
    expect(salas).toStrictEqual([]);
  });
});