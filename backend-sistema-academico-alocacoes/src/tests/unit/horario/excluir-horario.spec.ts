import { describe, it, expect } from "vitest";
import { InMemoryHorariosRepository } from "@/repositories/in-memory/in-memory-horarios-repository";
import { ExcluirHorarioUseCase } from "@/use-cases/horario/excluir-horario";
import { CriarHorarioUseCase } from "@/use-cases/horario/criar-horario";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

describe("ExcluirHorarioUseCase", () => {
  it("deve excluir um horário existente", async () => {
    const repo = new InMemoryHorariosRepository();
    const criar = new CriarHorarioUseCase(repo);
    const sut = new ExcluirHorarioUseCase(repo);

    const { horario } = await criar.execute({
      codigo: "T1",
      dia_semana: "TERCA",
      horario_inicio: new Date("1970-01-01T13:00:00.000Z"),
      horario_fim: new Date("1970-01-01T13:50:00.000Z"),
    });

    await sut.execute({ id: horario.id });

    const encontrado = await repo.findById(horario.id);
    expect(encontrado).toBeNull();
  });

  it("deve lançar erro ao excluir horário inexistente", async () => {
    const repo = new InMemoryHorariosRepository();
    const sut = new ExcluirHorarioUseCase(repo);

    await expect(sut.execute({ id: "nao-existe" })).rejects.toBeInstanceOf(
      RecursoNaoEncontradoError
    );
  });
});