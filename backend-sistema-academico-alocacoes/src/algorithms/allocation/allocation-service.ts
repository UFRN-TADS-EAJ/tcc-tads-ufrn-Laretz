import { prisma } from '../../lib/prisma';
import { GeneticAlgorithm, GeneticAlgorithmParams, Cromossomo } from '../genetic/genetic-algorithm';
import { GeneticOperators } from '../genetic/genetic-operators';
import { constraintManager } from '../genetic/constraints';
import { env } from '../../env';

interface AllocationRequest {
  turmaId: string;
  params?: Partial<GeneticAlgorithmParams>;
}

interface AlocacaoData {
  disciplinaId: string;
  professorId: string;
  salaId: string;
  horarioId: string;
  horarioStr?: string;
}

interface AllocationResult {
  success: boolean;
  cromossomo?: Cromossomo;
  alocacoes?: AlocacaoData[];
  metrics?: {
    fitness: number;
    generations: number;
    executionTime: number;
    conflictsResolved: number;
  };
  error?: string;
  details?: unknown;
  turmaId?: string;
  fitness?: number;
  conflitos?: unknown;
  relatorio?: unknown;
  geracoes?: number;
  tempoExecucao?: number;
  melhorFitness?: number;
  convergencia?: boolean;
  gradeHorarios?: Record<string, AlocacaoData[]>;
}

interface AllocationReportMetrics {
  totalDisciplinas: number;
  conflitosIniciais: number;
  conflitosFinais: number;
  fitnessInicial: number;
  fitnessFinal: number;
  geracoesExecutadas: number;
  tempoExecucao: number;
  taxaSucesso: number;
}

interface AllocationStatus {
  turmaId: string;
  status: 'completed' | 'not_started' | 'in_progress' | 'error';
  totalAlocacoes: number;
  ultimaExecucao: Date | null;
}

export class AllocationService {
  private defaultParams: GeneticAlgorithmParams;

  constructor() {
    this.defaultParams = {
      populationSize: env.GA_POPULATION_SIZE,
      generations: env.GA_GENERATIONS,
      minGenerations: 100,
      patience: 50,
      fitnessTarget: 10000,
      mutationRate: env.GA_MUTATION_RATE,
      crossoverRate: env.GA_CROSSOVER_RATE,
      elitismRate: env.GA_ELITISM_RATE
    };
  }

  /**
   * Executa o algoritmo genético para alocar disciplinas de uma turma
   */
  public async execute(request: AllocationRequest): Promise<AllocationResult> {
    const result = await this.allocateSchedule(request);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    if (result.alocacoes) {
      await this.saveAllocations(request.turmaId, result.alocacoes);
    }

    return {
      success: true,
      turmaId: request.turmaId,
      alocacoes: result.alocacoes,
      fitness: result.cromossomo?.fitness,
      conflitos: 0, // TODO: calcular conflitos reais
      relatorio: await this.generateAllocationReport(request.turmaId),
      geracoes: result.metrics?.generations,
      tempoExecucao: result.metrics?.executionTime,
      melhorFitness: result.cromossomo?.fitness,
      convergencia: true // TODO: implementar lógica de convergência
    };
  }

  /**
   * Gera preview de alocações sem salvar no banco de dados
   */
  public async generatePreview(request: {
    turmaId: string;
    disciplinaIds: string[];
    params?: Partial<GeneticAlgorithmParams>;
  }): Promise<AllocationResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.allocateScheduleForPreview({
        turmaId: request.turmaId,
        disciplinaIds: request.disciplinaIds,
        params: request.params
      });
      
      if (!result.success) {
        console.error('❌ Falha no algoritmo genético:', result.error);
        return {
          success: false,
          error: result.error
        };
      }

      const gradeHorarios = await this.generateScheduleGrid(result.alocacoes || []);
      
