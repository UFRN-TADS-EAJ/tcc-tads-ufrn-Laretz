import { describe, it, expect, beforeEach } from "vitest";
import { BuscarGradeHorariosSalaUseCase } from "@/use-cases/sala/buscar-grade-horarios-sala";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let alocacoesRepository: InMemoryAlocacoesRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: BuscarGradeHorariosSalaUseCase;

describe("Buscar Grade Horários Sala Use Case", () => {
  beforeEach(() => {
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
    sut = new BuscarGradeHorariosSalaUseCase(
      alocacoesRepository,
      periodosRepository,
    );
  });

  it("deve retornar grade vazia quando sala não tem alocações", async () => {
    const salaId = "sala-01";

    const {
      salaId: returnedSalaId,
      grade,
      resumo,
    } = await sut.execute({
      salaId,
    });

    expect(returnedSalaId).toEqual(salaId);
    expect(grade.SEGUNDA).toBeDefined();
    expect(grade.SEGUNDA!.M1).toBeNull();
    expect(resumo.totalAlocacoes).toBe(0);
    expect(resumo.disciplinasUnicas).toBe(0);
    expect(resumo.professoresUnicos).toBe(0);
    expect(resumo.turmasUnicas).toBe(0);
  });

  it("deve retornar grade com alocações quando sala tem alocações", async () => {
    const salaId = "sala-01";
    const userId = "user-01";
    const disciplinaId = "disciplina-01";
    const turmaId = "turma-01";
    const horarioId = "horario-01";

    await alocacoesRepository.createWithCustomData({
      id: "alocacao-01",
      id_user: userId,
      id_disciplina: disciplinaId,
      id_turma: turmaId,
      id_sala: salaId,
      id_horario: horarioId,
      user: {
        id: userId,
        nome: "Professor Teste",
        email: "professor@teste.com",
        especializacao: null,
        senha: "senha123",
        role: "PROFESSOR",
        carga_horaria_max: null,
        preferencia: null,
      },
      disciplina: {
        id: disciplinaId,
        nome: "Matemática",
        codigo: "MAT001",
        carga_horaria: 60,
        carga_horaria_atual: 60,
        total_aulas: 0,
        aulas_ministradas: 0,
        tipo_de_sala: undefined,
        data_inicio: null,
        data_fim_prevista: null,
        data_fim_real: null,
        periodo_letivo: null,
        horario_consolidado: null,
        id_curso: "",
        semestre: 0,
        obrigatoria: false,
      },
      turma: {
        id: turmaId,
        nome: "Turma A",
        num_alunos: 30,
        turno: "MATUTINO",
        id_curso: "",
        ativa: false,
        semestre: 1,
      },
      sala: {
        id: salaId,
        nome: "Sala 101",
        numero: "101",
        capacidade: 40,
        tipo: "AULA",
        computadores: 0,
        predioId: "predio-01",
        ativa: true,
        predio: null,
      },
      horario: {
        id: horarioId,
        codigo: "M1",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T08:00:00"),
        horario_fim: new Date("2024-01-01T09:00:00"),
      },
    });

    const {
      salaId: returnedSalaId,
      grade,
      resumo,
    } = await sut.execute({ salaId });

    expect(returnedSalaId).toEqual(salaId);
    expect(grade.SEGUNDA!.M1).toBeDefined();
    expect(grade.SEGUNDA!.M1?.disciplina.nome).toBe("Matemática");
    expect(grade.SEGUNDA!.M1?.professor.nome).toBe("Professor Teste");
    expect(grade.SEGUNDA!.M1?.turma.nome).toBe("Turma A");
    expect(resumo.totalAlocacoes).toBe(1);
    expect(resumo.disciplinasUnicas).toBe(1);
    expect(resumo.professoresUnicos).toBe(1);
    expect(resumo.turmasUnicas).toBe(1);
  });

  it("deve retornar grade com múltiplas alocações em horários diferentes", async () => {
    const salaId = "sala-01";

    await alocacoesRepository.createWithCustomData({
      id: "alocacao-01",
      id_user: "user-01",
      id_disciplina: "disciplina-01",
      id_turma: "turma-01",
      id_sala: salaId,
      id_horario: "horario-01",
      user: {
        id: "user-01",
        nome: "Professor A",
        email: "professora@teste.com",
        especializacao: null,
        senha: "senha123",
        role: "PROFESSOR",
        carga_horaria_max: null,
        preferencia: null,
      },
      disciplina: {
        id: "disciplina-01",
        nome: "Matemática",
        codigo: "MAT001",
        carga_horaria: 60,
        carga_horaria_atual: 0,
        total_aulas: 0,
        aulas_ministradas: 0,
        tipo_de_sala: "AULA",
        data_inicio: null,
        data_fim_prevista: null,
        data_fim_real: null,
        periodo_letivo: null,
        horario_consolidado: null,
        id_curso: "",
        semestre: 1,
        obrigatoria: false,
      },
      turma: {
        id: "turma-01",
        nome: "Turma A",
        num_alunos: 30,
        semestre: 1,
        turno: "MATUTINO",
        id_curso: "",
        ativa: true,
      },
      sala: {
        id: salaId,
        nome: "Sala 101",
        numero: "101",
        computadores: 0,
        predioId: "predio-01",
        ativa: true,
        predio: null,
        capacidade: 40,
        tipo: "AULA",
      },
      horario: {
        id: "horario-01",
        codigo: "M1",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T08:00:00"),
        horario_fim: new Date("2024-01-01T09:00:00"),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id: "alocacao-02",
      id_user: "user-02",
      id_disciplina: "disciplina-02",
      id_turma: "turma-02",
      id_sala: salaId,
      id_horario: "horario-02",
      user: {
        id: "user-02",
        nome: "Professor B",
        email: "professorb@teste.com",
        especializacao: null,
        senha: "senha123",
        role: "PROFESSOR",
        carga_horaria_max: null,
        preferencia: null,
      },
      disciplina: {
        id: "disciplina-02",
        nome: "Física",
        codigo: "FIS001",
        carga_horaria: 80,
        carga_horaria_atual: 0,
        total_aulas: 0,
        aulas_ministradas: 0,
        tipo_de_sala: "AULA",
        data_inicio: null,
        data_fim_prevista: null,
        data_fim_real: null,
        periodo_letivo: null,
        horario_consolidado: null,
        id_curso: "",
        semestre: 0,
        obrigatoria: false,
      },
      turma: {
        id: "turma-02",
        nome: "Turma B",
        num_alunos: 25,
        semestre: 1,
        turno: "VESPERTINO",
        id_curso: "",
        ativa: true,
      },
      sala: {
        id: salaId,
        nome: "Sala 102",
        numero: "102",
        computadores: 5,
        predioId: "predio-01",
        ativa: true,
        predio: null,
        capacidade: 35,
        tipo: "AULA",
      },
      horario: {
        id: "horario-02",
        codigo: "T3",
        dia_semana: "TERCA",
        horario_inicio: new Date("2024-01-02T13:00:00"),
        horario_fim: new Date("2024-01-02T13:50:00"),
      },
    });

    const { grade, resumo } = await sut.execute({ salaId });

    expect(grade.SEGUNDA!.M1).not.toBeNull();
    expect(grade.TERCA!.T3).not.toBeNull();
    expect(resumo.totalAlocacoes).toBe(2);
    expect(resumo.disciplinasUnicas).toBe(2);
    expect(resumo.professoresUnicos).toBe(2);
    expect(resumo.turmasUnicas).toBe(2);
  });
});
