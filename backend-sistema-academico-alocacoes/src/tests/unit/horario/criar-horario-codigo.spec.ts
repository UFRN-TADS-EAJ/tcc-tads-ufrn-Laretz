import { describe, it, expect } from "vitest";
import { InMemoryHorariosRepository } from "@/repositories/in-memory/in-memory-horarios-repository";
import { CriarHorarioCodigoUseCase } from "@/use-cases/horario/criar-horario-codigo";

describe("CriarHorarioCodigoUseCase", () => {
  it("deve decodificar código e criar horário (2M12 => SEGUNDA, M1, 07:00-08:40)", async () => {
    const repo = new InMemoryHorariosRepository();
    const sut = new CriarHorarioCodigoUseCase(repo);

    const { horario } = await sut.execute({ codigo: "2M12" });

    expect(horario.dia_semana).toBe("SEGUNDA");
    expect(horario.codigo).toBe("M1");
    const inicio = new Date(horario.horario_inicio);
    const fim = new Date(horario.horario_fim);
    expect(inicio.getUTCHours()).toBe(7);
    expect(inicio.getUTCMinutes()).toBe(0);
    expect(fim.getUTCHours()).toBe(8);
    expect(fim.getUTCMinutes()).toBe(40);
  });

  it("deve reutilizar horário existente se já houver um igual", async () => {
    const repo = new InMemoryHorariosRepository();
    const sut = new CriarHorarioCodigoUseCase(repo);

    const first = await sut.execute({ codigo: "2M12" });
    const second = await sut.execute({ codigo: "2M12" });

    expect(second.horario.id).toBe(first.horario.id);
  });

  it("deve falhar para código inválido (turno inválido ou dia fora)", async () => {
    const repo = new InMemoryHorariosRepository();
    const sut = new CriarHorarioCodigoUseCase(repo);

    await expect(sut.execute({ codigo: "1M12" })).rejects.toBeInstanceOf(Error);
    await expect(sut.execute({ codigo: "2X12" })).rejects.toBeInstanceOf(Error);
    await expect(sut.execute({ codigo: "2M7" })).rejects.toBeInstanceOf(Error);
  });
});