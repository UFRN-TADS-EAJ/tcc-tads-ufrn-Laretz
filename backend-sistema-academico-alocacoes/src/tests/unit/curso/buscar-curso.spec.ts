import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryCursosRepository } from '@/repositories/in-memory/in-memory-cursos-repository';
import { BuscarCursoUseCase } from '@/use-cases/curso/buscar-curso';
import { RecursoNaoEncontradoError } from '@/use-cases/errors/recurso-nao-encontrado';

let cursosRepository: InMemoryCursosRepository;
let sut: BuscarCursoUseCase;

describe('Buscar Curso Use Case', () => {
  beforeEach(() => {
    cursosRepository = new InMemoryCursosRepository();
    sut = new BuscarCursoUseCase(cursosRepository);
  });

  it('deve ser possível buscar um curso pelo ID', async () => {
    const cursoCriado = await cursosRepository.create({
      codigo: 'CC001',
      nome: 'Ciência da Computação',
      turno: 'MATUTINO',
      duracao_semestres: 8,
      ativo: true,
    });

    const { curso } = await sut.execute({
      id: cursoCriado.id,
    });

    expect(curso.id).toEqual(cursoCriado.id);
    expect(curso.codigo).toEqual('CC001');
    expect(curso.nome).toEqual('Ciência da Computação');
    expect(curso.turno).toEqual('MATUTINO');
    expect(curso.duracao_semestres).toEqual(8);
    expect(curso.ativo).toEqual(true);
  });

  it('não deve ser possível buscar um curso com ID inexistente', async () => {
    await expect(() =>
      sut.execute({
        id: 'id-inexistente',
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it('deve retornar o curso correto quando existem múltiplos cursos', async () => {
    const curso1 = await cursosRepository.create({
      codigo: 'CC001',
      nome: 'Ciência da Computação',
      turno: 'MATUTINO',
      duracao_semestres: 8,
      ativo: true,
    });

    const curso2 = await cursosRepository.create({
      codigo: 'ES001',
      nome: 'Engenharia de Software',
      turno: 'NOTURNO',
      duracao_semestres: 8,
      ativo: true,
    });

    const { curso } = await sut.execute({
      id: curso2.id,
    });

    expect(curso.id).toEqual(curso2.id);
    expect(curso.codigo).toEqual('ES001');
    expect(curso.nome).toEqual('Engenharia de Software');
  });
});