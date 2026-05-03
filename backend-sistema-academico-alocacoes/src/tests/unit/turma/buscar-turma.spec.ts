import { describe, it, expect, beforeEach } from 'vitest';
import { BuscarTurmaUseCase } from '@/use-cases/turma/buscar-turma';
import { InMemoryTurmasRepository } from '@/repositories/in-memory/in-memory-turmas-repository';
import { RecursoNaoEncontradoError } from '@/use-cases/errors/recurso-nao-encontrado';

let turmasRepository: InMemoryTurmasRepository;
let sut: BuscarTurmaUseCase;

describe('Buscar Turma Use Case', () => {
  beforeEach(() => {
    turmasRepository = new InMemoryTurmasRepository();
    sut = new BuscarTurmaUseCase(turmasRepository);
  });

  it('deve ser possível buscar uma turma pelo ID', async () => {
    const turmaCriada = await turmasRepository.create({
      nome: 'Turma A',
      num_alunos: 30,
      turno: 'MATUTINO',
      semestre: 1,
      curso: {
        connect: { id: 'curso-id-teste' }
      }
    });

    const { turma } = await sut.execute({
      id: turmaCriada.id,
    });

    expect(turma.id).toEqual(turmaCriada.id);
    expect(turma.nome).toEqual('Turma A');
    expect(turma.num_alunos).toEqual(30);
    expect(turma.semestre).toEqual(1);
    expect(turma.turno).toEqual('MATUTINO');
  });

  it('deve lançar erro quando turma não for encontrada', async () => {
    await expect(() =>
      sut.execute({
        id: 'id-inexistente',
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it('deve retornar a turma correta quando existem múltiplas turmas', async () => {
    const turma1 = await turmasRepository.create({
      nome: 'Turma A',
      num_alunos: 30,
      turno: 'MATUTINO',
      semestre: 1,
      curso: {
        connect: { id: 'curso-id-teste' }
      }
    });

    const turma2 = await turmasRepository.create({
      nome: 'Turma B',
      num_alunos: 25,
      turno: 'VESPERTINO',
      semestre: 2,
      curso: {
        connect: { id: 'curso-id-teste' }
      }
    });

    const { turma } = await sut.execute({
      id: turma2.id,
    });

    expect(turma.id).toEqual(turma2.id);
    expect(turma.nome).toEqual('Turma B');
    expect(turma.num_alunos).toEqual(25);
    expect(turma.semestre).toEqual(2);
    expect(turma.turno).toEqual('VESPERTINO');
  });
});