import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPrediosRepository } from '@/repositories/in-memory/in-memory-predios-repository';
import { InMemorySalasRepository } from '@/repositories/in-memory/in-memory-salas-repository';
import { BuscarPrediosUseCase } from '@/use-cases/predio/buscar-predios';

let salasRepository: InMemorySalasRepository;
let prediosRepository: InMemoryPrediosRepository;
let sut: BuscarPrediosUseCase;

describe('Buscar Prédios Use Case', () => {
  beforeEach(() => {
    salasRepository = new InMemorySalasRepository();
    prediosRepository = new InMemoryPrediosRepository(salasRepository);
    sut = new BuscarPrediosUseCase(prediosRepository);
  });

  it('deve listar prédios e incluir apenas salas ativas', async () => {
    const p1 = await prediosRepository.create({
      codigo: 'PRED-A',
      nome: 'Alpha',
      descricao: 'desc alpha',
    });
    const p2 = await prediosRepository.create({
      codigo: 'PRED-B',
      nome: 'Beta',
      descricao: 'desc beta',
    });

    const s1 = await salasRepository.create({
      nome: 'Sala A1',
      capacidade: 30,
      tipo: 'Sala',
      computadores: 0,
      predio: { connect: { id: p1.id } },
    } as any);

    await salasRepository.create({
      nome: 'Sala A2',
      capacidade: 30,
      tipo: 'Sala',
      computadores: 0,
      predio: { connect: { id: p1.id } },
    } as any);

    await salasRepository.update(s1.id, { ativa: false } as any);

    await salasRepository.create({
      nome: 'Sala B1',
      capacidade: 40,
      tipo: 'Lab',
      computadores: 40,
      predio: { connect: { id: p2.id } },
    } as any);

    const { predios } = await sut.execute();

    const byId = new Map(predios.map((p: any) => [p.id, p] as const));
    expect(byId.get(p1.id)?.salas).toHaveLength(1);
    expect(byId.get(p2.id)?.salas).toHaveLength(1);
  });

  it('deve filtrar por busca', async () => {
    await prediosRepository.create({
      codigo: 'PRED-A',
      nome: 'Alpha',
      descricao: 'desc alpha',
    });
    await prediosRepository.create({
      codigo: 'PRED-B',
      nome: 'Beta',
      descricao: 'desc beta',
    });

    const { predios } = await sut.execute({ search: 'alpha' });
    expect(predios).toHaveLength(1);
    expect(predios[0]?.codigo).toBe('PRED-A');
  });

  it('deve ordenar por código desc', async () => {
    await prediosRepository.create({ codigo: 'PRED-01', nome: 'A', descricao: null });
    await prediosRepository.create({ codigo: 'PRED-02', nome: 'B', descricao: null });

    const { predios } = await sut.execute({ sortBy: 'codigo', sortOrder: 'desc' });
    expect(predios[0]?.codigo).toBe('PRED-02');
    expect(predios[1]?.codigo).toBe('PRED-01');
  });
});
