import { describe, it, expect } from "vitest";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";
import { BuscarCargaHorariaProfessoresUseCase } from "@/use-cases/alocacao/buscar-carga-horaria-professores";

describe("BuscarCargaHorariaProfessoresUseCase", () => {
  it("deve contabilizar alocações por professor percorrendo páginas de usuários (20 por página)", async () => {
    const alocRepo = new InMemoryAlocacoesRepository();
    const usersRepo = new InMemoryUsersRepository();
    const periodosRepo = new InMemoryPeriodosLetivosRepository();
    periodosRepo.items.push({
      id: "periodo-1",
      nome: "2026.1",
      data_inicio: new Date("2026-02-01T00:00:00.000Z"),
      data_fim: new Date("2026-07-31T00:00:00.000Z"),
      ativo: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // cria 25 professores e 5 alunos para validar filtro
    const professorIds: string[] = [];
    for (let i = 0; i < 25; i++) {
      const u = await usersRepo.create({
        nome: `Professor ${i}`,
        email: `prof${i}@ex.com`,
        senha: "x",
        role: "PROFESSOR",
      } as any);
      professorIds.push(u.id);
    }
    for (let i = 0; i < 5; i++) {
      await usersRepo.create({
        nome: `Aluno ${i}`,
        email: `aluno${i}@ex.com`,
        senha: "x",
        role: "ALUNO",
      } as any);
    }

    // cria alocações: prof0 -> 10, prof1 -> 5, prof2 -> 0
    for (let i = 0; i < 10; i++) {
      await alocRepo.createWithCustomData({ id_user: professorIds[0]! });
    }
    for (let i = 0; i < 5; i++) {
      await alocRepo.createWithCustomData({ id_user: professorIds[1]! });
    }

    const sut = new BuscarCargaHorariaProfessoresUseCase(
      alocRepo,
      usersRepo,
      periodosRepo,
    );
    const { cargaHoraria } = await sut.execute();

    expect(cargaHoraria[professorIds[0]!]).toBe(10);
    expect(cargaHoraria[professorIds[1]!]).toBe(5);
    expect(cargaHoraria[professorIds[2]!]).toBe(0);
    // garante que não há chave para alunos
    // pega um aluno criado e verifica ausência
    const alunoId = usersRepo.items.find((u) => (u.role as unknown as string) === "ALUNO")!.id;
    expect(cargaHoraria[alunoId]).toBeUndefined();
  });
});
