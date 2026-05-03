import { expect, describe, it, beforeEach } from "vitest";
import { CriarAlocacaoUseCase } from "@/use-cases/alocacao/criar-alocacao";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { InMemoryTurmasRepository } from "@/repositories/in-memory/in-memory-turmas-repository";
import { InMemoryCursoDisciplinaRepository } from "@/repositories/in-memory/in-memory-curso-disciplina-repository";
import { InMemoryHorariosRepository } from "@/repositories/in-memory/in-memory-horarios-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let alocacoesRepository: InMemoryAlocacoesRepository;
let disciplinasRepository: InMemoryDisciplinasRepository;
let turmasRepository: InMemoryTurmasRepository;
let cursoDisciplinaRepository: InMemoryCursoDisciplinaRepository;
let horariosRepository: InMemoryHorariosRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: CriarAlocacaoUseCase;

describe("Criar Alocação Use Case", () => {
  beforeEach(() => {
    alocacoesRepository = new InMemoryAlocacoesRepository();
    disciplinasRepository = new InMemoryDisciplinasRepository();
    turmasRepository = new InMemoryTurmasRepository();
    cursoDisciplinaRepository = new InMemoryCursoDisciplinaRepository();
    horariosRepository = new InMemoryHorariosRepository();
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
    sut = new CriarAlocacaoUseCase(
      alocacoesRepository,
      disciplinasRepository,
      turmasRepository,
      cursoDisciplinaRepository,
      horariosRepository,
      periodosRepository,
    );
  });

  it("deve ser possível criar uma nova alocação", async () => {
    // Curso e turma
    const cursoId = "curso-1";
    const turma = await turmasRepository.create({
      nome: "Turma 1",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      ativa: true,
      curso: { connect: { id: cursoId } },
    } as any);

    // Criar disciplina e vínculo curso-disciplina
    await disciplinasRepository.create({
      id: "disciplina-1",
      nome: "Matemática",
      carga_horaria: 80,
      curso: { connect: { id: cursoId } },
    });
    const cursoDisciplina = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-1",
    });

    const { alocacoes } = await sut.execute({
      id_user: "user-1",
      id_curso_disciplina: cursoDisciplina.id,
      id_turma: turma.id,
      id_sala: "sala-1",
      id_horarios: ["horario-1"],
    });

    expect(alocacoes).toHaveLength(1);
    expect(alocacoes[0]!.id).toEqual(expect.any(String));
    expect(alocacoes[0]!.id_user).toEqual("user-1");
    expect(alocacoes[0]!.id_curso_disciplina).toEqual(cursoDisciplina.id);
    expect(alocacoes[0]!.id_disciplina).toEqual("disciplina-1");
    expect(alocacoes[0]!.id_turma).toEqual(turma.id);
    expect(alocacoes[0]!.id_sala).toEqual("sala-1");
  });

  it("deve ser possível criar múltiplas alocações para diferentes horários", async () => {
    const cursoId = "curso-1";
    const turma = await turmasRepository.create({
      nome: "Turma 1",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      ativa: true,
      curso: { connect: { id: cursoId } },
    } as any);

    await disciplinasRepository.create({
      id: "disciplina-1",
      nome: "Matemática",
      carga_horaria: 80,
      curso: { connect: { id: cursoId } },
    });
    const cursoDisciplina = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-1",
    });

    const { alocacoes } = await sut.execute({
      id_user: "user-1",
      id_curso_disciplina: cursoDisciplina.id,
      id_turma: turma.id,
      id_sala: "sala-1",
      id_horarios: ["horario-1", "horario-2", "horario-3"],
    });

    expect(alocacoes).toHaveLength(3);
    expect(alocacoes[0]!.id_user).toEqual("user-1");
    expect(alocacoes[1]!.id_user).toEqual("user-1");
    expect(alocacoes[2]!.id_user).toEqual("user-1");
  });

  it("não deve ser possível criar alocação quando professor já tem alocação no mesmo horário", async () => {
    const cursoId = "curso-1";
    const turma = await turmasRepository.create({
      nome: "Turma 2",
      num_alunos: 30,
      periodo: 1,
      turno: "MATUTINO",
      semestre: 1,
      ativa: true,
      curso: { connect: { id: cursoId } },
    } as any);

    await disciplinasRepository.create({
      id: "disciplina-2",
      nome: "Física",
      carga_horaria: 60,
      curso: { connect: { id: cursoId } },
    });
    const cursoDisciplina2 = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-2",
    });

    // Criar uma alocação existente
    await alocacoesRepository.createWithCustomData({
      id: "alocacao-1",
      id_user: "user-1",
      id_disciplina: "disciplina-1",
      id_curso_disciplina: cursoDisciplina2.id,
      id_turma: turma.id,
      id_sala: "sala-1",
      id_horario: "horario-1",
    });

    await expect(() =>
      sut.execute({
        id_user: "user-1",
        id_curso_disciplina: cursoDisciplina2.id,
        id_turma: turma.id,
        id_sala: "sala-2",
        id_horarios: ["horario-1"],
      }),
    ).rejects.toThrow("Professor já possui alocação no horário horario-1");
  });

  it("não deve ser possível criar alocação quando sala já está ocupada no mesmo horário", async () => {
    const cursoId = "curso-1";
    const turma = await turmasRepository.create({
      nome: "Turma 2",
      num_alunos: 30,
      periodo: 1,
      turno: "MATUTINO",
      semestre: 1,
      ativa: true,
      curso: { connect: { id: cursoId } },
    } as any);
    await disciplinasRepository.create({
      id: "disciplina-2",
      nome: "Física",
      carga_horaria: 60,
      curso: { connect: { id: cursoId } },
    });
    const cursoDisciplina2 = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-2",
    });

    await alocacoesRepository.createWithCustomData({
      id: "alocacao-1",
      id_user: "user-1",
      id_disciplina: "disciplina-1",
      id_curso_disciplina: cursoDisciplina2.id,
      id_turma: turma.id,
      id_sala: "sala-1",
      id_horario: "horario-1",
    });

    await expect(() =>
      sut.execute({
        id_user: "user-2",
        id_curso_disciplina: cursoDisciplina2.id,
        id_turma: turma.id,
        id_sala: "sala-1",
        id_horarios: ["horario-1"],
      }),
    ).rejects.toThrow("Sala já está ocupada no horário horario-1");
  });

  it("deve ser possível criar alocação com mesmo professor em horários diferentes", async () => {
    const cursoId = "curso-1";
    const turma = await turmasRepository.create({
      nome: "Turma 2",
      num_alunos: 30,
      periodo: 1,
      turno: "MATUTINO",
      semestre: 1,
      ativa: true,
      curso: { connect: { id: cursoId } },
    } as any);

    await disciplinasRepository.create({
      id: "disciplina-1",
      nome: "Matemática",
      carga_horaria: 80,
      curso: { connect: { id: cursoId } },
    });
    await disciplinasRepository.create({
      id: "disciplina-2",
      nome: "Física",
      carga_horaria: 60,
      curso: { connect: { id: cursoId } },
    });

    const cursoDisciplina1 = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-1",
    });
    const cursoDisciplina2 = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-2",
    });

    await alocacoesRepository.createWithCustomData({
      id: "alocacao-1",
      id_user: "user-1",
      id_disciplina: "disciplina-1",
      id_curso_disciplina: cursoDisciplina1.id,
      id_turma: turma.id,
      id_sala: "sala-1",
      id_horario: "horario-1",
    });

    const { alocacoes } = await sut.execute({
      id_user: "user-1",
      id_curso_disciplina: cursoDisciplina2.id,
      id_turma: turma.id,
      id_sala: "sala-2",
      id_horarios: ["horario-2"],
    });

    expect(alocacoes).toHaveLength(1);
    expect(alocacoes[0]!.id_user).toEqual("user-1");
  });

  it("não deve ser possível criar alocação quando turma já tem horário ocupado", async () => {
    const cursoId = "curso-1";
    const turma1 = await turmasRepository.create({
      nome: "Turma 1",
      num_alunos: 30,
      periodo: 1,
      turno: "MATUTINO",
      semestre: 1,
      ativa: true,
      curso: { connect: { id: cursoId } },
    } as any);
    const turma2 = await turmasRepository.create({
      nome: "Turma 2",
      num_alunos: 30,
      periodo: 1,
      turno: "MATUTINO",
      semestre: 1,
      ativa: true,
      curso: { connect: { id: cursoId } },
    } as any);

    await disciplinasRepository.create({
      id: "disciplina-2",
      nome: "Física",
      carga_horaria: 60,
      curso: { connect: { id: cursoId } },
    });
    const cursoDisciplina2 = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-2",
    });

    await alocacoesRepository.createWithCustomData({
      id: "alocacao-1",
      id_user: "user-1",
      id_disciplina: "disciplina-1",
      id_curso_disciplina: cursoDisciplina2.id,
      id_turma: turma1.id,
      id_sala: "sala-1",
      id_horario: "horario-1",
    });

    await expect(() =>
      sut.execute({
        id_user: "user-2",
        id_curso_disciplina: cursoDisciplina2.id,
        id_turma: turma1.id,
        id_sala: "sala-2",
        id_horarios: ["horario-1"],
      }),
    ).rejects.toThrow("Turma já possui alocação no horário horario-1");
  });
});
