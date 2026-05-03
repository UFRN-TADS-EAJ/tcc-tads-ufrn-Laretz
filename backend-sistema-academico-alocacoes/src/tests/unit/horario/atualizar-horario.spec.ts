import { describe, it, expect } from "vitest";
import { InMemoryHorariosRepository } from "@/repositories/in-memory/in-memory-horarios-repository";
import { AtualizarHorarioUseCase } from "@/use-cases/horario/atualizar-horario";
import { CriarHorarioUseCase } from "@/use-cases/horario/criar-horario";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

describe("AtualizarHorarioUseCase", () => {
  it("deve atualizar campos informados do horário", async () => {
    const repo = new InMemoryHorariosRepository();
    const criar = new CriarHorarioUseCase(repo);
    const sut = new AtualizarHorarioUseCase(repo);

    const { horario } = await criar.execute({
      codigo: "M1",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T07:00:00.000Z"),
      horario_fim: new Date("1970-01-01T07:50:00.000Z"),
    });

    const { horario: atualizado } = await sut.execute({
      id: horario.id,
      codigo: "M2",
      horario_fim: new Date("1970-01-01T08:40:00.000Z"),
    });

    expect(atualizado.codigo).toBe("M2");
    expect(new Date(atualizado.horario_fim).getUTCHours()).toBe(8);
    expect(new Date(atualizado.horario_fim).getUTCMinutes()).toBe(40);
    // Campos não alterados permanecem
    expect(atualizado.dia_semana).toBe("SEGUNDA");
  });

  it("deve lançar erro quando o horário não existe", async () => {
    const repo = new InMemoryHorariosRepository();
    const sut = new AtualizarHorarioUseCase(repo);

    await expect(
      sut.execute({
        id: "inexistente",
        codigo: "T1",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});