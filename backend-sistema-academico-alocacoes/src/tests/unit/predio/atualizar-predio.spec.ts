import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPrediosRepository } from '@/repositories/in-memory/in-memory-predios-repository';
import { InMemorySalasRepository } from '@/repositories/in-memory/in-memory-salas-repository';
import { AtualizarPredioUseCase } from '@/use-cases/predio/atualizar-predio';
import { CodigoJaExisteError } from '@/use-cases/errors/codigo-ja-existe';
import { RecursoNaoEncontradoError } from '@/use-cases/errors/recurso-nao-encontrado';

let salasRepository: InMemorySalasRepository;
let prediosRepository: InMemoryPrediosRepository;
let sut: AtualizarPredioUseCase;

describe('Atualizar Prédio Use Case', () => {
  beforeEach(() => {
    salasRepository = new InMemorySalasRepository();
    prediosRepository = new InMemoryPrediosRepository(salasRepository);
    sut = new AtualizarPredioUseCase(prediosRepository);
  });

  it('deve ser possível atualizar nome/código/descrição', async () => {
    const predio = await prediosRepository.create({
      codigo: 'PRED-01',
      nome: 'Prédio Central',
      descricao: 'desc',
    });

    const { predio: updated } = await sut.execute({
      id: predio.id,
      codigo: 'PRED-02',
      nome: 'Prédio Atualizado',
      descricao: 'nova desc',
    });

    expect(updated.id).toEqual(predio.id);
    expect(updated.codigo).toEqual('PRED-02');
    expect(updated.nome).toEqual('Prédio Atualizado');
    expect(updated.descricao).toEqual('nova desc');
  });

  it('não deve ser possível atualizar um prédio inexistente', async () => {
    await expect(() =>
      sut.execute({ id: 'predio-inexistente', nome: 'X' }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it('não deve permitir atualizar código para um já existente', async () => {
    const p1 = await prediosRepository.create({
      codigo: 'PRED-01',
      nome: 'Prédio 1',
      descricao: null,
    });
    await prediosRepository.create({
      codigo: 'PRED-02',
      nome: 'Prédio 2',
      descricao: null,
    });

    await expect(() =>
      sut.execute({ id: p1.id, codigo: 'PRED-02' }),
    ).rejects.toBeInstanceOf(CodigoJaExisteError);
  });
});
