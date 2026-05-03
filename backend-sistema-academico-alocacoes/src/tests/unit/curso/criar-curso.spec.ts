import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryCursosRepository } from '@/repositories/in-memory/in-memory-cursos-repository';
import { CriarCursoUseCase } from '@/use-cases/curso/criar-curso';
import { CodigoJaExisteError } from '@/use-cases/errors/codigo-ja-existe';
import { DadosInvalidosError } from '@/use-cases/errors/dados-invalidos';

let cursosRepository: InMemoryCursosRepository;
let sut: CriarCursoUseCase;

describe('Criar Curso Use Case', () => {
  beforeEach(() => {
    cursosRepository = new InMemoryCursosRepository();
    sut = new CriarCursoUseCase(cursosRepository);
  });

  it('deve ser possível criar um curso', async () => {
    const { curso } = await sut.execute({
      codigo: 'CC001',
      nome: 'Ciência da Computação',
      turno: 'MATUTINO',
      duracao_semestres: 8,
    });

    expect(curso.id).toEqual(expect.any(String));
    expect(curso.codigo).toEqual('CC001');
    expect(curso.nome).toEqual('Ciência da Computação');
    expect(curso.turno).toEqual('MATUTINO');
    expect(curso.duracao_semestres).toEqual(8);
    expect(curso.ativo).toEqual(true);
  });

  it('não deve ser possível criar um curso com código já existente', async () => {
    await sut.execute({
      codigo: 'CC001',
      nome: 'Ciência da Computação',
      turno: 'MATUTINO',
      duracao_semestres: 8,
    });

    await expect(() =>
      sut.execute({
        codigo: 'CC001',
        nome: 'Engenharia de Software',
        turno: 'NOTURNO',
        duracao_semestres: 8,
      })
    ).rejects.toBeInstanceOf(CodigoJaExisteError);
  });

  it('deve criar cursos com diferentes turnos', async () => {
    const { curso: cursoMatutino } = await sut.execute({
      codigo: 'CC001',
      nome: 'Ciência da Computação',
      turno: 'MATUTINO',
      duracao_semestres: 8,
    });

    const { curso: cursoNoturno } = await sut.execute({
      codigo: 'CC002',
      nome: 'Engenharia de Software',
      turno: 'NOTURNO',
      duracao_semestres: 8,
    });

    expect(cursoMatutino.turno).toEqual('MATUTINO');
    expect(cursoNoturno.turno).toEqual('NOTURNO');
  });

  it('deve criar cursos com diferentes durações', async () => {
    const { curso: curso6Semestres } = await sut.execute({
      codigo: 'TEC001',
      nome: 'Tecnólogo em Sistemas',
      turno: 'NOTURNO',
      duracao_semestres: 6,
    });

    const { curso: curso8Semestres } = await sut.execute({
      codigo: 'BAC001',
      nome: 'Bacharelado em Computação',
      turno: 'INTEGRAL',
      duracao_semestres: 8,
    });

    expect(curso6Semestres.duracao_semestres).toEqual(6);
    expect(curso8Semestres.duracao_semestres).toEqual(8);
  });
});

// Erros — teste direto em contexto do módulo de Curso
describe('Erros — DadosInvalidosError (teste direto)', () => {
  it('deve instanciar e lançar DadosInvalidosError corretamente', async () => {
    const error = new DadosInvalidosError('curso');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('Error');
    expect(typeof error.message).toBe('string');

    try {
      throw error;
    } catch (e: any) {
      expect(e).toBeInstanceOf(DadosInvalidosError);
      expect(e.stack).toEqual(expect.any(String));
    }
  });
});
