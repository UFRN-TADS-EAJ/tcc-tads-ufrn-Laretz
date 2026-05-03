import { describe, it, expect, beforeEach } from 'vitest';
import { GerarHorarioConsolidadoUseCase } from '@/use-cases/disciplina/gerar-horario-consolidado';
import { InMemoryAlocacoesRepository } from '@/repositories/in-memory/in-memory-alocacoes-repository';

let alocacoesRepository: InMemoryAlocacoesRepository;
let sut: GerarHorarioConsolidadoUseCase;

describe('Gerar Horário Consolidado Use Case', () => {
  beforeEach(() => {
    alocacoesRepository = new InMemoryAlocacoesRepository();
    sut = new GerarHorarioConsolidadoUseCase(alocacoesRepository);
  });

  it('deve gerar horário consolidado para disciplina com aulas sequenciais no mesmo dia', async () => {
    const disciplinaId = 'disciplina-01';

    // Criar alocações para segunda M1 e M2
    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-01',
        codigo: 'M1',
        dia_semana: 'SEGUNDA',
        horario_inicio: new Date('2024-01-01T07:00:00'),
        horario_fim: new Date('2024-01-01T07:50:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-02',
        codigo: 'M2',
        dia_semana: 'SEGUNDA',
        horario_inicio: new Date('2024-01-01T07:50:00'),
        horario_fim: new Date('2024-01-01T08:40:00'),
      },
    });

    const { horarioConsolidado } = await sut.execute({
      disciplinaId,
      periodoId: "periodo-1",
    });

    expect(horarioConsolidado).toBe('2M12');
  });

  it('deve gerar horário consolidado para disciplina com aulas em dias diferentes', async () => {
    const disciplinaId = 'disciplina-02';

    // Criar alocações para segunda M1, M2 e terça M1, M2
    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-01',
        codigo: 'M1',
        dia_semana: 'SEGUNDA',
        horario_inicio: new Date('2024-01-01T07:00:00'),
        horario_fim: new Date('2024-01-01T07:50:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-02',
        codigo: 'M2',
        dia_semana: 'SEGUNDA',
        horario_inicio: new Date('2024-01-01T07:50:00'),
        horario_fim: new Date('2024-01-01T08:40:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-03',
        codigo: 'M1',
        dia_semana: 'TERCA',
        horario_inicio: new Date('2024-01-01T07:00:00'),
        horario_fim: new Date('2024-01-01T07:50:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-04',
        codigo: 'M2',
        dia_semana: 'TERCA',
        horario_inicio: new Date('2024-01-01T07:50:00'),
        horario_fim: new Date('2024-01-01T08:40:00'),
      },
    });

    const { horarioConsolidado } = await sut.execute({
      disciplinaId,
      periodoId: "periodo-1",
    });

    expect(horarioConsolidado).toBe('23M12');
  });

  it('deve gerar horário consolidado para disciplina com aulas não sequenciais', async () => {
    const disciplinaId = 'disciplina-03';

    // Criar alocações para segunda M1, M2 e quarta M2, M3 (não sequencial)
    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-01',
        codigo: 'M1',
        dia_semana: 'SEGUNDA',
        horario_inicio: new Date('2024-01-01T07:00:00'),
        horario_fim: new Date('2024-01-01T07:50:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-02',
        codigo: 'M2',
        dia_semana: 'SEGUNDA',
        horario_inicio: new Date('2024-01-01T07:50:00'),
        horario_fim: new Date('2024-01-01T08:40:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-03',
        codigo: 'M2',
        dia_semana: 'QUARTA',
        horario_inicio: new Date('2024-01-01T07:50:00'),
        horario_fim: new Date('2024-01-01T08:40:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-04',
        codigo: 'M3',
        dia_semana: 'QUARTA',
        horario_inicio: new Date('2024-01-01T08:55:00'),
        horario_fim: new Date('2024-01-01T09:45:00'),
      },
    });

    const { horarioConsolidado } = await sut.execute({
      disciplinaId,
      periodoId: "periodo-1",
    });

    expect(horarioConsolidado).toBe('2M12, 4M23');
  });

  it('deve gerar horário consolidado para disciplina com turnos diferentes', async () => {
    const disciplinaId = 'disciplina-04';

    // Criar alocações para segunda T1, T2 e sexta T3, T4
    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-01',
        codigo: 'T1',
        dia_semana: 'SEGUNDA',
        horario_inicio: new Date('2024-01-01T13:00:00'),
        horario_fim: new Date('2024-01-01T13:50:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-02',
        codigo: 'T2',
        dia_semana: 'SEGUNDA',
        horario_inicio: new Date('2024-01-01T13:50:00'),
        horario_fim: new Date('2024-01-01T14:40:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-03',
        codigo: 'T3',
        dia_semana: 'SEXTA',
        horario_inicio: new Date('2024-01-01T14:55:00'),
        horario_fim: new Date('2024-01-01T15:45:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-04',
        codigo: 'T4',
        dia_semana: 'SEXTA',
        horario_inicio: new Date('2024-01-01T15:45:00'),
        horario_fim: new Date('2024-01-01T16:35:00'),
      },
    });

    const { horarioConsolidado } = await sut.execute({
      disciplinaId,
      periodoId: "periodo-1",
    });

    expect(horarioConsolidado).toBe('2T12, 6T34');
  });

  it('deve retornar string vazia para disciplina sem alocações', async () => {
    const disciplinaId = 'disciplina-sem-alocacoes';

    const { horarioConsolidado } = await sut.execute({
      disciplinaId,
      periodoId: "periodo-1",
    });

    expect(horarioConsolidado).toBe('');
  });

  it('deve gerar horário consolidado para aulas isoladas', async () => {
    const disciplinaId = 'disciplina-05';

    // Criar alocações isoladas: segunda M1, quarta M3
    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-01',
        codigo: 'M1',
        dia_semana: 'SEGUNDA',
        horario_inicio: new Date('2024-01-01T07:00:00'),
        horario_fim: new Date('2024-01-01T07:50:00'),
      },
    });

    await alocacoesRepository.createWithCustomData({
      id_disciplina: disciplinaId,
      horario: {
        id: 'horario-02',
        codigo: 'M3',
        dia_semana: 'QUARTA',
        horario_inicio: new Date('2024-01-01T08:55:00'),
        horario_fim: new Date('2024-01-01T09:45:00'),
      },
    });

    const { horarioConsolidado } = await sut.execute({
      disciplinaId,
      periodoId: "periodo-1",
    });

    expect(horarioConsolidado).toBe('2M1, 4M3');
  });
});
