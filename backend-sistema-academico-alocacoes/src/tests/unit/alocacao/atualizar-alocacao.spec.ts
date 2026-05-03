import { expect, describe, it, beforeEach } from "vitest";
import { AtualizarAlocacaoUseCase } from "@/use-cases/alocacao/atualizar-alocacao";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { InMemoryTurmasRepository } from "@/repositories/in-memory/in-memory-turmas-repository";
import { InMemoryCursoDisciplinaRepository } from "@/repositories/in-memory/in-memory-curso-disciplina-repository";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let alocacoesRepository: InMemoryAlocacoesRepository;
let disciplinasRepository: InMemoryDisciplinasRepository;
let turmasRepository: InMemoryTurmasRepository;
let cursoDisciplinaRepository: InMemoryCursoDisciplinaRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: AtualizarAlocacaoUseCase;

describe("Atualizar Alocação Use Case", () => {
  beforeEach(() => {
    alocacoesRepository = new InMemoryAlocacoesRepository();
    disciplinasRepository = new InMemoryDisciplinasRepository();
    turmasRepository = new InMemoryTurmasRepository();
    cursoDisciplinaRepository = new InMemoryCursoDisciplinaRepository();
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
    sut = new AtualizarAlocacaoUseCase(
      alocacoesRepository,
      disciplinasRepository,
      turmasRepository,
      cursoDisciplinaRepository,
      periodosRepository,
    );
  });

  it("deve ser possível atualizar uma alocação", async () => {
    const cursoId1 = "curso-1";
    const cursoId2 = "curso-2";
    await turmasRepository.create({
      id: "turma-1",
      nome: "Turma 1",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      ativa: true,
      curso: { connect: { id: cursoId1 } },
    } as any);
    await turmasRepository.create({
      id: "turma-2",
      nome: "Turma 2",
      num_alunos: 30,
      turno: "MATUTINO",
      semestre: 1,
      ativa: true,
      curso: { connect: { id: cursoId2 } },
    } as any);

    await disciplinasRepository.create({
      id: "disciplina-1",
      nome: "Matemática",
      carga_horaria: 80,
      curso: { connect: { id: cursoId1 } },
    });
    await disciplinasRepository.create({
      id: "disciplina-2",
      nome: "Física",
      carga_horaria: 60,
      curso: { connect: { id: cursoId2 } },
    });

    const cd1 = await cursoDisciplinaRepository.create({
      id_curso: cursoId1,
      id_disciplina: "disciplina-1",
    });
    const cd2 = await cursoDisciplinaRepository.create({
      id_curso: cursoId2,
      id_disciplina: "disciplina-2",
    });

    const alocacaoCriada = await alocacoesRepository.createWithCustomData({
      id: "alocacao-1",
      id_user: "user-1",
      id_disciplina: "disciplina-1",
      id_curso_disciplina: cd1.id,
      id_turma: "turma-1",
      id_sala: "sala-1",
      id_horario: "horario-1",
    });

    const { alocacao } = await sut.execute({
      id: alocacaoCriada.id,
      id_user: "user-2",
      id_curso_disciplina: cd2.id,
      id_turma: "turma-2",
      id_sala: "sala-2",
      id_horario: "horario-2",
    });

    expect(alocacao.id).toEqual(alocacaoCriada.id);
    expect(alocacao.id_user).toEqual("user-2");
    expect(alocacao.id_curso_disciplina).toEqual(cd2.id);
    expect(alocacao.id_disciplina).toEqual("disciplina-2");
    expect(alocacao.id_turma).toEqual("turma-2");
    expect(alocacao.id_sala).toEqual("sala-2");
    expect(alocacao.id_horario).toEqual("horario-2");
  });

  it("deve ser possível atualizar apenas o usuário da alocação", async () => {
    const cursoId = "curso-1";
    await turmasRepository.create({
      id: "turma-1",
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
    const cd1 = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-1",
    });

    const alocacaoCriada = await alocacoesRepository.createWithCustomData({
      id: "alocacao-1",
      id_user: "user-1",
      id_disciplina: "disciplina-1",
      id_curso_disciplina: cd1.id,
      id_turma: "turma-1",
      id_sala: "sala-1",
      id_horario: "horario-1",
    });

    const { alocacao } = await sut.execute({
      id: alocacaoCriada.id,
      id_user: "user-2",
      id_curso_disciplina: undefined,
      id_turma: undefined,
      id_sala: undefined,
      id_horario: undefined,
    });

    expect(alocacao.id_user).toEqual("user-2");
    expect(alocacao.id_curso_disciplina).toEqual(cd1.id);
    expect(alocacao.id_disciplina).toEqual("disciplina-1"); // Deve manter o valor original
    expect(alocacao.id_turma).toEqual("turma-1"); // Deve manter o valor original
    expect(alocacao.id_sala).toEqual("sala-1"); // Deve manter o valor original
    expect(alocacao.id_horario).toEqual("horario-1"); // Deve manter o valor original
  });

  it("deve ser possível atualizar apenas a sala da alocação", async () => {
    const cursoId = "curso-1";
    await turmasRepository.create({
      id: "turma-1",
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
    const cd1 = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-1",
    });

    const alocacaoCriada = await alocacoesRepository.createWithCustomData({
      id: "alocacao-1",
      id_user: "user-1",
      id_disciplina: "disciplina-1",
      id_curso_disciplina: cd1.id,
      id_turma: "turma-1",
      id_sala: "sala-1",
      id_horario: "horario-1",
    });

    const { alocacao } = await sut.execute({
      id: alocacaoCriada.id,
      id_user: undefined,
      id_curso_disciplina: undefined,
      id_turma: undefined,
      id_sala: "sala-2",
      id_horario: undefined,
    });

    expect(alocacao.id_user).toEqual("user-1"); // Deve manter o valor original
    expect(alocacao.id_curso_disciplina).toEqual(cd1.id);
    expect(alocacao.id_disciplina).toEqual("disciplina-1"); // Deve manter o valor original
    expect(alocacao.id_turma).toEqual("turma-1"); // Deve manter o valor original
    expect(alocacao.id_sala).toEqual("sala-2");
    expect(alocacao.id_horario).toEqual("horario-1"); // Deve manter o valor original
  });

  it("deve ser possível atualizar apenas o horário da alocação", async () => {
    const cursoId = "curso-1";
    await turmasRepository.create({
      id: "turma-1",
      nome: "Turma 1",
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
    const cd1 = await cursoDisciplinaRepository.create({
      id_curso: cursoId,
      id_disciplina: "disciplina-1",
    });

    const alocacaoCriada = await alocacoesRepository.createWithCustomData({
      id: "alocacao-1",
      id_user: "user-1",
      id_disciplina: "disciplina-1",
      id_curso_disciplina: cd1.id,
      id_turma: "turma-1",
      id_sala: "sala-1",
      id_horario: "horario-1",
    });

    const { alocacao } = await sut.execute({
      id: alocacaoCriada.id,
      id_user: undefined,
      id_curso_disciplina: undefined,
      id_turma: undefined,
      id_sala: undefined,
      id_horario: "horario-2",
    });

    expect(alocacao.id_user).toEqual("user-1"); // Deve manter o valor original
    expect(alocacao.id_curso_disciplina).toEqual(cd1.id);
    expect(alocacao.id_disciplina).toEqual("disciplina-1"); // Deve manter o valor original
    expect(alocacao.id_turma).toEqual("turma-1"); // Deve manter o valor original
    expect(alocacao.id_sala).toEqual("sala-1"); // Deve manter o valor original
    expect(alocacao.id_horario).toEqual("horario-2");
  });

  it("não deve ser possível atualizar alocação com id inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: "id-inexistente",
        id_user: "user-1",
        id_curso_disciplina: undefined,
        id_turma: undefined,
        id_sala: undefined,
        id_horario: undefined,
      }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});
