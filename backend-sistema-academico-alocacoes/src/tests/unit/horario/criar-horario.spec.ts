import { describe, it, expect } from "vitest";
import { InMemoryHorariosRepository } from "@/repositories/in-memory/in-memory-horarios-repository";
import { CriarHorarioUseCase } from "@/use-cases/horario/criar-horario";

describe("CriarHorarioUseCase", () => {
  it("deve criar um horário com os dados informados", async () => {
    const repo = new InMemoryHorariosRepository();
    const sut = new CriarHorarioUseCase(repo);

    const inicio = new Date("1970-01-01T07:00:00.000Z");
    const fim = new Date("1970-01-01T07:50:00.000Z");

    const { horario } = await sut.execute({
      codigo: "M1",
      dia_semana: "SEGUNDA",
      horario_inicio: inicio,
      horario_fim: fim,
    });

    expect(horario).toBeDefined();
    expect(horario.id).toEqual(expect.any(String));
    expect(horario.codigo).toBe("M1");
    expect(horario.dia_semana).toBe("SEGUNDA");
    expect(new Date(horario.horario_inicio).getTime()).toBe(inicio.getTime());
    expect(new Date(horario.horario_fim).getTime()).toBe(fim.getTime());
  });
});