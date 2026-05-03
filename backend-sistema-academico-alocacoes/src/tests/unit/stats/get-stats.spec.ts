import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GetStatsUseCase } from '@/use-cases/stats/get-stats';

// Mock do prisma
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      user: { count: vi.fn().mockResolvedValue(10) },
      curso: { count: vi.fn().mockResolvedValue(5) },
      turma: { count: vi.fn().mockResolvedValue(12) },
      disciplina: { count: vi.fn().mockResolvedValue(20) },
      sala: { count: vi.fn().mockResolvedValue(15) },
      horario: { count: vi.fn().mockResolvedValue(60) },
      alocacao: {
        count: vi.fn().mockResolvedValue(100),
        findMany: vi.fn().mockResolvedValue([
          { id_sala: 'sala-1' },
          { id_sala: 'sala-1' },
          { id_sala: 'sala-2' },
        ]),
      },
      reservaSala: { count: vi.fn().mockResolvedValue(7) },
    }
  };
});

describe('GetStatsUseCase', () => {
  let sut: GetStatsUseCase;

  beforeEach(() => {
    vi.useFakeTimers();
    // Fixar data em uma terça-feira (2024-01-02)
    vi.setSystemTime(new Date('2024-01-02T10:30:00Z'));
    sut = new GetStatsUseCase();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve retornar totais e métricas do dia corretamente', async () => {
    const result = await sut.execute();

    expect(result.totals.usuarios).toBe(10);
    expect(result.totals.cursos).toBe(5);
    expect(result.totals.turmas).toBe(12);
    expect(result.totals.disciplinas).toBe(20);
    expect(result.totals.salas).toBe(15);
    expect(result.totals.horarios).toBe(60);
    expect(result.totals.alocacoes).toBe(100);
    expect(result.totals.reservasAtivas).toBe(7);

    expect(result.hoje.dia_semana).toBe('TERCA');
    expect(result.hoje.alocacoesHoje).toBe(100);
    expect(result.hoje.reservasHojeAtivas).toBe(7);
    expect(result.hoje.salasOcupadasAgora).toBe(2); // únicas: sala-1, sala-2

    // timestamp ISO
    expect(() => new Date(result.timestamp)).not.toThrow();
  });
});