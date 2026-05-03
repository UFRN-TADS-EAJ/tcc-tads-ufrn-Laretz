import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryReservasSalaRepository } from "@/repositories/in-memory/in-memory-reservas-sala-repository";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryHorariosRepository } from "@/repositories/in-memory/in-memory-horarios-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";
import { CriarReservaUseCase } from "@/use-cases/reservas-sala/criar-reserva";
import { BuscarReservasUseCase } from "@/use-cases/reservas-sala/buscar-reservas";
import { CancelarReservaUseCase } from "@/use-cases/reservas-sala/cancelar-reserva";
import { CancelarSerieUseCase } from "@/use-cases/reservas-sala/cancelar-serie";
import { DataInvalidaError } from "@/use-cases/errors/data-invalida";
import { HorarioInexistenteError } from "@/use-cases/errors/horario-inexistente";
import { DataIncompativelDiaSemanaError } from "@/use-cases/errors/data-incompativel-dia-semana";
import { ConflitoReservaAlocacaoError } from "@/use-cases/errors/conflito-reserva-alocacao";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let reservasRepository: InMemoryReservasSalaRepository;
let alocacoesRepository: InMemoryAlocacoesRepository;
let horariosRepository: InMemoryHorariosRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;

describe("Reservas de Sala (use-cases)", () => {
  beforeEach(() => {
    reservasRepository = new InMemoryReservasSalaRepository();
    alocacoesRepository = new InMemoryAlocacoesRepository();
    horariosRepository = new InMemoryHorariosRepository();
    periodosRepository = new InMemoryPeriodosLetivosRepository();
  });

  it("deve criar uma reserva para uma data válida e compatível com o dia da semana", async () => {
    const periodo = await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const horario = await horariosRepository.create({
      codigo: "M1",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T07:30:00.000Z"),
      horario_fim: new Date("1970-01-01T08:20:00.000Z"),
    });

    const sut = new CriarReservaUseCase(
      reservasRepository,
      alocacoesRepository,
      horariosRepository,
      periodosRepository,
    );

    const { reservas } = await sut.execute({
      salaId: "sala-01",
      horarioId: horario.id,
      date: "2026-04-06",
      titulo: "Reunião",
      criado_por: "user-01",
    });

    expect(reservas).toHaveLength(1);
    expect(reservas[0]?.id).toEqual(expect.any(String));
    expect((reservas[0] as any).periodoId).toBe(periodo.id);
    expect(reservas[0]?.status).toBe("ATIVA");
  });

  it("deve falhar ao criar reserva com data inválida", async () => {
    await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const horario = await horariosRepository.create({
      codigo: "M1",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T07:30:00.000Z"),
      horario_fim: new Date("1970-01-01T08:20:00.000Z"),
    });

    const sut = new CriarReservaUseCase(
      reservasRepository,
      alocacoesRepository,
      horariosRepository,
      periodosRepository,
    );

    await expect(() =>
      sut.execute({
        salaId: "sala-01",
        horarioId: horario.id,
        date: "data-invalida",
        titulo: "Reunião",
        criado_por: "user-01",
      }),
    ).rejects.toBeInstanceOf(DataInvalidaError);
  });

  it("deve falhar ao criar reserva com horário inexistente", async () => {
    await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const sut = new CriarReservaUseCase(
      reservasRepository,
      alocacoesRepository,
      horariosRepository,
      periodosRepository,
    );

    await expect(() =>
      sut.execute({
        salaId: "sala-01",
        horarioId: "horario-inexistente",
        date: "2026-04-06",
        titulo: "Reunião",
        criado_por: "user-01",
      }),
    ).rejects.toBeInstanceOf(HorarioInexistenteError);
  });

  it("deve falhar ao criar reserva quando o dia da data não bate com o dia do horário", async () => {
    await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const horario = await horariosRepository.create({
      codigo: "M1",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T07:30:00.000Z"),
      horario_fim: new Date("1970-01-01T08:20:00.000Z"),
    });

    const sut = new CriarReservaUseCase(
      reservasRepository,
      alocacoesRepository,
      horariosRepository,
      periodosRepository,
    );

    await expect(() =>
      sut.execute({
        salaId: "sala-01",
        horarioId: horario.id,
        date: "2026-04-07",
        titulo: "Reunião",
        criado_por: "user-01",
      }),
    ).rejects.toBeInstanceOf(DataIncompativelDiaSemanaError);
  });

  it("deve falhar ao criar reserva se existir reserva conflitante no mesmo período", async () => {
    const periodo = await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const horario = await horariosRepository.create({
      codigo: "M1",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T07:30:00.000Z"),
      horario_fim: new Date("1970-01-01T08:20:00.000Z"),
    });

    await reservasRepository.create({
      salaId: "sala-01",
      horarioId: horario.id,
      date: new Date("2026-04-06T00:00:00.000Z"),
      titulo: "Já reservado",
      criado_por: "user-01",
      status: "ATIVA",
      periodoId: periodo.id,
    } as any);

    const sut = new CriarReservaUseCase(
      reservasRepository,
      alocacoesRepository,
      horariosRepository,
      periodosRepository,
    );

    try {
      await sut.execute({
        salaId: "sala-01",
        horarioId: horario.id,
        date: "2026-04-06",
        titulo: "Reunião",
        criado_por: "user-01",
      });
      throw new Error("esperava conflito");
    } catch (err) {
      expect(err).toBeInstanceOf(ConflitoReservaAlocacaoError);
      const e = err as ConflitoReservaAlocacaoError;
      expect(e.conflicts).toEqual([{ type: "RESERVA", date: "2026-04-06" }]);
    }
  });

  it("deve permitir reservar no período ativo mesmo se existir reserva igual em outro período", async () => {
    const p1 = await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const horario = await horariosRepository.create({
      codigo: "M1",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T07:30:00.000Z"),
      horario_fim: new Date("1970-01-01T08:20:00.000Z"),
    });

    await reservasRepository.create({
      salaId: "sala-01",
      horarioId: horario.id,
      date: new Date("2026-04-06T00:00:00.000Z"),
      titulo: "Reserva em outro período",
      criado_por: "user-01",
      status: "ATIVA",
      periodoId: p1.id,
    } as any);

    const p2 = await periodosRepository.create({
      nome: "2026.2",
      data_inicio: new Date("2026-07-01T00:00:00.000Z"),
      data_fim: new Date("2026-12-20T00:00:00.000Z"),
      ativo: true,
    });

    const sut = new CriarReservaUseCase(
      reservasRepository,
      alocacoesRepository,
      horariosRepository,
      periodosRepository,
    );

    const { reservas } = await sut.execute({
      salaId: "sala-01",
      horarioId: horario.id,
      date: "2026-04-06",
      titulo: "Reserva no período ativo",
      criado_por: "user-01",
    });

    expect(reservas).toHaveLength(1);
    expect((reservas[0] as any).periodoId).toBe(p2.id);
  });

  it("deve falhar ao criar reserva se existir alocação fixa no mesmo horário e período", async () => {
    const periodo = await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const horario = await horariosRepository.create({
      codigo: "M1",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T07:30:00.000Z"),
      horario_fim: new Date("1970-01-01T08:20:00.000Z"),
    });

    await alocacoesRepository.createWithCustomData({
      id_sala: "sala-01",
      id_horario: horario.id,
      periodoId: periodo.id,
    });

    const sut = new CriarReservaUseCase(
      reservasRepository,
      alocacoesRepository,
      horariosRepository,
      periodosRepository,
    );

    await expect(() =>
      sut.execute({
        salaId: "sala-01",
        horarioId: horario.id,
        date: "2026-04-06",
        titulo: "Reunião",
        criado_por: "user-01",
      }),
    ).rejects.toBeInstanceOf(ConflitoReservaAlocacaoError);
  });

  it("deve criar uma série semanal de reservas", async () => {
    await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const horario = await horariosRepository.create({
      codigo: "M1",
      dia_semana: "SEGUNDA",
      horario_inicio: new Date("1970-01-01T07:30:00.000Z"),
      horario_fim: new Date("1970-01-01T08:20:00.000Z"),
    });

    const sut = new CriarReservaUseCase(
      reservasRepository,
      alocacoesRepository,
      horariosRepository,
      periodosRepository,
    );

    const { reservas } = await sut.execute({
      salaId: "sala-01",
      horarioId: horario.id,
      date: "2026-04-06",
      titulo: "Evento recorrente",
      criado_por: "user-01",
      recurrenceRule: "WEEKLY",
      recurrenceEnd: "2026-04-20",
    });

    expect(reservas).toHaveLength(3);
    const seriesId = reservas[0]?.seriesId;
    expect(seriesId).toEqual(expect.any(String));
    expect(reservas.every((r) => r.seriesId === seriesId)).toBe(true);
  });

  it("deve buscar reservas filtrando por período ativo", async () => {
    const p1 = await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    await reservasRepository.createMany([
      {
        salaId: "sala-01",
        horarioId: "horario-01",
        date: new Date("2026-04-01T00:00:00.000Z"),
        titulo: "A",
        criado_por: "user-01",
        status: "ATIVA",
        periodoId: p1.id,
      } as any,
      {
        salaId: "sala-01",
        horarioId: "horario-02",
        date: new Date("2026-04-02T00:00:00.000Z"),
        titulo: "B",
        criado_por: "user-01",
        status: "ATIVA",
        periodoId: p1.id,
      } as any,
    ]);

    const p2 = await periodosRepository.create({
      nome: "2026.2",
      data_inicio: new Date("2026-07-01T00:00:00.000Z"),
      data_fim: new Date("2026-12-20T00:00:00.000Z"),
      ativo: true,
    });

    await reservasRepository.create({
      salaId: "sala-01",
      horarioId: "horario-01",
      date: new Date("2026-04-01T00:00:00.000Z"),
      titulo: "C",
      criado_por: "user-01",
      status: "ATIVA",
      periodoId: p2.id,
    } as any);

    const sut = new BuscarReservasUseCase(reservasRepository, periodosRepository);
    const { reservas, total } = await sut.execute({ salaId: "sala-01" });

    expect(total).toBe(1);
    expect(reservas).toHaveLength(1);
    expect((reservas[0] as any).periodoId).toBe(p2.id);
  });

  it("deve cancelar uma reserva existente", async () => {
    const reserva = await reservasRepository.create({
      salaId: "sala-01",
      horarioId: "horario-01",
      date: new Date("2026-04-01T00:00:00.000Z"),
      titulo: "A",
      criado_por: "user-01",
      status: "ATIVA",
      periodoId: "periodo-01",
    } as any);

    const sut = new CancelarReservaUseCase(reservasRepository);
    const { reserva: cancelada } = await sut.execute({ id: reserva.id });

    expect(cancelada.status).toBe("CANCELADA");
  });

  it("deve falhar ao cancelar reserva inexistente", async () => {
    const sut = new CancelarReservaUseCase(reservasRepository);

    await expect(() =>
      sut.execute({ id: "f8d93f91-2c26-4bf1-a21d-4b9a3b99ca42" }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("deve cancelar uma série de reservas", async () => {
    const seriesId = "series-01";

    await reservasRepository.createMany([
      {
        salaId: "sala-01",
        horarioId: "horario-01",
        date: new Date("2026-04-01T00:00:00.000Z"),
        titulo: "A",
        criado_por: "user-01",
        status: "ATIVA",
        seriesId,
        periodoId: "periodo-01",
      } as any,
      {
        salaId: "sala-01",
        horarioId: "horario-01",
        date: new Date("2026-04-08T00:00:00.000Z"),
        titulo: "B",
        criado_por: "user-01",
        status: "ATIVA",
        seriesId,
        periodoId: "periodo-01",
      } as any,
    ]);

    const sut = new CancelarSerieUseCase(reservasRepository);
    const { count } = await sut.execute({ seriesId });

    expect(count).toBe(2);
    const reservas = await reservasRepository.findManyBySeriesId(seriesId);
    expect(reservas.every((r) => r.status === "CANCELADA")).toBe(true);
  });

  it("deve falhar ao cancelar uma série inexistente", async () => {
    const sut = new CancelarSerieUseCase(reservasRepository);

    await expect(() => sut.execute({ seriesId: "series-inexistente" })).rejects.toBeInstanceOf(
      RecursoNaoEncontradoError,
    );
  });
});

