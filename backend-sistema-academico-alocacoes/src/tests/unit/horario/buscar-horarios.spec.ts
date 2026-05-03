import { describe, it, expect } from "vitest";
import { InMemoryHorariosRepository } from "@/repositories/in-memory/in-memory-horarios-repository";
import { BuscarHorariosUseCase } from "@/use-cases/horario/buscar-horarios";
import { CriarHorarioUseCase } from "@/use-cases/horario/criar-horario";

describe("BuscarHorariosUseCase", () => {
  it("deve retornar lista ordenada por dia e código", async () => {
    const repo = new InMemoryHorariosRepository();
    const criar = new CriarHorarioUseCase(repo);
    const sut = new BuscarHorariosUseCase(repo);

    // Inserir em ordem aleatória
    await criar.execute({
      codigo: "T2",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T13:50:00.000Z"),
      horario_fim: new Date("1970-01-01T14:40:00.000Z"),
    });
    await criar.execute({
      codigo: "M1",
      dia_semana: "TERCA",
      horario_inicio: new Date("1970-01-01T07:00:00.000Z"),
      horario_fim: new Date("1970-01-01T07:50:00.000Z"),
    });
    await criar.execute({
      codigo: "M2",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T07:50:00.000Z"),
      horario_fim: new Date("1970-01-01T08:40:00.000Z"),
    });
    await criar.execute({
      codigo: "N3",
      dia_semana: "QUARTA",
      horario_inicio: new Date("1970-01-01T20:35:00.000Z"),
      horario_fim: new Date("1970-01-01T21:25:00.000Z"),
    });

    const { horarios } = await sut.execute();
    expect(horarios.length).toBe(4);
    // Ordem esperada: SEGUNDA (M2, T2) [por codigo M antes de T], TERCA (M1), QUARTA (N3)
    expect(horarios[0]!.dia_semana).toBe("SEGUNDA");
    expect(horarios[0]!.codigo).toBe("M2");
    expect(horarios[1]!.codigo).toBe("T2");
    expect(horarios[2]!.dia_semana).toBe("TERCA");
    expect(horarios[2]!.codigo).toBe("M1");
    expect(horarios[3]!.dia_semana).toBe("QUARTA");
    expect(horarios[3]!.codigo).toBe("N3");
  });

  it("deve retornar lista vazia quando não houver horários", async () => {
    const repo = new InMemoryHorariosRepository();
    const sut = new BuscarHorariosUseCase(repo);
    const { horarios } = await sut.execute();
    expect(horarios).toEqual([]);
  });
});
