import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { BuscarDisciplinasComProgressoUseCase } from "@/use-cases/disciplina/buscar-disciplinas-com-progresso";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let disciplinasRepository: InMemoryDisciplinasRepository;
let alocacoesRepository: InMemoryAlocacoesRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: BuscarDisciplinasComProgressoUseCase;

describe("Buscar Disciplinas Com Progresso Use Case", () => {
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
    sut = new BuscarDisciplinasComProgressoUseCase(
      disciplinasRepository,
      alocacoesRepository,
      periodosRepository,
    );
  });

  it("deve ser possível buscar disciplinas com progresso por turma", async () => {
    // Criar curso
    const curso = {
      id: "curso-1",
      nome: "Engenharia de Software",
      codigo: "ES",
    };

    // Usar turma fixa
    const turma = {
      id: "turma-a",
      nome: "Turma A",
      codigo: "ES-A",
    };

    // Criar disciplinas
    const disciplina1 = await disciplinasRepository.create({
      nome: "Matemática",
      codigo: "MAT001",
      carga_horaria: 60,
      curso: {
        connect: { id: curso.id },
      },
      horario_consolidado: "2M123",
      aulas_ministradas: 20,
      total_aulas: 30,
    });

    const disciplina2 = await disciplinasRepository.create({
      nome: "Física",
      codigo: "FIS001",
      carga_horaria: 80,
      curso: {
        connect: { id: curso.id },
      },
      horario_consolidado: "3T12",
      aulas_ministradas: 40,
      total_aulas: 40,
    });

    // Usar dados fixos
    const professor = {
      id: "professor-joao",
      nome: "Professor João",
      email: "joao@email.com",
    };

    const sala = {
      id: "sala-101",
      nome: "Sala 101",
      codigo: "S101",
    };

    const horario1 = {
      id: "horario-m1",
      dia_semana: "SEGUNDA",
      horario_inicio: "07:30:00",
      horario_fim: "08:20:00",
      codigo: "M1",
    };

    const horario2 = {
      id: "horario-t1",
      dia_semana: "TERCA",
      horario_inicio: "13:30:00",
      horario_fim: "14:20:00",
      codigo: "T1",
    };

    // Criar alocações
    await alocacoesRepository.create({
      disciplina: { connect: { id: disciplina1.id } },
      turma: { connect: { id: turma.id } },
      user: { connect: { id: professor.id } },
      sala: { connect: { id: sala.id } },
      horario: { connect: { id: horario1.id } },
      cursoDisciplina: { connect: { id: "curso-disciplina-1" } },
      periodo: { connect: { id: "periodo-1" } },
    });

    await alocacoesRepository.create({
      disciplina: { connect: { id: disciplina2.id } },
      turma: { connect: { id: turma.id } },
      user: { connect: { id: professor.id } },
      sala: { connect: { id: sala.id } },
      horario: { connect: { id: horario2.id } },
      cursoDisciplina: { connect: { id: "curso-disciplina-1" } },
      periodo: { connect: { id: "periodo-1" } },
    });

    const result = await sut.execute({
      turmaId: turma.id,
    });

    expect(result.disciplinas).toHaveLength(2);
    // Verificar se as disciplinas contêm os campos essenciais
    expect(result.disciplinas[0]).toEqual(
      expect.objectContaining({
        id: disciplina1.id,
        nome: "Matemática",
        codigo: "MAT001",
        aulas_ministradas: expect.any(Number),
        progresso_aulas: expect.any(Number),
        progresso_temporal: expect.any(Number),
        total_aulas: expect.any(Number),
        carga_horaria_atual: expect.any(Number),
      }),
    );

    expect(result.disciplinas[1]).toEqual(
      expect.objectContaining({
        id: disciplina2.id,
        nome: "Física",
        codigo: "FIS001",
        aulas_ministradas: expect.any(Number),
        progresso_aulas: expect.any(Number),
        progresso_temporal: expect.any(Number),
        total_aulas: expect.any(Number),
        carga_horaria_atual: expect.any(Number),
      }),
    );
  });

  it("deve retornar array vazio quando turma não tem disciplinas alocadas", async () => {
    // Usar turma sem alocações
    const turma = {
      id: "turma-sem-alocacoes",
      nome: "Turma B",
      codigo: "ES-B",
    };

    const result = await sut.execute({
      turmaId: turma.id,
    });

    expect(result.disciplinas).toHaveLength(0);
  });

  it("deve calcular progresso padrão quando disciplina não tem progresso definido", async () => {
    // Criar curso
    const curso = {
      id: "curso-1",
      nome: "Engenharia de Software",
      codigo: "ES",
    };

    // Usar turma fixa
    const turma = {
      id: "turma-1",
      nome: "Turma C",
      codigo: "ES-C",
    };

    // Criar disciplina sem progresso
    const disciplina = await disciplinasRepository.create({
      nome: "Algoritmos",
      codigo: "ALG001",
      carga_horaria: 60,
      curso: {
        connect: { id: curso.id },
      },
      horario_consolidado: "2M123",
      // Sem aulas_ministradas, aulas_restantes, percentual_concluido
    });

    // Usar professor fixo
    const professor = {
      id: "professor-1",
      nome: "Professor Maria",
      email: "maria@email.com",
    };

    // Usar sala e horário fixos
    const sala = {
      id: "sala-1",
      nome: "Sala 102",
      codigo: "S102",
    };

    const horario = {
      id: "horario-1",
      dia_semana: "SEGUNDA",
      horario_inicio: "07:30:00",
      horario_fim: "08:20:00",
      codigo: "M1",
    };

    // Criar alocação
    await alocacoesRepository.create({
      disciplina: { connect: { id: disciplina.id } },
      turma: { connect: { id: turma.id } },
      user: { connect: { id: professor.id } },
      sala: { connect: { id: sala.id } },
      horario: { connect: { id: horario.id } },
      cursoDisciplina: { connect: { id: "curso-disciplina-1" } },
      periodo: { connect: { id: "periodo-1" } },
    });

    const result = await sut.execute({
      turmaId: turma.id,
    });

    expect(result.disciplinas).toHaveLength(1);
    expect(result.disciplinas[0]).toEqual(
      expect.objectContaining({
        id: disciplina.id,
        nome: "Algoritmos",
        codigo: "ALG001",
        carga_horaria: 60,
        horario_consolidado: "2M123",
        aulas_ministradas: expect.any(Number),
        progresso_aulas: expect.any(Number),
        progresso_temporal: expect.any(Number),
        total_aulas: expect.any(Number),
        carga_horaria_atual: expect.any(Number),
      }),
    );
  });

  it("deve filtrar disciplinas únicas mesmo com múltiplas alocações", async () => {
    // Criar curso
    const curso = {
      id: "curso-1",
      nome: "Engenharia de Software",
      codigo: "ES",
    };

    // Usar turma fixa
    const turma = {
      id: "turma-2",
      nome: "Turma D",
      codigo: "ES-D",
    };

    // Criar disciplina
    const disciplina = await disciplinasRepository.create({
      nome: "Programação",
      codigo: "PROG001",
      carga_horaria: 80,
      curso: {
        connect: { id: "curso-1" },
      },
      horario_consolidado: "24M123",
      aulas_ministradas: 30,
    });

    // Usar professor fixo
    const professor = {
      id: "professor-2",
      nome: "Professor Carlos",
      email: "carlos@email.com",
    };

    // Usar salas fixas
    const sala1 = {
      id: "sala-1",
      nome: "Sala 103",
      codigo: "S103",
    };

    const sala2 = {
      id: "sala-2",
      nome: "Lab 01",
      codigo: "L01",
    };

    // Usar horários fixos
    const horario1 = {
      id: "horario-1",
      dia_semana: "SEGUNDA",
      horario_inicio: "07:30:00",
      horario_fim: "08:20:00",
      codigo: "M1",
    };

    const horario2 = {
      id: "horario-2",
      dia_semana: "TERCA",
      horario_inicio: "07:30:00",
      horario_fim: "08:20:00",
      codigo: "M1",
    };

    // Criar múltiplas alocações para a mesma disciplina
    await alocacoesRepository.create({
      disciplina: { connect: { id: disciplina.id } },
      turma: { connect: { id: turma.id } },
      user: { connect: { id: professor.id } },
      sala: { connect: { id: sala1.id } },
      horario: { connect: { id: horario1.id } },
      cursoDisciplina: { connect: { id: "curso-disciplina-1" } },
      periodo: { connect: { id: "periodo-1" } },
    });

    await alocacoesRepository.create({
      disciplina: { connect: { id: disciplina.id } },
      turma: { connect: { id: turma.id } },
      user: { connect: { id: professor.id } },
      sala: { connect: { id: sala2.id } },
      horario: { connect: { id: horario2.id } },
      cursoDisciplina: { connect: { id: "curso-disciplina-1" } },
      periodo: { connect: { id: "periodo-1" } },
    });

    const result = await sut.execute({
      turmaId: turma.id,
    });

    // Deve retornar apenas uma disciplina, mesmo com múltiplas alocações
    expect(result.disciplinas).toHaveLength(1);
    expect(result.disciplinas[0]).toEqual(
      expect.objectContaining({
        id: disciplina.id,
        nome: "Programação",
        codigo: "PROG001",
      }),
    );
  });
});
