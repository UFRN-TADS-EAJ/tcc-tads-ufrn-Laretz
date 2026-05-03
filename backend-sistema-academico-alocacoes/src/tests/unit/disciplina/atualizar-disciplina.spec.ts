import { expect, describe, it, beforeEach } from "vitest";
import { AtualizarDisciplinaUseCase } from "@/use-cases/disciplina/atualizar-disciplina";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let disciplinasRepository: InMemoryDisciplinasRepository;
let alocacoesRepository: InMemoryAlocacoesRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: AtualizarDisciplinaUseCase;

describe("Atualizar Disciplina Use Case", () => {
  beforeEach(() => {
    disciplinasRepository = new InMemoryDisciplinasRepository();
    alocacoesRepository = new InMemoryAlocacoesRepository();
    periodosRepository = new InMemoryPeriodosLetivosRepository();
    periodosRepository.items.push({
      id: "periodo-1",
      nome: "2026.1",
      data_inicio: new Date("2026-02-01T00:00:00.000Z"),
      data_fim: new Date("2026-07-31T00:00:00.000Z"),
      ativo: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    sut = new AtualizarDisciplinaUseCase(
      disciplinasRepository,
      alocacoesRepository,
      periodosRepository,
    );
  });

  it("deve ser possível atualizar uma disciplina", async () => {
    const disciplinaCriada = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 80,
      curso: {
        connect: {
          id: "curso-1",
        },
      },
    });

    const { disciplina } = await sut.execute({
      id: disciplinaCriada.id,
      nome: "Matemática Avançada",
      carga_horaria: 100,
    });

    expect(disciplina.id).toEqual(disciplinaCriada.id);
    expect(disciplina.nome).toEqual("Matemática Avançada");
    expect(disciplina.carga_horaria).toEqual(100);
  });

  it("deve ser possível atualizar apenas o nome da disciplina", async () => {
    const disciplinaCriada = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 80,
      curso: {
        connect: {
          id: "curso-1",
        },
      },
    });

    const { disciplina } = await sut.execute({
      id: disciplinaCriada.id,
      nome: "Matemática Básica",
    });

    expect(disciplina.nome).toEqual("Matemática Básica");
    expect(disciplina.carga_horaria).toEqual(80); // Deve manter o valor original
  });

  it("deve ser possível atualizar apenas a carga horária da disciplina", async () => {
    const disciplinaCriada = await disciplinasRepository.create({
      nome: "Matemática",
      carga_horaria: 80,
      curso: {
        connect: {
          id: "curso-1",
        },
      },
    });

    const { disciplina } = await sut.execute({
      id: disciplinaCriada.id,
      carga_horaria: 120,
    });

    expect(disciplina.nome).toEqual("Matemática");
    expect(disciplina.carga_horaria).toEqual(120);
  });

  it("deve recalcular o total de aulas quando a carga horária for atualizada", async () => {
    const disciplinaCriada = await disciplinasRepository.create({
      nome: "Física",
      carga_horaria: 60, // 72 aulas (60 * 60 / 50 = 72)
      curso: {
        connect: {
          id: "curso-1",
        },
      },
    });

    const { disciplina } = await sut.execute({
      id: disciplinaCriada.id,
      carga_horaria: 90, // 108 aulas (90 * 60 / 50 = 108)
    });

    expect(disciplina.carga_horaria).toEqual(90);
    expect(disciplina.total_aulas).toEqual(108); // Deve recalcular automaticamente
  });

  it("não deve ser possível atualizar disciplina com id inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: "id-inexistente",
        nome: "Disciplina Teste",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});
