import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPrediosRepository } from '@/repositories/in-memory/in-memory-predios-repository';
import { InMemorySalasRepository } from '@/repositories/in-memory/in-memory-salas-repository';
import { ExcluirPredioUseCase } from '@/use-cases/predio/excluir-predio';
import { PossuiDependenciasError } from '@/use-cases/errors/possui-dependencias';
import { RecursoNaoEncontradoError } from '@/use-cases/errors/recurso-nao-encontrado';

let salasRepository: InMemorySalasRepository;
let prediosRepository: InMemoryPrediosRepository;
let sut: ExcluirPredioUseCase;

describe('Excluir Prédio Use Case', () => {
  beforeEach(() => {
    salasRepository = new InMemorySalasRepository();
    prediosRepository = new InMemoryPrediosRepository(salasRepository);
    sut = new ExcluirPredioUseCase(prediosRepository);
  });

  it('deve ser possível excluir um prédio sem salas', async () => {
    const predio = await prediosRepository.create({
      codigo: 'PRED-01',
      nome: 'Prédio Central',
      descricao: null,
    });

    await sut.execute({ id: predio.id });

    expect(prediosRepository.items).toHaveLength(0);
  });

  it('não deve ser possível excluir um prédio que possui salas', async () => {
    const predio = await prediosRepository.create({
      codigo: 'PRED-01',
      nome: 'Prédio Central',
      descricao: null,
    });

    await salasRepository.create({
      nome: 'Sala 101',
      capacidade: 40,
      tipo: 'Sala',
      computadores: 0,
      predio: { connect: { id: predio.id } },
    } as any);

    await expect(() => sut.execute({ id: predio.id })).rejects.toBeInstanceOf(PossuiDependenciasError);
  });

  it('não deve ser possível excluir um prédio inexistente', async () => {
    await expect(() => sut.execute({ id: 'predio-inexistente' })).rejects.toBeInstanceOf(
      RecursoNaoEncontradoError,
    );
  });
});