      const finalResult = {
        success: true,
        turmaId: request.turmaId,
        alocacoes: result.alocacoes,
        fitness: result.cromossomo?.fitness,
        conflitos: await this.detectConflicts(result.alocacoes || []),
        geracoes: result.metrics?.generations,
        tempoExecucao: result.metrics?.executionTime,
        melhorFitness: result.cromossomo?.fitness,
        convergencia: true,
        gradeHorarios
      };
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ Erro durante geração de preview:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    } 
  }

  /**
   * Executa o algoritmo genético para alocar disciplinas de uma turma
   */
  public async allocateSchedule(request: AllocationRequest): Promise<AllocationResult> {
    const startTime = Date.now();
    
    try {
      const validation = await this.validateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Erro de validação desconhecido'
        };
      }

      const data = await this.fetchAllocationData(request.turmaId);
      if (!data) {
        return {
          success: false,
          error: 'Dados insuficientes para gerar alocação'
        };
      }

      const params = { ...this.defaultParams, ...request.params };
      
      const algorithm = new GeneticAlgorithm(
        params,
        data.turma,
        data.professores,
        data.salas,
        data.horarios
      );
      
      const bestSolution = await algorithm.execute();
      const executionTime = Date.now() - startTime;

      const solutionValidation = this.validateSolution(bestSolution, data);
      if (!solutionValidation.isValid) {
        console.warn('Solução gerada contém violações:', solutionValidation.violations);
      }

      const alocacoes = await this.convertToAllocations(bestSolution, data);

      const metrics = {
        fitness: bestSolution.fitness,
        generations: params.generations,
        executionTime,
        conflictsResolved: this.countResolvedConflicts(bestSolution)
      };


      return {
        success: true,
        cromossomo: bestSolution,
        alocacoes,
        metrics
      };

    } catch (error) {
      console.error('Erro durante execução do algoritmo genético:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Executa o algoritmo de alocação apenas para disciplinas específicas (preview)
   */
  public async allocateScheduleForPreview(request: {
    turmaId: string;
    disciplinaIds: string[];
    params?: Partial<GeneticAlgorithmParams>;
  }): Promise<AllocationResult> {
    const startTime = Date.now();
    
    try {
      // Buscar dados filtrados apenas para as disciplinas selecionadas
      const data = await this.fetchAllocationDataForPreview(request.turmaId, request.disciplinaIds);
      if (!data || 'success' in data) {
        return {
          success: false,
          error: data && 'error' in data ? data.error : 'Erro ao buscar dados da turma'
        };
      }

      // Configurar parâmetros do algoritmo genético
      const params = { ...this.defaultParams, ...request.params };
      
      // Executar algoritmo genético
      const geneticAlgorithm = new GeneticAlgorithm(
        params,
        data.turma,
        data.professores,
        data.salas,
        data.horarios
      );
      const bestChromosome = await geneticAlgorithm.execute();
      
      if (!bestChromosome || bestChromosome.fitness === 0) {
        return {
          success: false,
          error: 'Falha na execução do algoritmo genético'
        };
      }

      // Converter cromossomo para alocações
      const alocacoes = await this.convertToAllocations(bestChromosome, data);
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        cromossomo: bestChromosome,
        alocacoes,
        metrics: {
          fitness: bestChromosome.fitness,
          generations: params.generations,
          executionTime,
          conflictsResolved: this.countResolvedConflicts(bestChromosome)
        }
      };
      
    } catch (error) {
      console.error('Erro durante alocação de preview:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Salva as alocações geradas no banco de dados
   */
  public async saveAllocations(turmaId: string, alocacoes: AlocacaoData[]): Promise<boolean> {
    try {
      // Obter curso da turma para resolver CursoDisciplina
      const turma = await prisma.turma.findUnique({
        where: { id: turmaId },
        select: { id_curso: true }
      });
      if (!turma?.id_curso) {
        throw new Error(`Turma ${turmaId} sem curso associado`);
      }

      await prisma.$transaction(async (tx) => {
        // Remover alocações existentes da turma
        await tx.alocacao.deleteMany({
          where: { id_turma: turmaId }
        });

        // Criar novas alocações
        for (const alocacao of alocacoes) {
          // Resolver vínculo CursoDisciplina
          const vinculo = await tx.cursoDisciplina.findUnique({
            where: {
              id_curso_id_disciplina: {
                id_curso: turma.id_curso,
                id_disciplina: alocacao.disciplinaId,
              },
            },
            select: { id: true },
          });

          await tx.alocacao.create({
            data: {
              id_turma: turmaId,
              id_disciplina: alocacao.disciplinaId,
              id_user: alocacao.professorId,
              id_sala: alocacao.salaId,
              id_horario: alocacao.horarioId,
              is_modulo_principal: true, // Assumindo que todas são módulo principal
              // Conectar CursoDisciplina quando disponível (compatível com novo modelo)
              ...(vinculo
                ? { cursoDisciplina: { connect: { id: vinculo.id } } }
                : {}),
            },
          });
        }
      });

      return true;

    } catch (error) {
      console.error('Erro ao salvar alocações:', error);
      return false;
    }
  }

  /**
   * Busca dados filtrados para preview de disciplinas específicas
   */
  private async fetchAllocationDataForPreview(turmaId: string, disciplinaIds: string[]) {
    try {
      const turma = await prisma.turma.findUnique({
        where: { id: turmaId },
        include: {
          curso: true,
          alocacoes: {
            include: {
              disciplina: true
            }
          }
        }
      });

      if (!turma) {
        throw new Error(`Turma ${turmaId} não encontrada`);
      }

      if (!turma.curso || turma.curso.isDeleted !== null) {
        return { success: false, error: 'Turma pertence a curso deletado' } as any;
      }

      // Buscar professores vinculados ao curso da turma através da tabela UserCurso
      const professores = await prisma.user.findMany({
        where: { 
          role: 'PROFESSOR',
          cursos: {
            some: {
              id_curso: turma.id_curso,
              ativo: true
            }
          }
        },
        include: {
          cursos: {
            where: {
              id_curso: turma.id_curso,
              ativo: true
            }
          }
        }
      });
      if (!professores || professores.length === 0) {
        return {
          success: false,
          error: 'Nenhum professor encontrado'
        };
      }

      const salas = await prisma.sala.findMany();
      if (!salas || salas.length === 0) {
        return {
          success: false,
          error: 'Nenhuma sala encontrada'
        };
      }

      const horarios = await prisma.horario.findMany();
      if (!horarios || horarios.length === 0) {
        return {
          success: false,
          error: 'Nenhum horário encontrado'
        };
      }

      // Buscar apenas as disciplinas selecionadas
      const disciplinas = await prisma.disciplina.findMany({
        where: { 
          id: { in: disciplinaIds }
        }
      });

      if (!disciplinas || disciplinas.length === 0) {
        return {
          success: false,
          error: 'Nenhuma disciplina encontrada para o preview'
        };
      }

      // Converter para formato esperado pelo algoritmo
      const turmaData = {
        id: turma.id,
        num_alunos: turma.num_alunos,
        turno: turma.turno || 'MATUTINO',
        disciplinas: disciplinas.map(d => ({
          id: d.id,
          nome: d.nome,
          cargaHoraria: d.carga_horaria || 60,
          tipoSala: d.tipo_de_sala === 'Lab' ? 'Lab' : 'Sala'
        }))
      };

      const professoresData = professores.map(p => ({
        id: p.id,
        nome: p.nome,
        carga_horaria_max: p.carga_horaria_max || 40,
        preferencias: []
      }));

      const salasData = salas.map(s => ({
        id: s.id,
        nome: s.nome,
        capacidade: s.capacidade,
        tipo: s.tipo,
        computadores: s.computadores
      }));

      const horariosData = horarios.map(h => ({
        id: h.id,
        codigo: h.codigo,
        dia_semana: h.dia_semana
      }));

      return {
        turma: turmaData,
        professores: professoresData,
        salas: salasData,
        horarios: horariosData
      };

    } catch (error) {
      console.error('Erro ao buscar dados para preview:', error);
      return null;
    }
  }

  /**
   * Busca dados necessários para execução do algoritmo
   */
  private async fetchAllocationData(turmaId: string) {
    try {
      const turma = await prisma.turma.findUnique({
        where: { id: turmaId },
        include: {
          alocacoes: {
            include: {
              disciplina: true
            }
          }
        }
      });

      if (!turma) {
        throw new Error(`Turma ${turmaId} não encontrada`);
      }

      const professores = await prisma.user.findMany({
        where: { role: 'PROFESSOR' }
      });

      if (!professores || professores.length === 0) {
        return {
          success: false,
          error: 'Nenhum professor encontrado'
        };
      }

      const salas = await prisma.sala.findMany();
      if (!salas || salas.length === 0) {
        return {
          success: false,
          error: 'Nenhuma sala encontrada'
        };
      }

      const horarios = await prisma.horario.findMany();
      if (!horarios || horarios.length === 0) {
        return {
          success: false,
          error: 'Nenhum horário encontrado'
        };
      }

      // Buscar disciplinas do curso da turma
      const vinculos = await prisma.cursoDisciplina.findMany({
        where: {
          id_curso: turma.id_curso,
        },
        include: {
          disciplina: true,
        },
      });

      const disciplinas = vinculos.map(v => v.disciplina).filter(Boolean);

      if (!disciplinas || disciplinas.length === 0) {
        return {
          success: false,
          error: 'Nenhuma disciplina encontrada para o curso desta turma'
        };
      }

      // Converter para formato esperado pelo algoritmo
      const turmaData = {
        id: turma.id,
        num_alunos: turma.num_alunos,
        turno: turma.turno || 'MATUTINO', // Incluir turno da turma
        disciplinas: disciplinas.map(d => ({
          id: d.id,
          nome: d.nome,
          cargaHoraria: d.carga_horaria || 60,
          tipoSala: d.tipo_de_sala === 'Lab' ? 'Lab' : 'Sala'
        }))
      };

      const professoresData = professores.map(p => ({
        id: p.id,
        nome: p.nome,
        carga_horaria_max: p.carga_horaria_max || 40, // Default 40h
        preferencias: [] // TODO: Implementar preferências de horário
      }));

      const salasData = salas.map(s => ({
        id: s.id,
        nome: s.nome,
        capacidade: s.capacidade,
        tipo: s.tipo,
        computadores: s.computadores
      }));

      const horariosData = horarios.map(h => ({
        id: h.id,
        codigo: h.codigo,
        dia_semana: h.dia_semana
      }));

      return {
        turma: turmaData,
        professores: professoresData,
        salas: salasData,
        horarios: horariosData
      };

    } catch (error) {
      console.error('Erro ao buscar dados para alocação:', error);
      return null;
    }
  }

  /**
   * Valida a requisição de alocação
   */
  private async validateRequest(request: AllocationRequest): Promise<{ isValid: boolean; error?: string }> {
    if (!request.turmaId) {
      return { isValid: false, error: 'ID da turma é obrigatório' };
    }

    // Verificar se a turma existe
    const turma = await prisma.turma.findUnique({
      where: { id: request.turmaId },
      include: { 
        curso: true
      }
    });

    if (!turma) {
      return { isValid: false, error: 'Turma não encontrada' };
    }

    // Verificar se existem disciplinas no curso da turma
    const vinculos = await prisma.cursoDisciplina.findMany({
      where: {
        id_curso: turma.id_curso,
      },
      include: { disciplina: true }
    });

    const disciplinas = vinculos.map(v => v.disciplina).filter(Boolean);

    if (disciplinas.length === 0) {
      return { isValid: false, error: 'Curso da turma não possui disciplinas obrigatórias cadastradas' };
    }

    // Validar parâmetros do algoritmo
    if (request.params) {
      const { populationSize, generations, mutationRate, crossoverRate, elitismRate } = request.params;
      
      if (populationSize && (populationSize < 10 || populationSize > 1000)) {
        return { isValid: false, error: 'Tamanho da população deve estar entre 10 e 1000' };
      }
      
      if (generations && (generations < 10 || generations > 2000)) {
        return { isValid: false, error: 'Número de gerações deve estar entre 10 e 2000' };
      }
      
      if (mutationRate && (mutationRate < 0 || mutationRate > 1)) {
        return { isValid: false, error: 'Taxa de mutação deve estar entre 0 e 1' };
      }
      
      if (crossoverRate && (crossoverRate < 0 || crossoverRate > 1)) {
        return { isValid: false, error: 'Taxa de crossover deve estar entre 0 e 1' };
      }
      
      if (elitismRate && (elitismRate < 0 || elitismRate > 0.5)) {
        return { isValid: false, error: 'Taxa de elitismo deve estar entre 0 e 0.5' };
      }
    }

    return { isValid: true };
  }

  /**
   * Valida a solução gerada pelo algoritmo
   */
  private validateSolution(cromossomo: Cromossomo, data: {
    professores: any[];
    salas: any[];
    horarios: any[];
    disciplinas: any[];
    turma: any;
  }): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];
    const context = {
      allGenes: cromossomo.genes,
      professores: data.professores,
      salas: data.salas,
      disciplinas: data.turma.disciplinas,
      turma: data.turma
    };

    // Verificar cada gene
    for (const gene of cromossomo.genes) {
      const validation = constraintManager.validateHardConstraints(gene, context);
      violations.push(...validation.violations);
    }

    return {
      isValid: violations.length === 0,
      violations: [...new Set(violations)] // Remover duplicatas
    };
  }

  /**
   * Converte cromossomo para formato de alocações
   */
  private async convertToAllocations(cromossomo: Cromossomo, data: {
    professores: any[];
    salas: any[];
    horarios: any[];
    disciplinas: any[];
    turma: any;
  }): Promise<AlocacaoData[]> {
    const alocacoes: AlocacaoData[] = [];

    // Contexto para validação de hard constraints
    const context = {
      allGenes: cromossomo.genes,
      professores: data.professores,
      salas: data.salas,
      horarios: data.horarios,
      disciplinas: data.turma.disciplinas,
      turma: data.turma
    };

    for (const gene of cromossomo.genes) {
      // Gatekeeper: validar gene contra hard constraints antes de persistir
      const validation = constraintManager.validateHardConstraints(gene, context);
      if (!validation.isValid) {
        console.warn('Descartando gene por violação de hard constraints:', {
          disciplinaId: gene.disciplinaId,
          professorId: gene.professorId,
          salaId: gene.salaId,
          horarios: gene.horarios,
          violations: validation.violations
        });
        continue; // não persiste alocações inválidas
      }

      // Para cada horário do gene, criar uma alocação
      for (const horarioStr of gene.horarios) {
        // Encontrar o horário correspondente
        const horario = data.horarios.find(h => 
          `${h.dia_semana}_${h.codigo}` === horarioStr
        );

        if (horario) {
          alocacoes.push({
            disciplinaId: gene.disciplinaId,
            professorId: gene.professorId,
            salaId: gene.salaId,
            horarioId: horario.id,
            horarioStr
          });
        }
      }
    }

    return alocacoes;
  }

  /**
   * Conta conflitos resolvidos na solução
   */
  private countResolvedConflicts(cromossomo: Cromossomo): number {
    // Implementação simplificada
    // Na prática, compararia com uma solução inicial ou baseline
    const professorHorarios = new Map<string, Set<string>>();
    const salaHorarios = new Map<string, Set<string>>();
    let conflicts = 0;

    for (const gene of cromossomo.genes) {
      // Verificar conflitos de professor
      if (!professorHorarios.has(gene.professorId)) {
        professorHorarios.set(gene.professorId, new Set());
      }
      const profHorarios = professorHorarios.get(gene.professorId)!;
      
      for (const horario of gene.horarios) {
        if (profHorarios.has(horario)) {
          conflicts++;
        }
        profHorarios.add(horario);
      }

      // Verificar conflitos de sala
      if (!salaHorarios.has(gene.salaId)) {
        salaHorarios.set(gene.salaId, new Set());
      }
      const salaHors = salaHorarios.get(gene.salaId)!;
      
      for (const horario of gene.horarios) {
        if (salaHors.has(horario)) {
          conflicts++;
        }
        salaHors.add(horario);
      }
    }

    // Retorna o número de conflitos que foram evitados
    // (assumindo que uma solução aleatória teria mais conflitos)
    return Math.max(0, cromossomo.genes.length * 2 - conflicts);
  }

  /**
   * Gera relatório detalhado da alocação
   */
  public async generateAllocationReport(turmaId: string): Promise<AllocationReportMetrics | null> {
    try {
      const alocacoes = await prisma.alocacao.findMany({
         where: { id_turma: turmaId },
         include: {
           disciplina: true,
           user: true,
           sala: true,
           horario: true
         }
       });

      if (alocacoes.length === 0) {
        return null;
      }

      const disciplinasUnicas = new Set(alocacoes.map(a => a.disciplinaId)).size;
      const conflitos = this.analyzeConflicts(alocacoes);
      
      return {
        totalDisciplinas: disciplinasUnicas,
        conflitosIniciais: 0, // TODO: Implementar baseline
        conflitosFinais: conflitos.total,
        fitnessInicial: 0, // TODO: Implementar baseline
        fitnessFinal: 1000 - conflitos.total * 100, // Estimativa
        geracoesExecutadas: 0, // TODO: Armazenar no banco
        tempoExecucao: 0, // TODO: Armazenar no banco
        taxaSucesso: conflitos.total === 0 ? 100 : Math.max(0, 100 - conflitos.total * 10)
      };

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return null;
    }
  }

  /**
   * Analisa conflitos nas alocações existentes
   */
  private analyzeConflicts(alocacoes: AlocacaoData[]): { total: number; byType: { [key: string]: number } } {
    const conflicts = { total: 0, byType: { professor: 0, sala: 0, capacity: 0 } };
    
    const professorHorarios = new Map<string, Set<string>>();
    const salaHorarios = new Map<string, Set<string>>();

    for (const alocacao of alocacoes) {
      const horarioKey = `${alocacao.horario.dia_semana}_${alocacao.horario.codigo}`;
      
      // Verificar conflitos de professor
      if (!professorHorarios.has(alocacao.professorId)) {
        professorHorarios.set(alocacao.professorId, new Set());
      }
      const profHorarios = professorHorarios.get(alocacao.professorId)!;
      
      if (profHorarios.has(horarioKey)) {
        conflicts.byType.professor++;
        conflicts.total++;
      }
      profHorarios.add(horarioKey);

      // Verificar conflitos de sala
      if (!salaHorarios.has(alocacao.salaId)) {
        salaHorarios.set(alocacao.salaId, new Set());
      }
      const salaHors = salaHorarios.get(alocacao.salaId)!;
      
      if (salaHors.has(horarioKey)) {
        conflicts.byType.sala++;
        conflicts.total++;
      }
      salaHors.add(horarioKey);
    }

    return conflicts;
  }

  /**
   * Obtém status de uma execução de algoritmo genético
   */
  async getStatus(turmaId: string): Promise<AllocationStatus> {
    try {
      // Verificar se existe uma execução em andamento
      // Por simplicidade, vamos retornar um status básico
      const alocacoes = await prisma.alocacao.findMany({
        where: { turmaId },
        include: {
          disciplina: true,
          professor: true,
          sala: true,
          horario: true
        }
      });

      return {
        turmaId,
        status: alocacoes.length > 0 ? 'completed' : 'not_started',
        totalAlocacoes: alocacoes.length,
        ultimaExecucao: alocacoes.length > 0 ? alocacoes[0].created_at : null
      };
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return {
        turmaId,
        status: 'error',
        error: 'Erro ao verificar status'
      };
    }
  }

  /**
   * Cancela execução do algoritmo genético
   */
  async cancel(turmaId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Por simplicidade, vamos apenas retornar sucesso
      // Em uma implementação real, aqui cancelaríamos a execução em andamento
      return { success: true };
    } catch (error) {
      console.error('Erro ao cancelar execução:', error);
      return { 
        success: false, 
        error: 'Erro ao cancelar execução do algoritmo' 
      };
    }
  }

  /**
   * Obtém relatório detalhado de uma alocação
   */
  async getDetailedReport(turmaId: string): Promise<DetailedReport> {
    try {
      const alocacoes = await prisma.alocacao.findMany({
         where: { id_turma: turmaId },
         include: {
           disciplina: true,
           user: true,
           sala: true,
           horario: true,
           turma: true
         }
       });

      if (alocacoes.length === 0) {
        return null;
      }

      // Calcular estatísticas
       const professoresUnicos = new Set(alocacoes.map(a => a.id_user)).size;
       const disciplinasUnicas = new Set(alocacoes.map(a => a.id_disciplina)).size;
       const salasUnicas = new Set(alocacoes.map(a => a.id_sala)).size;

      // Agrupar por dia da semana
      const porDiaSemana = alocacoes.reduce((acc, alocacao) => {
        const dia = alocacao.horario?.dia_semana || 'INDEFINIDO';
        if (!acc[dia]) acc[dia] = [];
        acc[dia].push(alocacao);
        return acc;
      }, {} as Record<string, AlocacaoData[]>);

      return {
        turmaId,
        turma: alocacoes[0].turma,
        estatisticas: {
          totalAlocacoes: alocacoes.length,
          professoresUnicos,
          disciplinasUnicas,
          salasUnicas
        },
        distribuicao: {
          porDiaSemana: Object.keys(porDiaSemana).map(dia => ({
            dia,
            quantidade: porDiaSemana[dia].length
          }))
        },
        alocacoes: alocacoes.map(a => ({
          id: a.id,
          disciplina: a.disciplina?.nome,
          professor: a.user?.nome,
          sala: a.sala?.nome,
          horario: `${a.horario?.dia_semana} - ${a.horario?.codigo}`,
          criadoEm: a.created_at
        }))
      };
    } catch (error) {
      console.error('Erro ao gerar relatório detalhado:', error);
      return null;
    }
  }

  /**
   * Cria alocações temporárias para preview
   */
  private async createTemporaryAllocations(turmaId: string, disciplinaIds: string[]): Promise<void> {
    try {
      // Buscar dados necessários
      const professores = await prisma.user.findMany({
        where: { role: 'PROFESSOR' }
      });
      const salas = await prisma.sala.findMany();
      const horarios = await prisma.horario.findMany();
      const turma = await prisma.turma.findUnique({
        where: { id: turmaId },
        select: { id_curso: true }
      });

      if (!professores.length || !salas.length || !horarios.length || !turma?.id_curso) {
        throw new Error('Dados insuficientes para gerar preview');
      }

      // Criar alocações temporárias para cada disciplina
      for (const disciplinaId of disciplinaIds) {
        const vinculo = await prisma.cursoDisciplina.findUnique({
          where: {
            id_curso_id_disciplina: {
              id_curso: turma.id_curso,
              id_disciplina: disciplinaId,
            },
          },
          select: { id: true },
        });

        await prisma.alocacao.create({
          data: {
            turma: { connect: { id: turmaId } },
            // Usar conexão explícita com a relação disciplina para atender ao schema do Prisma
            disciplina: { connect: { id: disciplinaId } },
            user: { connect: { id: professores[0].id } }, // Temporário
            sala: { connect: { id: salas[0].id } }, // Temporário
            horario: { connect: { id: horarios[0].id } }, // Temporário
            is_modulo_principal: true,
            ...(vinculo ? { cursoDisciplina: { connect: { id: vinculo.id } } } : {}),
          }
        });
      }
    } catch (error) {
      console.error('Erro ao criar alocações temporárias:', error);
      throw error;
    }
  }

  /**
   * Atualiza o horário consolidado das disciplinas
   */
  private async updateConsolidatedSchedules(disciplinaIds: string[]): Promise<void> {
    try {
      const { GerarHorarioConsolidadoUseCase } = await import('../../use-cases/disciplina/gerar-horario-consolidado');
      const { PrismaAlocacoesRepository } = await import('../../repositories/prisma-repositories/prisma-alocacoes-repository');
      const { PrismaDisciplinasRepository } = await import('../../repositories/prisma-repositories/prisma-disciplinas-repository');
      
      const alocacoesRepository = new PrismaAlocacoesRepository();
      const disciplinasRepository = new PrismaDisciplinasRepository();
      const gerarHorarioUseCase = new GerarHorarioConsolidadoUseCase(alocacoesRepository);

      const periodoAtivo = await prisma.periodoLetivo.findFirst({
        where: { ativo: true },
        orderBy: { data_inicio: "desc" },
      });
      if (!periodoAtivo) return;
      
      for (const disciplinaId of disciplinaIds) {
        const { horarioConsolidado } = await gerarHorarioUseCase.execute({
          disciplinaId,
          periodoId: periodoAtivo.id,
        });
        await disciplinasRepository.update(disciplinaId, {
          horario_consolidado: horarioConsolidado || null,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar horários consolidados:', error);
    }
  }

  /**
   * Limpa alocações temporárias após preview
   */
  private async cleanupTemporaryAllocations(turmaId: string): Promise<void> {
    try {
      // Remover apenas alocações criadas nos últimos 5 minutos (temporárias)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      await prisma.alocacao.deleteMany({
        where: {
          id_turma: turmaId,
          created_at: {
            gte: fiveMinutesAgo
          }
        }
      });
    } catch (error) {
      console.error('Erro ao limpar alocações temporárias:', error);
    }
  }

  /**
   * Gera grade de horários para visualização
   */
  private async generateScheduleGrid(alocacoes: AlocacaoData[]): Promise<Record<string, any[]>> {
    const grid: Record<string, any[]> = {};
    
    // Buscar todos os dados necessários em uma única consulta para otimizar
    const disciplinaIds = [...new Set(alocacoes.map(a => a.disciplinaId))];
    const professorIds = [...new Set(alocacoes.map(a => a.professorId))];
    const salaIds = [...new Set(alocacoes.map(a => a.salaId))];
    const horarioIds = [...new Set(alocacoes.map(a => a.horarioId))];
    
    const [disciplinas, professores, salas, horarios] = await Promise.all([
      prisma.disciplina.findMany({ where: { id: { in: disciplinaIds } } }),
      prisma.user.findMany({ where: { id: { in: professorIds } } }),
      prisma.sala.findMany({ where: { id: { in: salaIds } } }),
      prisma.horario.findMany({ where: { id: { in: horarioIds } } })
    ]);
    
    for (const alocacao of alocacoes) {
      try {
        const disciplina = disciplinas.find(d => d.id === alocacao.disciplinaId);
        const professor = professores.find(p => p.id === alocacao.professorId);
        const sala = salas.find(s => s.id === alocacao.salaId);
        const horario = horarios.find(h => h.id === alocacao.horarioId);
    
        if (horario) {
          const key = `${horario.dia_semana}_${horario.codigo}`;
          
          if (!grid[key]) {
            grid[key] = [];
          }
          
          grid[key].push({
            disciplina: disciplina?.nome || 'Disciplina não encontrada',
            codigo: disciplina?.codigo || '',
            professor: professor?.nome || 'Professor não encontrado',
            sala: sala?.nome || 'Sala não encontrada',
            horario: `${horario.dia_semana} - ${horario.codigo}`,
            // IDs para referência, mantendo apenas tipos primitivos
            disciplinaId: disciplina?.id,
            professorId: professor?.id,
            salaId: sala?.id,
            horarioId: horario.id
          });
        }
      } catch (error) {
        console.error('Erro ao processar alocação para grade:', error);
      }
    }
    
    return grid;
  }

  /**
   * Detecta conflitos nas alocações
   */
  private async detectConflicts(alocacoes: AlocacaoData[]): Promise<Array<{ message: string; type: string; severity: string }>> {
    const conflicts: Array<{ message: string; type: string; severity: string }> = [];
    const salaHorarios = new Map<string, AlocacaoData>();
    const professorHorarios = new Map<string, AlocacaoData>();
    
    // Buscar dados das salas e turma para verificação de capacidade
    const salaIds = [...new Set(alocacoes.map(a => a.salaId))];
    const salas = await prisma.sala.findMany({
      where: { id: { in: salaIds } }
    });
    
    // Buscar turma através das alocações existentes
    let turma = null;
    if (alocacoes.length > 0) {
      // Buscar uma alocação existente para obter o turmaId
      const alocacaoExistente = await prisma.alocacao.findFirst({
        where: { id_disciplina: alocacoes[0].disciplinaId },
        include: { turma: true }
      });
      
      turma = alocacaoExistente?.turma || null;
    }
    
    for (const alocacao of alocacoes) {
      // Verificar conflito de sala/horário
      const slotKey = `${alocacao.salaId}_${alocacao.horarioId}`;
      if (salaHorarios.has(slotKey)) {
        const conflictingAllocation = salaHorarios.get(slotKey)!;
        conflicts.push({
          message: `Conflito de sala: Mesma sala alocada em horário simultâneo`,
          type: 'room_conflict',
          severity: 'high'
        });
      }
      salaHorarios.set(slotKey, alocacao);
      
      // Verificar conflito de professor/horário
      const professorSlotKey = `${alocacao.professorId}_${alocacao.horarioId}`;
      if (professorHorarios.has(professorSlotKey)) {
        const conflictingAllocation = professorHorarios.get(professorSlotKey)!;
        conflicts.push({
          message: `Conflito de professor: Mesmo professor alocado em horário simultâneo`,
          type: 'professor_conflict',
          severity: 'high'
        });
      }
      professorHorarios.set(professorSlotKey, alocacao);
      
      // Verificar violação de capacidade
      if (turma) {
        const sala = salas.find(s => s.id === alocacao.salaId);
        if (sala && sala.capacidade < turma.num_alunos) {
          conflicts.push({
            message: `Violação de capacidade: Sala ${sala.nome} (cap: ${sala.capacidade}) insuficiente para ${turma.num_alunos} alunos`,
            type: 'capacity_violation',
            severity: 'medium'
          });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Limpa recursos
   */
  public async cleanup(): Promise<void> {
    await prisma.$disconnect();
  }
}

export const allocationService = new AllocationService();
