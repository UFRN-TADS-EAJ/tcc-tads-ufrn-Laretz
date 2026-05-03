import { describe, it, expect } from "vitest";
import { InMemoryTurmasRepository } from "@/repositories/in-memory/in-memory-turmas-repository";
import { BuscarTurmasUseCase } from "@/use-cases/turma/buscar-turmas";

describe("BuscarTurmasUseCase — construção de params", () => {
  it("deve aceitar todos os filtros definidos", async () => {
    const repo = new InMemoryTurmasRepository();
    await repo.create({ nome: "T1", num_alunos: 10, turno: "MATUTINO", curso: { connect: { id: "c1" } }, semestre: 1 } as any);
    const sut = new BuscarTurmasUseCase(repo);
    const { turmas } = await sut.execute({ page: 1, limit: 10, search: "T", sortBy: "nome", sortOrder: "asc", turno: "MATUTINO", semestre: 1, ativa: true, id_curso: "c1" });
    expect(turmas.length).toBe(1);
  });

  it("deve funcionar com filtros undefined (somente page/limit)", async () => {
    const repo = new InMemoryTurmasRepository();
    await repo.create({ nome: "T2", num_alunos: 10, turno: "MATUTINO", curso: { connect: { id: "c1" } }, semestre: 1 } as any);
    const sut = new BuscarTurmasUseCase(repo);
    const { turmas } = await sut.execute({ page: 1 });
    expect(turmas.length).toBe(1);
  });
});