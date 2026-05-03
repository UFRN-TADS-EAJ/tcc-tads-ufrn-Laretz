import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPrediosRepository } from '@/repositories/in-memory/in-memory-predios-repository';
import { CriarPredioUseCase } from '@/use-cases/predio/criar-predio';
import { CodigoJaExisteError } from '@/use-cases/errors/codigo-ja-existe';

let prediosRepository: InMemoryPrediosRepository;
let sut: CriarPredioUseCase;

describe('Criar Prédio Use Case', () => {
  beforeEach(() => {
    prediosRepository = new InMemoryPrediosRepository();
    sut = new CriarPredioUseCase(prediosRepository);
  });

  it('deve ser possível criar um prédio', async () => {
    const { predio } = await sut.execute({
      codigo: 'PRED-01',
      nome: 'Prédio Central',
      descricao: 'Prédio principal',
    });

    expect(predio.id).toEqual(expect.any(String));
    expect(predio.codigo).toEqual('PRED-01');
    expect(predio.nome).toEqual('Prédio Central');
    expect(predio.descricao).toEqual('Prédio principal');
  });

  it('não deve ser possível criar um prédio com código já existente', async () => {
    await sut.execute({
      codigo: 'PRED-01',
      nome: 'Prédio Central',
      descricao: 'Prédio principal',
    });

    await expect(() =>
      sut.execute({
        codigo: 'PRED-01',
        nome: 'Outro Prédio',
        descricao: 'Outro',
      }),
    ).rejects.toBeInstanceOf(CodigoJaExisteError);
  });
});
