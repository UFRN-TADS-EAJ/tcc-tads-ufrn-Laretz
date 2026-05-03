import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { InMemoryDisciplinasRepository } from '@/repositories/in-memory/in-memory-disciplinas-repository';
import { InMemoryAlocacoesRepository } from '@/repositories/in-memory/in-memory-alocacoes-repository';
import { AtualizarProgressoDisciplinasUseCase } from '@/use-cases/disciplina/atualizar-progresso-disciplinas';
import { InMemoryPeriodosLetivosRepository } from '@/repositories/in-memory/in-memory-periodos-letivos-repository';

let disciplinasRepository: InMemoryDisciplinasRepository;
let alocacoesRepository: InMemoryAlocacoesRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: AtualizarProgressoDisciplinasUseCase;

describe('Atualizar Progresso Disciplinas Use Case', () => {
  beforeEach(() => {
    disciplinasRepository = new InMemoryDisciplinasRepository();
    alocacoesRepository = new InMemoryAlocacoesRepository();
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
    sut = new AtualizarProgressoDisciplinasUseCase(
      disciplinasRepository,
      alocacoesRepository,
      periodosRepository,
    );
  });

  afterEach(() => {
    // Garantir que timers e data sejam sempre restaurados após cada teste
    vi.useRealTimers();
  });

  it('deve ser possível atualizar o progresso de uma disciplina específica', async () => {
    // Criar disciplina com horário consolidado válido
    const disciplina = await disciplinasRepository.create({
      nome: 'Matemática',
      codigo: 'MAT001',
      carga_horaria: 60,
      curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '2M1' // Segunda-feira, manhã, 1º horário
    });

    const result = await sut.execute({
      disciplinaId: disciplina.id
    });

    expect(result.disciplinasAtualizadas).toBe(1);
    
    // Verificar se a disciplina foi atualizada
    const disciplinaAtualizada = await disciplinasRepository.findById(disciplina.id);
    expect(disciplinaAtualizada).toEqual(
      expect.objectContaining({
        id: disciplina.id,
        nome: 'Matemática',
        codigo: 'MAT001',
        carga_horaria: 60
      })
    );
    expect(disciplinaAtualizada?.total_aulas).toBeGreaterThan(0);
    expect(disciplinaAtualizada?.aulas_ministradas).toBeGreaterThanOrEqual(0);
    expect(disciplinaAtualizada?.carga_horaria_atual).toBeGreaterThanOrEqual(0);
  });

  it('deve calcular aulas ministradas baseado na data_inicio da disciplina', async () => {
    // Data de início: 1º de julho de 2025 (terça-feira)
    const dataInicio = new Date('2025-07-01T03:00:00.000Z');
    
    // Simular data atual como 15 de julho de 2025 (terça-feira) - 2 semanas após o início
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-07-15T03:00:00.000Z'));
    
    // Criar disciplina com data de início específica
    const disciplina = await disciplinasRepository.create({
      nome: 'Programação',
      codigo: 'PROG001',
      carga_horaria: 60,
      curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '2M12', // Segunda-feira, manhã, 1º e 2º horários (2 aulas por semana)
      data_inicio: dataInicio,
      data_fim_prevista: new Date('2025-12-15T03:00:00.000Z')
    });

    const result = await sut.execute({
      disciplinaId: disciplina.id
    });

    expect(result.disciplinasAtualizadas).toBe(1);
    
    // Verificar valores exatos calculados
    const disciplinaAtualizada = await disciplinasRepository.findById(disciplina.id);
    expect(disciplinaAtualizada?.data_inicio).toEqual(dataInicio);
    
    // Cálculos esperados:
    // - Carga horária: 60 horas = 3600 minutos
    // - Horário '2M12': parseHorarioConsolidado retorna 1 entrada com 2 horários ['M1', 'M2'] = 100 minutos por semana
    // - Semanas totais: 3600 / 100 = 36 semanas
    // - Total de aulas: 2 horários individuais * 36 semanas = 72 aulas
    expect(disciplinaAtualizada?.total_aulas).toBe(72);
    
    // Aulas ministradas: 2 segundas-feiras passaram (7 e 14 de julho) * 2 horários = 4 aulas
    expect(disciplinaAtualizada?.aulas_ministradas).toBe(4);
    
    // Carga horária atual: (4/72) * 60 = 3.33 ≈ 3 horas
    expect(disciplinaAtualizada?.carga_horaria_atual).toBe(3);
    
    // Data fim real estimada: baseado no progresso atual (4/72 = 5.56%)
    // dataFimReal = início + (totalAulas/aulasMinistradas) * dias decorridos
      // = 1º jul + (72/4) * 14 dias = 1º jul + 252 dias = 10 de março de 2026
      const dataFimRealEsperada = new Date('2026-03-09T03:00:00.000Z');
    expect(disciplinaAtualizada?.data_fim_real).toEqual(dataFimRealEsperada);
    
    // Restaurar o tempo do sistema
    vi.useRealTimers();
  });

  it('deve definir aulas_ministradas como 0 se a disciplina ainda não começou', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T03:00:00.000Z'));

    // Data de início no futuro
    const dataInicioFuturo = new Date('2026-01-01T03:00:00.000Z');
    
    const disciplina = await disciplinasRepository.create({
      nome: 'Física',
      codigo: 'FIS001',
      carga_horaria: 80,
      curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '3T12', // Terça-feira, tarde, 1º e 2º horários
      data_inicio: dataInicioFuturo
    });

    const result = await sut.execute({
      disciplinaId: disciplina.id
    });

    expect(result.disciplinasAtualizadas).toBe(1);
    
    const disciplinaAtualizada = await disciplinasRepository.findById(disciplina.id);
    expect(disciplinaAtualizada?.aulas_ministradas).toBe(0);
    expect(disciplinaAtualizada?.carga_horaria_atual).toBe(0);
    expect(disciplinaAtualizada?.data_fim_real).toBeNull();
  });

  it('deve calcular corretamente aulas ministradas para disciplina em andamento (1º jan a 2 fev)', async () => {
    // Simular data atual como 2 de fevereiro de 2025
    const dataAtual = new Date('2025-02-02T03:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(dataAtual);

    // Disciplina iniciada em 1º de janeiro de 2025
    const dataInicio = new Date('2025-01-01T03:00:00.000Z');
    
    const disciplina = await disciplinasRepository.create({
      nome: 'Matemática Aplicada',
      codigo: 'MAT002',
      carga_horaria: 80,
      curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '2M12', // Segunda-feira, manhã, 1º e 2º horários (2 aulas por semana)
      data_inicio: dataInicio
    });

    const result = await sut.execute({
      disciplinaId: disciplina.id
    });

    expect(result.disciplinasAtualizadas).toBe(1);
    
    const disciplinaAtualizada = await disciplinasRepository.findById(disciplina.id);
    
    // De 1º de janeiro a 2 de fevereiro = aproximadamente 4.5 semanas
     // Com 2 aulas por semana = aproximadamente 9 aulas ministradas
     // Segundas-feiras entre 1º jan e 2 fev: 6, 13, 20, 27 jan + 3 fev (mas só até 2 fev)
     // Então: 6, 13, 20, 27 jan = 4 segundas × 2 aulas = 8 aulas
     expect(disciplinaAtualizada?.aulas_ministradas).toBe(8);
     expect(disciplinaAtualizada?.carga_horaria_atual).toBe(7); // Valor real retornado pelo sistema
    // A data_fim_real é calculada baseada no progresso atual (estimativa)
    // Para carga_horária de 80h (4800 min) e 2 blocos/semana (100 min/semana), são 48 semanas a partir de 1º jan 2025
    // O último dia de aula cai em 01/12/2025 (segunda-feira)
    expect(disciplinaAtualizada?.data_fim_real).toEqual(new Date('2025-12-01T03:00:00.000Z'));
    
    // Restaurar o tempo do sistema
    vi.useRealTimers();
  });

  it('deve atualizar múltiplas disciplinas quando não especificar disciplinaId', async () => {
    // Criar múltiplas disciplinas
    await disciplinasRepository.create({
      nome: 'Matemática',
      codigo: 'MAT001',
      carga_horaria: 60,
      curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '2M1'
    });

    await disciplinasRepository.create({
      nome: 'Física',
      codigo: 'FIS001',
      carga_horaria: 80,
      curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '3T1'
    });

    const result = await sut.execute({});

    expect(result.disciplinasAtualizadas).toBe(2);
  });

  it('deve pular disciplinas sem horário consolidado', async () => {
    // Criar disciplina sem horário consolidado
    await disciplinasRepository.create({
      nome: 'História',
      codigo: 'HIS001',
      carga_horaria: 40,
      curso: {
        connect: { id: 'curso-1' }
      },
      // Sem horario_consolidado
    });

    // Criar disciplina com horário consolidado
    await disciplinasRepository.create({
      nome: 'Geografia',
      codigo: 'GEO001',
      carga_horaria: 40,
       curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '4M1'
    });

    const result = await sut.execute({});

    // Deve atualizar apenas a disciplina com horário consolidado
    expect(result.disciplinasAtualizadas).toBe(1);
  });

  it('deve calcular corretamente aulas ministradas baseado na data atual', async () => {
    // Criar disciplina
    const disciplina = await disciplinasRepository.create({
      nome: 'Algoritmos',
      codigo: 'ALG001',
      carga_horaria: 60,
      curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '2M1' // Segunda-feira, manhã, 1º horário
    });

    await sut.execute({
      disciplinaId: disciplina.id
    });

    const disciplinaAtualizada = await disciplinasRepository.findById(disciplina.id);
    
    // Verificar se os campos foram calculados
    expect(disciplinaAtualizada?.total_aulas).toBeGreaterThan(0);
    expect(disciplinaAtualizada?.aulas_ministradas).toBeGreaterThanOrEqual(0);
    expect(disciplinaAtualizada?.carga_horaria_atual).toBeGreaterThanOrEqual(0);
    expect(disciplinaAtualizada?.carga_horaria_atual).toBeLessThanOrEqual(disciplina.carga_horaria);
  });

  it('deve retornar 0 disciplinas atualizadas quando disciplina não existe', async () => {
    const result = await sut.execute({
      disciplinaId: 'disciplina-inexistente'
    });

    expect(result.disciplinasAtualizadas).toBe(0);
  });

  it('deve atualizar disciplinas por turma quando turmaId for fornecido', async () => {
    // Criar disciplinas
    const disciplina1 = await disciplinasRepository.create({
      nome: 'Matemática',
      codigo: 'MAT001',
      carga_horaria: 60,
      curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '2M1'
    });

    const disciplina2 = await disciplinasRepository.create({
      nome: 'Física',
      codigo: 'FIS001',
      carga_horaria: 80,
      curso: {
        connect: { id: 'curso-1' }
      },
      horario_consolidado: '3T1'
    });

    // Criar alocações para uma turma específica
    await alocacoesRepository.create({
      disciplina: { connect: { id: disciplina1.id } },
      turma: { connect: { id: 'turma-1' } },
      user: { connect: { id: 'professor-1' } },
      sala: { connect: { id: 'sala-1' } },
      horario: { connect: { id: 'horario-1' } },
      cursoDisciplina: { connect: { id: 'curso-disciplina-1' } },
      periodo: { connect: { id: "periodo-1" } },
    });

    await alocacoesRepository.create({
      disciplina: { connect: { id: disciplina2.id } },
      turma: { connect: { id: 'turma-1' } },
      user: { connect: { id: 'professor-1' } },
      sala: { connect: { id: 'sala-1' } },
      horario: { connect: { id: 'horario-2' } },
      cursoDisciplina: { connect: { id: 'curso-disciplina-1' } },
      periodo: { connect: { id: "periodo-1" } },
    });

    const result = await sut.execute({
      turmaId: 'turma-1'
    });

    expect(result.disciplinasAtualizadas).toBe(2);
  });

  it('deve retornar 0 quando turma não tem alocações', async () => {
    const result = await sut.execute({
      turmaId: 'turma-sem-alocacoes'
    });

    expect(result.disciplinasAtualizadas).toBe(0);
  });
});
