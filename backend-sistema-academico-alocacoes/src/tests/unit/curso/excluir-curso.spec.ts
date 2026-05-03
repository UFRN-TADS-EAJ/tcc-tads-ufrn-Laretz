import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryCursosRepository } from '@/repositories/in-memory/in-memory-cursos-repository';
import { ExcluirCursoUseCase } from '@/use-cases/curso/excluir-curso';
import { RecursoNaoEncontradoError } from '@/use-cases/errors/recurso-nao-encontrado';

let cursosRepository: InMemoryCursosRepository;
let sut: ExcluirCursoUseCase;

describe('Excluir Curso Use Case', () => {
  beforeEach(() => {
    cursosRepository = new InMemoryCursosRepository();
    sut = new ExcluirCursoUseCase(cursosRepository);
  });

  it('deve ser possível excluir um curso existente', async () => {
    const cursoCriado = await cursosRepository.create({
      codigo: 'CC001',
      nome: 'Ciência da Computação',
      turno: 'MATUTINO',
      duracao_semestres: 8,
      ativo: true,
    });

    await sut.execute({
      id: cursoCriado.id,
    });

    // Verificar se o curso foi realmente excluído
    const cursoExcluido = await cursosRepository.findById(cursoCriado.id);
    expect(cursoExcluido).toBeNull();
  });

  it('não deve ser possível excluir um curso inexistente', async () => {
    await expect(() =>
      sut.execute({
        id: 'id-inexistente',
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it('deve excluir apenas o curso especificado', async () => {
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

    const curso3 = await cursosRepository.create({
      codigo: 'TEC001',
      nome: 'Tecnólogo em Sistemas',
      turno: 'VESPERTINO',
      duracao_semestres: 6,
      ativo: true,
    });

    // Excluir apenas o curso2
    await sut.execute({
      id: curso2.id,
    });

    // Verificar se apenas o curso2 foi excluído
    const curso1Ainda = await cursosRepository.findById(curso1.id);
    const curso2Excluido = await cursosRepository.findById(curso2.id);
    const curso3Ainda = await cursosRepository.findById(curso3.id);

    expect(curso1Ainda).not.toBeNull();
    expect(curso1Ainda?.codigo).toEqual('CC001');
    expect(curso2Excluido).toBeNull();
    expect(curso3Ainda).not.toBeNull();
    expect(curso3Ainda?.codigo).toEqual('TEC001');
  });

  it('deve permitir excluir múltiplos cursos sequencialmente', async () => {
    const curso1 = await cursosRepository.create({
      codigo: 'ADM001',
      nome: 'Administração',
      turno: 'NOTURNO',
      duracao_semestres: 8,
      ativo: true,
    });

    const curso2 = await cursosRepository.create({
      codigo: 'DIR001',
      nome: 'Direito',
      turno: 'MATUTINO',
      duracao_semestres: 10,
      ativo: true,
    });

    // Excluir o primeiro curso
    await sut.execute({
      id: curso1.id,
    });

    // Excluir o segundo curso
    await sut.execute({
      id: curso2.id,
    });

    // Verificar se ambos foram excluídos
    const curso1Excluido = await cursosRepository.findById(curso1.id);
    const curso2Excluido = await cursosRepository.findById(curso2.id);

    expect(curso1Excluido).toBeNull();
    expect(curso2Excluido).toBeNull();
  });

  it('não deve afetar outros cursos ao tentar excluir um curso inexistente', async () => {
    const cursoExistente = await cursosRepository.create({
      codigo: 'PSI001',
      nome: 'Psicologia',
      turno: 'INTEGRAL',
      duracao_semestres: 10,
      ativo: true,
    });

    // Tentar excluir um curso inexistente
    await expect(() =>
      sut.execute({
        id: 'id-inexistente',
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);

    // Verificar se o curso existente não foi afetado
    const cursoAinda = await cursosRepository.findById(cursoExistente.id);
    expect(cursoAinda).not.toBeNull();
    expect(cursoAinda?.codigo).toEqual('PSI001');
  });
});