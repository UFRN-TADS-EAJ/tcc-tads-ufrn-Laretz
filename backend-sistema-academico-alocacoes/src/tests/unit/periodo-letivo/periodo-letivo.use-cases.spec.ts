import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";
import { CriarPeriodoLetivoUseCase } from "@/use-cases/periodo-letivo/criar-periodo-letivo";
import { ListarPeriodosLetivosUseCase } from "@/use-cases/periodo-letivo/listar-periodos-letivos";
import { BuscarPeriodoLetivoAtivoUseCase } from "@/use-cases/periodo-letivo/buscar-periodo-letivo-ativo";
import { AtivarPeriodoLetivoUseCase } from "@/use-cases/periodo-letivo/ativar-periodo-letivo";
import { AvancarPeriodoLetivoUseCase } from "@/use-cases/periodo-letivo/avancar-periodo-letivo";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let periodosRepository: InMemoryPeriodosLetivosRepository;

describe("Período Letivo (use-cases)", () => {
  beforeEach(() => {
    periodosRepository = new InMemoryPeriodosLetivosRepository();
  });

  it("deve criar um período letivo ativo por padrão", async () => {
    const sut = new CriarPeriodoLetivoUseCase(periodosRepository);

    const { periodo } = await sut.execute({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
    });

    expect(periodo.id).toEqual(expect.any(String));
    expect(periodo.ativo).toBe(true);
  });

  it("deve garantir apenas um período ativo ao criar um novo período como ativo", async () => {
    await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const segundo = await periodosRepository.create({
      nome: "2026.2",
      data_inicio: new Date("2026-07-01T00:00:00.000Z"),
      data_fim: new Date("2026-12-20T00:00:00.000Z"),
      ativo: true,
    });

    const ativos = periodosRepository.items.filter((p) => p.ativo);
    expect(ativos).toHaveLength(1);
    expect(ativos[0]?.id).toBe(segundo.id);
  });

  it("deve listar períodos letivos", async () => {
    await periodosRepository.create({
      nome: "2025.2",
      data_inicio: new Date("2025-08-01T00:00:00.000Z"),
      data_fim: new Date("2025-12-20T00:00:00.000Z"),
      ativo: false,
    });

    await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const sut = new ListarPeriodosLetivosUseCase(periodosRepository);
    const { periodos } = await sut.execute();

    expect(periodos).toHaveLength(2);
    expect(periodos[0]?.nome).toBe("2026.1");
    expect(periodos[1]?.nome).toBe("2025.2");
  });

  it("deve buscar o período letivo ativo (mais recente por data_inicio)", async () => {
    await periodosRepository.create({
      nome: "2025.2",
      data_inicio: new Date("2025-08-01T00:00:00.000Z"),
      data_fim: new Date("2025-12-20T00:00:00.000Z"),
      ativo: true,
    });

    await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const sut = new BuscarPeriodoLetivoAtivoUseCase(periodosRepository);
    const { periodo } = await sut.execute();

    expect(periodo.nome).toBe("2026.1");
    expect(periodo.ativo).toBe(true);
  });

  it("deve falhar ao buscar período ativo quando não existe", async () => {
    const sut = new BuscarPeriodoLetivoAtivoUseCase(periodosRepository);

    await expect(() => sut.execute()).rejects.toBeInstanceOf(Error);
  });

  it("deve ativar um período e desativar os demais", async () => {
    const p1 = await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const p2 = await periodosRepository.create({
      nome: "2026.2",
      data_inicio: new Date("2026-07-01T00:00:00.000Z"),
      data_fim: new Date("2026-12-20T00:00:00.000Z"),
      ativo: false,
    });

    const sut = new AtivarPeriodoLetivoUseCase(periodosRepository);
    const { periodo } = await sut.execute({ id: p2.id });

    expect(periodo.id).toBe(p2.id);

    const p1Atual = await periodosRepository.findById(p1.id);
    const p2Atual = await periodosRepository.findById(p2.id);
    expect(p1Atual?.ativo).toBe(false);
    expect(p2Atual?.ativo).toBe(true);
  });

  it("deve falhar ao ativar um período inexistente", async () => {
    const sut = new AtivarPeriodoLetivoUseCase(periodosRepository);

    await expect(() =>
      sut.execute({ id: "e5fe5b7f-3ff8-4c05-9d75-9f0dc8b300c1" }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("deve avançar o período: encerrar o ativo e criar o próximo como ativo", async () => {
    await periodosRepository.create({
      nome: "2026.1",
      data_inicio: new Date("2026-01-01T00:00:00.000Z"),
      data_fim: new Date("2026-06-30T00:00:00.000Z"),
      ativo: true,
    });

    const sut = new AvancarPeriodoLetivoUseCase(periodosRepository);
    const { encerrados, periodo } = await sut.execute({
      nome: "2026.2",
      data_inicio: new Date("2026-07-01T00:00:00.000Z"),
      data_fim: new Date("2026-12-20T00:00:00.000Z"),
    });

    expect(encerrados).toBe(1);
    expect(periodo.nome).toBe("2026.2");
    expect(periodo.ativo).toBe(true);

    const ativo = await periodosRepository.findActive();
    expect(ativo?.id).toBe(periodo.id);
  });
});
