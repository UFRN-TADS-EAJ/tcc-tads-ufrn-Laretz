import { describe, it, expect, beforeEach } from "vitest";
import { BuscarGradeHorariosUseCase } from "@/use-cases/alocacao/buscar-grade-horarios";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let repo: InMemoryAlocacoesRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: BuscarGradeHorariosUseCase;

describe("BuscarGradeHorariosUseCase", () => {
  beforeEach(() => {
    repo = new InMemoryAlocacoesRepository();
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
    sut = new BuscarGradeHorariosUseCase(repo, periodosRepository);
  });

  it("deve organizar alocações por dia e ordenar por horário de início (inclui variações com acento)", async () => {
    const turmaA = "turma-A";
    const turmaB = "turma-B";

    // Segunda-feira com dois horários fora de ordem
    await repo.createWithCustomData({
      id_turma: turmaA,
      disciplina: {
        id: "disc-1",
        nome: "Matemática",
        codigo: "MAT",
        carga_horaria: 60,
        carga_horaria_atual: 0,
        total_aulas: 30,
        aulas_ministradas: 0,
        tipo_de_sala: "AULA",
        data_inicio: null,
        data_fim_prevista: null,
        data_fim_real: null,
        periodo_letivo: "2024.1",
        horario_consolidado: null,
        id_curso: "curso-1",
        semestre: 1,
        obrigatoria: true,
      },
      horario: {
        id: "h-2",
        codigo: "M2",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T08:50:00"),
        horario_fim: new Date("2024-01-01T09:40:00"),
      },
    });
    await repo.createWithCustomData({
      id_turma: turmaA,
      disciplina: {
        id: "disc-1",
        nome: "Matemática",
        codigo: "MAT",
        carga_horaria: 60,
        carga_horaria_atual: 0,
        total_aulas: 30,
        aulas_ministradas: 0,
        tipo_de_sala: "AULA",
        data_inicio: null,
        data_fim_prevista: null,
        data_fim_real: null,
        periodo_letivo: "2024.1",
        horario_consolidado: null,
        id_curso: "curso-1",
        semestre: 1,
        obrigatoria: true,
      },
      horario: {
        id: "h-1",
        codigo: "M1",
        dia_semana: "Segunda-feira",
        horario_inicio: new Date("2024-01-01T08:00:00"),
        horario_fim: new Date("2024-01-01T08:50:00"),
      },
    });

    // Terça com acento na grafia
    await repo.createWithCustomData({
      id_turma: turmaA,
      disciplina: {
        id: "disc-2",
        nome: "Física",
        codigo: "FIS",
        carga_horaria: 60,
        carga_horaria_atual: 0,
        total_aulas: 30,
        aulas_ministradas: 0,
        tipo_de_sala: "AULA",
        data_inicio: null,
        data_fim_prevista: null,
        data_fim_real: null,
        periodo_letivo: "2024.1",
        horario_consolidado: null,
        id_curso: "curso-1",
        semestre: 1,
        obrigatoria: true,
      },
      horario: {
        id: "h-3",
        codigo: "M1",
        dia_semana: "Terça",
        horario_inicio: new Date("2024-01-02T07:00:00"),
        horario_fim: new Date("2024-01-02T07:50:00"),
      },
    });

    // Registro de outra turma para garantir filtro por turma
    await repo.createWithCustomData({
      id_turma: turmaB,
      disciplina: {
        id: "disc-3",
        nome: "Química",
        codigo: "QUI",
        carga_horaria: 60,
        carga_horaria_atual: 0,
        total_aulas: 30,
        aulas_ministradas: 0,
        tipo_de_sala: "AULA",
        data_inicio: null,
        data_fim_prevista: null,
        data_fim_real: null,
        periodo_letivo: "2024.1",
        horario_consolidado: null,
        id_curso: "curso-1",
        semestre: 1,
        obrigatoria: true,
      },
      horario: {
        id: "h-4",
        codigo: "M1",
        dia_semana: "QUARTA",
        horario_inicio: new Date("2024-01-03T07:00:00"),
        horario_fim: new Date("2024-01-03T07:50:00"),
      },
    });

    // Inserir um registro quebrado (sem horario) para testar robustez
    const broken = await repo.createWithCustomData({ id_turma: turmaA });
    // remove o horario intencionalmente
    const idx = repo.items.findIndex((i) => i.id === broken.id);
    // ts-expect-error: simulando registro inválido
    (repo.items[idx] as any).horario = undefined;

    const { gradeHorarios } = await sut.execute({ id_turma: turmaA });

    expect(gradeHorarios.segunda).toHaveLength(2);
    expect(gradeHorarios.terca).toHaveLength(1);
    expect(gradeHorarios.quarta).toHaveLength(0); // filtro por turma

    // Ordenação por horário de início
    const h0 = new Date(String(gradeHorarios.segunda[0]!.horario_inicio));
    const h1 = new Date(String(gradeHorarios.segunda[1]!.horario_inicio));
    expect(h0.getHours()).toBe(8);
    expect(h0.getMinutes()).toBe(0);
    expect(h1.getMinutes()).toBe(50);

    // Registro sem horário deve ser ignorado
    const total =
      gradeHorarios.segunda.length +
      gradeHorarios.terca.length +
      gradeHorarios.quarta.length +
      gradeHorarios.quinta.length +
      gradeHorarios.sexta.length +
      gradeHorarios.sabado.length;
    expect(total).toBe(3);

    // Mapeamento de disciplina: cargaHorariaTotal vem de carga_horaria
    expect(gradeHorarios.segunda[0]!.disciplina.cargaHorariaTotal).toBe(60);
  });
});
