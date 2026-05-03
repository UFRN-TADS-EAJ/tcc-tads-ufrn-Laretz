import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPrediosRepository } from '@/repositories/in-memory/in-memory-predios-repository';
import { InMemorySalasRepository } from '@/repositories/in-memory/in-memory-salas-repository';
import { BuscarPredioUseCase } from '@/use-cases/predio/buscar-predio';
import { RecursoNaoEncontradoError } from '@/use-cases/errors/recurso-nao-encontrado';

let salasRepository: InMemorySalasRepository;
let prediosRepository: InMemoryPrediosRepository;
let sut: BuscarPredioUseCase;

describe('Buscar Prédio Use Case', () => {
  beforeEach(() => {
    salasRepository = new InMemorySalasRepository();
    prediosRepository = new InMemoryPrediosRepository(salasRepository);
    sut = new BuscarPredioUseCase(prediosRepository);
  });

  it('deve ser possível buscar um prédio por id (com salas)', async () => {
    const predio = await prediosRepository.create({
      codigo: 'PRED-01',
      nome: 'Prédio Central',
      descricao: 'Prédio principal',
    });

    await salasRepository.create({
      nome: 'Sala 101',
      capacidade: 40,
      tipo: 'Sala',
      computadores: 0,
      predio: { connect: { id: predio.id } },
    } as any);

    const { predio: found } = await sut.execute({ id: predio.id });

    expect(found.id).toEqual(predio.id);
    expect(found.codigo).toEqual('PRED-01');
    expect(Array.isArray(found.salas)).toBe(true);
    expect(found.salas).toHaveLength(1);
    expect(found.salas[0]).toEqual(
      expect.objectContaining({
        nome: 'Sala 101',
        capacidade: 40,
      }),
    );
  });

  it('não deve ser possível buscar um prédio inexistente', async () => {
    await expect(() => sut.execute({ id: 'predio-inexistente' })).rejects.toBeInstanceOf(
      RecursoNaoEncontradoError,
    );
  });
});
