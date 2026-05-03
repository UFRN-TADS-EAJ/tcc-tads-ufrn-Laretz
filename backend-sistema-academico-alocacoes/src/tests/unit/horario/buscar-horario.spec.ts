import { describe, it, expect } from "vitest";
import { InMemoryHorariosRepository } from "@/repositories/in-memory/in-memory-horarios-repository";
import { BuscarHorarioUseCase } from "@/use-cases/horario/buscar-horario";
import { CriarHorarioUseCase } from "@/use-cases/horario/criar-horario";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

describe("BuscarHorarioUseCase", () => {
  it("deve buscar horário por id", async () => {
    const repo = new InMemoryHorariosRepository();
    const criar = new CriarHorarioUseCase(repo);
    const sut = new BuscarHorarioUseCase(repo);

    const { horario } = await criar.execute({
      codigo: "N2",
      dia_semana: "QUARTA",
      horario_inicio: new Date("1970-01-01T19:35:00.000Z"),
      horario_fim: new Date("1970-01-01T20:25:00.000Z"),
    });

    const { horario: encontrado } = await sut.execute({ id: horario.id });
    expect(encontrado.id).toBe(horario.id);
    expect(encontrado.codigo).toBe("N2");
  });

  it("deve falhar quando não encontra horário", async () => {
    const repo = new InMemoryHorariosRepository();
    const sut = new BuscarHorarioUseCase(repo);
    await expect(sut.execute({ id: "x" })).rejects.toBeInstanceOf(
      RecursoNaoEncontradoError
    );
  });
});