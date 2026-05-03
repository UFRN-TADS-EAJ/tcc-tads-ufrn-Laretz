import { expect, describe, it, beforeEach } from "vitest";
import { BuscarGradeHorariosTurmaUseCase } from "@/use-cases/turma/buscar-grade-horarios-turma";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let alocacoesRepository: InMemoryAlocacoesRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: BuscarGradeHorariosTurmaUseCase;

describe("Buscar Grade Horários Turma Use Case", () => {
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
    sut = new BuscarGradeHorariosTurmaUseCase(
      alocacoesRepository,
      periodosRepository,
    );
  });

  it("deve retornar grade vazia quando turma não possui alocações", async () => {
    const turmaId = "turma-sem-alocacoes";

    const {
      turmaId: resultTurmaId,
      grade,
      resumo,
    } = await sut.execute({
      turmaId,
    });

    expect(resultTurmaId).toEqual(turmaId);
    expect(resumo.totalAlocacoes).toEqual(0);
    expect(resumo.disciplinasUnicas).toEqual(0);
    expect(resumo.professoresUnicos).toEqual(0);

    // Verificar se a grade está inicializada com valores null
    expect(grade.SEGUNDA?.M1).toBeNull();
    expect(grade.TERCA?.T1).toBeNull();
    expect(grade.QUARTA?.N1).toBeNull();
  });

  it("deve retornar grade com alocações quando turma possui alocações", async () => {
    const turmaId = "turma-com-alocacoes";
    const professorId = "professor-1";
    const disciplinaId = "disciplina-1";
    const salaId = "sala-1";
    const horarioId = "horario-1";

    // Criar uma alocação
    await alocacoesRepository.createWithCustomData({
      id_turma: turmaId,
      id_user: professorId,
      id_disciplina: disciplinaId,
      id_sala: salaId,
      id_horario: horarioId,
      user: {
        id: professorId,
        nome: "Prof. João Silva",
        email: "joao@teste.com",
        especializacao: "Matemática",
      } as any,
      disciplina: {
        id: disciplinaId,
        nome: "Cálculo I",
        codigo: "CALC001",
        carga_horaria: 80,
      } as any,
      sala: {
        id: salaId,
        nome: "Sala 101",
        numero: "101",
        capacidade: 50,
        tipo: "AULA",
        computadores: 0,
        predioId: "predio-01",
        ativa: true,
        predio: {
          id: "predio-01",
          nome: "Bloco A",
        } as any,
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
      turmaId: resultTurmaId,
      grade,
      resumo,
    } = await sut.execute({
      turmaId,
    });

    expect(resultTurmaId).toEqual(turmaId);
    expect(resumo.totalAlocacoes).toEqual(1);
    expect(resumo.disciplinasUnicas).toEqual(1);
    expect(resumo.professoresUnicos).toEqual(1);

    // Verificar se a alocação está na posição correta da grade
    const alocacao = grade.SEGUNDA?.M1;
    expect(alocacao).not.toBeNull();
    expect(alocacao?.disciplina.nome).toEqual("Cálculo I");
    expect(alocacao?.professor.nome).toEqual("Prof. João Silva");
    expect(alocacao?.sala.nome).toEqual("Sala 101");
    expect(alocacao?.horario.codigo).toEqual("M1");
  });

  it("deve retornar grade com múltiplas alocações em diferentes horários", async () => {
    const turmaId = "turma-multiplas-alocacoes";

    // Criar primeira alocação - Segunda M1
    await alocacoesRepository.createWithCustomData({
      id_turma: turmaId,
      id_user: "professor-1",
      id_disciplina: "disciplina-1",
      id_sala: "sala-1",
      id_horario: "horario-1",
      user: {
        id: "professor-1",
        nome: "Prof. João",
        email: "joao@teste.com",
        especializacao: null,
      } as any,
      disciplina: {
        id: "disciplina-1",
        nome: "Matemática",
        codigo: "MAT001",
        carga_horaria: 60,
      } as any,
      horario: {
        id: "horario-1",
        codigo: "M1",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T08:00:00"),
        horario_fim: new Date("2024-01-01T09:00:00"),
      },
    });

    // Criar segunda alocação - Terça T2
    await alocacoesRepository.createWithCustomData({
      id_turma: turmaId,
      id_user: "professor-2",
      id_disciplina: "disciplina-2",
      id_sala: "sala-2",
      id_horario: "horario-2",
      user: {
        id: "professor-2",
        nome: "Prof. Maria",
        email: "maria@teste.com",
        especializacao: null,
      } as any,
      disciplina: {
        id: "disciplina-2",
        nome: "Física",
        codigo: "FIS001",
        carga_horaria: 80,
      } as any,
      horario: {
        id: "horario-2",
        codigo: "T2",
        dia_semana: "TERCA",
        horario_inicio: new Date("2024-01-01T14:00:00"),
        horario_fim: new Date("2024-01-01T15:00:00"),
      },
    });

    const { grade, resumo } = await sut.execute({ turmaId });

    expect(resumo.totalAlocacoes).toEqual(2);
    expect(resumo.disciplinasUnicas).toEqual(2);
    expect(resumo.professoresUnicos).toEqual(2);

    // Verificar primeira alocação
    expect(grade.SEGUNDA?.M1?.disciplina.nome).toEqual("Matemática");
    expect(grade.SEGUNDA?.M1?.professor.nome).toEqual("Prof. João");

    // Verificar segunda alocação
    expect(grade.TERCA?.T2?.disciplina.nome).toEqual("Física");
    expect(grade.TERCA?.T2?.professor.nome).toEqual("Prof. Maria");

    // Verificar que outros horários estão vazios
    expect(grade.SEGUNDA?.M2).toBeNull();
    expect(grade.TERCA?.T1).toBeNull();
  });

  it("deve calcular corretamente o resumo com múltiplas alocações do mesmo professor", async () => {
    const turmaId = "turma-mesmo-professor";
    const professorId = "professor-1";

    // Criar duas alocações com o mesmo professor
    await alocacoesRepository.createWithCustomData({
      id_turma: turmaId,
      id_user: professorId,
      id_disciplina: "disciplina-1",
      user: {
        id: professorId,
        nome: "Prof. João",
        email: "joao@teste.com",
        especializacao: null,
      } as any,
      disciplina: {
        id: "disciplina-1",
        nome: "Matemática",
        codigo: "MAT001",
        carga_horaria: 60,
      } as any,
      horario: {
        id: "horario-1",
        codigo: "M1",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T08:00:00"),
        horario_fim: new Date("2024-01-01T09:00:00"),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_turma: turmaId,
      id_user: professorId,
      id_disciplina: "disciplina-2",
      user: {
        id: professorId,
        nome: "Prof. João",
        email: "joao@teste.com",
        especializacao: null,
      } as any,
      disciplina: {
        id: "disciplina-2",
        nome: "Física",
        codigo: "FIS001",
        carga_horaria: 80,
      } as any,
      horario: {
        id: "horario-2",
        codigo: "M2",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T09:00:00"),
        horario_fim: new Date("2024-01-01T10:00:00"),
      },
    });

    const { resumo } = await sut.execute({ turmaId });

    expect(resumo.totalAlocacoes).toEqual(2);
    expect(resumo.disciplinasUnicas).toEqual(2); // Duas disciplinas diferentes
    expect(resumo.professoresUnicos).toEqual(1); // Mesmo professor
  });

  it("deve calcular corretamente o resumo com múltiplas alocações da mesma disciplina", async () => {
    const turmaId = "turma-mesma-disciplina";
    const disciplinaId = "disciplina-1";

    // Criar duas alocações com a mesma disciplina
    await alocacoesRepository.createWithCustomData({
      id_turma: turmaId,
      id_user: "professor-1",
      id_disciplina: disciplinaId,
      user: {
        id: "professor-1",
        nome: "Prof. João",
        email: "joao@teste.com",
        especializacao: null,
      } as any,
      disciplina: {
        id: disciplinaId,
        nome: "Matemática",
        codigo: "MAT001",
        carga_horaria: 60,
      } as any,
      horario: {
        id: "horario-1",
        codigo: "M1",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T08:00:00"),
        horario_fim: new Date("2024-01-01T09:00:00"),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_turma: turmaId,
      id_user: "professor-2",
      id_disciplina: disciplinaId,
      user: {
        id: "professor-2",
        nome: "Prof. Maria",
        email: "maria@teste.com",
        especializacao: null,
      } as any,
      disciplina: {
        id: disciplinaId,
        nome: "Matemática",
        codigo: "MAT001",
        carga_horaria: 60,
      } as any,
      horario: {
        id: "horario-2",
        codigo: "M2",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T09:00:00"),
        horario_fim: new Date("2024-01-01T10:00:00"),
      },
    });

    const { resumo } = await sut.execute({ turmaId });

    expect(resumo.totalAlocacoes).toEqual(2);
    expect(resumo.disciplinasUnicas).toEqual(1); // Mesma disciplina
    expect(resumo.professoresUnicos).toEqual(2); // Dois professores diferentes
  });

  it("deve ignorar alocações de outras turmas", async () => {
    const turmaId = "turma-alvo";
    const outraTurmaId = "outra-turma";

    // Criar alocação para a turma alvo
    await alocacoesRepository.createWithCustomData({
      id_turma: turmaId,
      disciplina: {
        id: "disciplina-1",
        nome: "Matemática",
        codigo: "MAT001",
        carga_horaria: 60,
      } as any,
      horario: {
        id: "horario-1",
        codigo: "M1",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T08:00:00"),
        horario_fim: new Date("2024-01-01T09:00:00"),
      },
    });

    // Criar alocação para outra turma
    await alocacoesRepository.createWithCustomData({
      id_turma: outraTurmaId,
      disciplina: {
        id: "disciplina-2",
        nome: "Física",
        codigo: "FIS001",
        carga_horaria: 80,
      } as any,
      horario: {
        id: "horario-2",
        codigo: "M2",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("2024-01-01T09:00:00"),
        horario_fim: new Date("2024-01-01T10:00:00"),
      },
    });

    const { grade, resumo } = await sut.execute({ turmaId });

    expect(resumo.totalAlocacoes).toEqual(1);
    expect(grade.SEGUNDA?.M1?.disciplina.nome).toEqual("Matemática");
    expect(grade.SEGUNDA?.M2).toBeNull(); // Não deve incluir alocação de outra turma
  });
});
