import { Gene, Cromossomo } from "../genetic/genetic-algorithm";
import { constraintManager } from "../genetic/constraints";

interface ConflictReport {
  totalConflicts: number;
  conflictsByType: {
    professorOverlap: number;
    roomOverlap: number;
    capacityViolation: number;
    roomTypeMismatch: number;
    professorOverload: number;
  };
  conflictDetails: ConflictDetail[];
}

interface ConflictDetail {
  type:
    | "professor_overlap"
    | "room_overlap"
    | "capacity_violation"
    | "room_type_mismatch"
    | "professor_overload";
  severity: "high" | "medium" | "low";
  description: string;
  affectedGenes: string[]; // IDs dos genes afetados
  suggestedFix?: string;
}

interface Professor {
  id: string;
  nome: string;
  email: string;
  carga_horaria_maxima?: number;
}

interface Sala {
  id: string;
  nome: string;
  predio: string;
  capacidade: number;
  tipo?: string;
}

interface Horario {
  id: string;
  codigo: string;
  dia_semana: string;
  horario_inicio: Date;
  horario_fim: Date;
}

interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  carga_horaria: number;
  tipo?: string;
}

interface Turma {
  id: string;
  nome: string;
  semestre: number;
  ano: number;
  capacidade?: number;
  num_alunos?: number;
}

interface ResolutionStrategy {
  name: string;
  priority: number;
  canResolve: (conflict: ConflictDetail, context: ConflictContext) => boolean;
  resolve: (
    conflict: ConflictDetail,
    cromossomo: Cromossomo,
    context: ConflictContext
  ) => Promise<boolean>;
}

interface ConflictContext {
  professores: Professor[];
  salas: Sala[];
  horarios: Horario[];
  disciplinas: Disciplina[];
  turma: Turma;
}

export class ConflictResolver {
  private strategies: ResolutionStrategy[];

  constructor() {
    this.strategies = this.initializeStrategies();
  }

  /**
   * Analisa conflitos em um cromossomo
   */
  public analyzeConflicts(
    cromossomo: Cromossomo,
    context: ConflictContext
  ): ConflictReport {
    const report: ConflictReport = {
      totalConflicts: 0,
      conflictsByType: {
        professorOverlap: 0,
        roomOverlap: 0,
        capacityViolation: 0,
        roomTypeMismatch: 0,
        professorOverload: 0,
      },
      conflictDetails: [],
    };

    // Mapas para rastrear ocupação
    const professorSchedule = new Map<string, Map<string, string[]>>();
    const roomSchedule = new Map<string, Map<string, string[]>>();
    const professorWorkload = new Map<string, number>();

    // Analisar cada gene
    for (let i = 0; i < cromossomo.genes.length; i++) {
      const gene = cromossomo.genes[i];

      // Verificar conflitos de professor
      this.checkProfessorConflicts(gene, professorSchedule, report, i);

      // Verificar conflitos de sala
      this.checkRoomConflicts(gene, roomSchedule, report, context, i);

      // Verificar carga horária do professor
      this.checkProfessorWorkload(gene, professorWorkload, report, context, i);

      // Verificar tipo de sala
      this.checkRoomTypeMatch(gene, report, context, i);
    }

    report.totalConflicts = report.conflictDetails.length;
    return report;
  }

  /**
   * Resolve conflitos automaticamente
   */
  public async resolveConflicts(
    cromossomo: Cromossomo,
    context: ConflictContext,
    maxAttempts: number = 10
  ): Promise<{
    resolved: boolean;
    attempts: number;
    remainingConflicts: number;
  }> {
    let attempts = 0;
    let resolved = false;

    while (attempts < maxAttempts && !resolved) {
      const conflicts = this.analyzeConflicts(cromossomo, context);

      if (conflicts.totalConflicts === 0) {
        resolved = true;
        break;
      }

      // Ordenar conflitos por severidade
      const sortedConflicts = conflicts.conflictDetails.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      // Tentar resolver cada conflito
      let conflictResolved = false;
      for (const conflict of sortedConflicts) {
        const strategy = this.findBestStrategy(conflict, context);
        if (strategy) {
          const success = await strategy.resolve(conflict, cromossomo, context);
          if (success) {
            conflictResolved = true;
            break;
          }
        }
      }

      if (!conflictResolved) {
        // Se não conseguiu resolver nenhum conflito, fazer uma mutação aleatória
        this.performRandomMutation(cromossomo, context);
      }

      attempts++;
    }

    const finalConflicts = this.analyzeConflicts(cromossomo, context);
    return {
      resolved: finalConflicts.totalConflicts === 0,
      attempts,
      remainingConflicts: finalConflicts.totalConflicts,
    };
  }

  /**
   * Verifica conflitos de professor (mesmo professor em horários sobrepostos)
   */
  private checkProfessorConflicts(
    gene: Gene,
    professorSchedule: Map<string, Map<string, string[]>>,
    report: ConflictReport,
    geneIndex: number
  ): void {
    if (!professorSchedule.has(gene.professorId)) {
      professorSchedule.set(gene.professorId, new Map());
    }

    const schedule = professorSchedule.get(gene.professorId)!;

    for (const horario of gene.horarios) {
      if (schedule.has(horario)) {
        const conflictingGenes = schedule.get(horario)!;

        report.conflictsByType.professorOverlap++;
        report.conflictDetails.push({
          type: "professor_overlap",
          severity: "high",
          description: `Professor ${gene.professorId} tem conflito no horário ${horario}`,
          affectedGenes: [geneIndex.toString(), ...conflictingGenes],
          suggestedFix: "Alterar professor ou horário de uma das disciplinas",
        });
      } else {
        schedule.set(horario, [geneIndex.toString()]);
      }
    }
  }

  /**
   * Verifica conflitos de sala (mesma sala em horários sobrepostos)
   */
  private checkRoomConflicts(
    gene: Gene,
    roomSchedule: Map<string, Map<string, string[]>>,
    report: ConflictReport,
    context: ConflictContext,
    geneIndex: number
  ): void {
    if (!roomSchedule.has(gene.salaId)) {
      roomSchedule.set(gene.salaId, new Map());
    }

    const schedule = roomSchedule.get(gene.salaId)!;
    const sala = context.salas.find((s) => s.id === gene.salaId);

    for (const horario of gene.horarios) {
      if (schedule.has(horario)) {
        const conflictingGenes = schedule.get(horario)!;

        report.conflictsByType.roomOverlap++;
        report.conflictDetails.push({
          type: "room_overlap",
          severity: "high",
          description: `Sala ${sala?.nome || gene.salaId} tem conflito no horário ${horario}`,
          affectedGenes: [geneIndex.toString(), ...conflictingGenes],
          suggestedFix: "Alterar sala ou horário de uma das disciplinas",
        });
      } else {
        schedule.set(horario, [geneIndex.toString()]);
      }
    }

    // Verificar capacidade da sala
    if (sala && context.turma.num_alunos > sala.capacidade) {
      report.conflictsByType.capacityViolation++;
      report.conflictDetails.push({
        type: "capacity_violation",
        severity: "medium",
        description: `Sala ${sala.nome} (cap: ${sala.capacidade}) insuficiente para ${context.turma.num_alunos} alunos`,
        affectedGenes: [geneIndex.toString()],
        suggestedFix: "Alterar para sala com maior capacidade",
      });
    }
  }

  /**
   * Verifica carga horária do professor
   */
  private checkProfessorWorkload(
    gene: Gene,
    professorWorkload: Map<string, number>,
    report: ConflictReport,
    context: ConflictContext,
    geneIndex: number
  ): void {
    const currentLoad = professorWorkload.get(gene.professorId) || 0;
    const newLoad = currentLoad + gene.horarios.length;
    professorWorkload.set(gene.professorId, newLoad);

    const professor = context.professores.find(
      (p) => p.id === gene.professorId
    );
    const maxLoad = professor?.carga_horaria_maxima || 40;

    if (newLoad > maxLoad) {
      report.conflictsByType.professorOverload++;
      report.conflictDetails.push({
        type: "professor_overload",
        severity: "medium",
        description: `Professor ${professor?.nome || gene.professorId} excede carga horária (${newLoad}/${maxLoad}h)`,
        affectedGenes: [geneIndex.toString()],
        suggestedFix: "Redistribuir disciplinas ou alterar professor",
      });
    }
  }

  /**
   * Verifica compatibilidade entre tipo de disciplina e sala
   */
  private checkRoomTypeMatch(
    gene: Gene,
    report: ConflictReport,
    context: ConflictContext,
    geneIndex: number
  ): void {
    const disciplina = context.disciplinas.find(
      (d) => d.id === gene.disciplinaId
    );
    const sala = context.salas.find((s) => s.id === gene.salaId);

    if (disciplina && sala) {
      // Verificar se disciplina de laboratório está em sala adequada
      if (disciplina.tipoSala === "Lab" && sala.tipo !== "Lab") {
        report.conflictsByType.roomTypeMismatch++;
        report.conflictDetails.push({
          type: "room_type_mismatch",
          severity: "low",
          description: `Disciplina ${disciplina.nome} (Lab) alocada em sala comum ${sala.nome}`,
          affectedGenes: [geneIndex.toString()],
          suggestedFix: "Alterar para sala de laboratório",
        });
      }

      // Verificar se sala de laboratório tem computadores suficientes
      if (disciplina.tipoSala === "Lab" && sala.tipo === "Lab") {
        const computadoresNecessarios = Math.ceil(context.turma.num_alunos / 2); // 2 alunos por computador
        if (sala.computadores < computadoresNecessarios) {
          report.conflictsByType.roomTypeMismatch++;
          report.conflictDetails.push({
            type: "room_type_mismatch",
            severity: "medium",
            description: `Lab ${sala.nome} tem ${sala.computadores} computadores, necessário ${computadoresNecessarios}`,
            affectedGenes: [geneIndex.toString()],
            suggestedFix: "Alterar para laboratório com mais computadores",
          });
        }
      }
    }
  }

  /**
   * Inicializa estratégias de resolução de conflitos
   */
  private initializeStrategies(): ResolutionStrategy[] {
    return [
      {
        name: "Professor Overlap Resolution",
        priority: 1,
        canResolve: (conflict) => conflict.type === "professor_overlap",
        resolve: async (conflict, cromossomo, context) => {
          return this.resolveProfessorOverlap(conflict, cromossomo, context);
        },
      },
      {
        name: "Room Overlap Resolution",
        priority: 1,
        canResolve: (conflict) => conflict.type === "room_overlap",
        resolve: async (conflict, cromossomo, context) => {
          return this.resolveRoomOverlap(conflict, cromossomo, context);
        },
      },
      {
        name: "Capacity Violation Resolution",
        priority: 2,
        canResolve: (conflict) => conflict.type === "capacity_violation",
        resolve: async (conflict, cromossomo, context) => {
          return this.resolveCapacityViolation(conflict, cromossomo, context);
        },
      },
      {
        name: "Room Type Mismatch Resolution",
        priority: 3,
        canResolve: (conflict) => conflict.type === "room_type_mismatch",
        resolve: async (conflict, cromossomo, context) => {
          return this.resolveRoomTypeMismatch(conflict, cromossomo, context);
        },
      },
      {
        name: "Professor Overload Resolution",
        priority: 2,
        canResolve: (conflict) => conflict.type === "professor_overload",
        resolve: async (conflict, cromossomo, context) => {
          return this.resolveProfessorOverload(conflict, cromossomo, context);
        },
      },
    ];
  }

  /**
   * Encontra a melhor estratégia para resolver um conflito
   */
  private findBestStrategy(
    conflict: ConflictDetail,
    context: ConflictContext
  ): ResolutionStrategy | null {
    const applicableStrategies = this.strategies.filter((s) =>
      s.canResolve(conflict, context)
    );
    return (
      applicableStrategies.sort((a, b) => a.priority - b.priority)[0] || null
    );
  }

  /**
   * Resolve conflito de sobreposição de professor
   */
  private async resolveProfessorOverlap(
    conflict: ConflictDetail,
    cromossomo: Cromossomo,
    context: ConflictContext
  ): Promise<boolean> {
    const geneIndex = parseInt(conflict.affectedGenes[0]);
    const gene = cromossomo.genes[geneIndex];

    // Tentar alterar professor
    const availableProfessors = context.professores.filter(
      (p) => p.id !== gene.professorId
    );

    for (const professor of availableProfessors) {
      const testGene = { ...gene, professorId: professor.id };
      const validation = constraintManager.validateHardConstraints(testGene, {
        allGenes: cromossomo.genes,
        professores: context.professores,
        salas: context.salas,
        disciplinas: context.disciplinas,
        turma: context.turma,
      });

      if (validation.isValid) {
        gene.professorId = professor.id;
        return true;
      }
    }

    // Se não conseguiu alterar professor, tentar alterar horário
    return this.tryChangeSchedule(gene, cromossomo, context);
  }

  /**
   * Resolve conflito de sobreposição de sala
   */
  private async resolveRoomOverlap(
    conflict: ConflictDetail,
    cromossomo: Cromossomo,
    context: ConflictContext
  ): Promise<boolean> {
    const geneIndex = parseInt(conflict.affectedGenes[0]);
    const gene = cromossomo.genes[geneIndex];

    // Tentar alterar sala
    const availableRooms = context.salas.filter((s) => s.id !== gene.salaId);

    for (const room of availableRooms) {
      const testGene = { ...gene, salaId: room.id };
      const validation = constraintManager.validateHardConstraints(testGene, {
        allGenes: cromossomo.genes,
        professores: context.professores,
        salas: context.salas,
        disciplinas: context.disciplinas,
        turma: context.turma,
      });

      if (validation.isValid) {
        gene.salaId = room.id;
        return true;
      }
    }

    // Se não conseguiu alterar sala, tentar alterar horário
    return this.tryChangeSchedule(gene, cromossomo, context);
  }

  /**
   * Resolve violação de capacidade
   */
  private async resolveCapacityViolation(
    conflict: ConflictDetail,
    cromossomo: Cromossomo,
    context: ConflictContext
  ): Promise<boolean> {
    const geneIndex = parseInt(conflict.affectedGenes[0]);
    const gene = cromossomo.genes[geneIndex];

    // Encontrar salas com capacidade adequada
    const suitableRooms = context.salas.filter(
      (s) => s.capacidade >= context.turma.num_alunos && s.id !== gene.salaId
    );

    for (const room of suitableRooms) {
      const testGene = { ...gene, salaId: room.id };
      const validation = constraintManager.validateHardConstraints(testGene, {
        allGenes: cromossomo.genes,
        professores: context.professores,
        salas: context.salas,
        disciplinas: context.disciplinas,
        turma: context.turma,
      });

      if (validation.isValid) {
        gene.salaId = room.id;
        return true;
      }
    }

    return false;
  }

  /**
   * Resolve incompatibilidade de tipo de sala
   */
  private async resolveRoomTypeMismatch(
    conflict: ConflictDetail,
    cromossomo: Cromossomo,
    context: ConflictContext
  ): Promise<boolean> {
    const geneIndex = parseInt(conflict.affectedGenes[0]);
    const gene = cromossomo.genes[geneIndex];
    const disciplina = context.disciplinas.find(
      (d) => d.id === gene.disciplinaId
    );

    if (!disciplina) return false;

    // Encontrar salas do tipo correto
    const suitableRooms = context.salas.filter((s) => {
      if (disciplina.tipoSala === "Lab") {
        return (
          s.tipo === "Lab" &&
          s.capacidade >= context.turma.num_alunos &&
          s.computadores >= Math.ceil(context.turma.num_alunos / 2)
        );
      } else {
        return s.capacidade >= context.turma.num_alunos;
      }
    });

    for (const room of suitableRooms) {
      const testGene = { ...gene, salaId: room.id };
      const validation = constraintManager.validateHardConstraints(testGene, {
        allGenes: cromossomo.genes,
        professores: context.professores,
        salas: context.salas,
        disciplinas: context.disciplinas,
        turma: context.turma,
      });

      if (validation.isValid) {
        gene.salaId = room.id;
        return true;
      }
    }

    return false;
  }

  /**
   * Resolve sobrecarga de professor
   */
  private async resolveProfessorOverload(
    conflict: ConflictDetail,
    cromossomo: Cromossomo,
    context: ConflictContext
  ): Promise<boolean> {
    const geneIndex = parseInt(conflict.affectedGenes[0]);
    const gene = cromossomo.genes[geneIndex];

    // Encontrar professores com menor carga horária
    const professorLoads = new Map<string, number>();

    // Calcular carga atual de cada professor
    for (const g of cromossomo.genes) {
      const currentLoad = professorLoads.get(g.professorId) || 0;
      professorLoads.set(g.professorId, currentLoad + g.horarios.length);
    }

    // Encontrar professores disponíveis
    const availableProfessors = context.professores.filter((p) => {
      const currentLoad = professorLoads.get(p.id) || 0;
      const maxLoad = p.carga_horaria_max || 40;
      return (
        currentLoad + gene.horarios.length <= maxLoad &&
        p.id !== gene.professorId
      );
    });

    for (const professor of availableProfessors) {
      const testGene = { ...gene, professorId: professor.id };
      const validation = constraintManager.validateHardConstraints(testGene, {
        allGenes: cromossomo.genes,
        professores: context.professores,
        salas: context.salas,
        disciplinas: context.disciplinas,
        turma: context.turma,
      });

      if (validation.isValid) {
        gene.professorId = professor.id;
        return true;
      }
    }

    return false;
  }

  /**
   * Tenta alterar horário de um gene
   */
  private tryChangeSchedule(
    gene: Gene,
    cromossomo: Cromossomo,
    context: ConflictContext
  ): boolean {
    const disciplina = context.disciplinas.find(
      (d) => d.id === gene.disciplinaId
    );
    if (!disciplina) return false;

    const horariosNecessarios = Math.ceil(disciplina.carga_horaria / 2); // 2h por horário
    const availableSlots = this.getAvailableTimeSlots(
      context.horarios,
      cromossomo,
      gene
    );

    if (availableSlots.length >= horariosNecessarios) {
      const newSchedule = availableSlots
        .slice(0, horariosNecessarios)
        .map((slot) => `${slot.dia_semana}_${slot.codigo}`);

      const testGene = { ...gene, horarios: newSchedule };
      const validation = constraintManager.validateHardConstraints(testGene, {
        allGenes: cromossomo.genes,
        professores: context.professores,
        salas: context.salas,
        disciplinas: context.disciplinas,
        turma: context.turma,
      });

      if (validation.isValid) {
        gene.horarios = newSchedule;
        return true;
      }
    }

    return false;
  }

  /**
   * Obtém slots de horário disponíveis
   */
  private getAvailableTimeSlots(
    horarios: Horario[],
    cromossomo: Cromossomo,
    excludeGene: Gene
  ): Horario[] {
    const occupiedSlots = new Set<string>();

    // Marcar slots ocupados (excluindo o gene atual)
    for (const gene of cromossomo.genes) {
      if (gene !== excludeGene) {
        for (const horario of gene.horarios) {
          occupiedSlots.add(horario);
        }
      }
    }

    // Retornar horários disponíveis
    return horarios.filter((h) => {
      const slotKey = `${h.dia_semana}_${h.codigo}`;
      return !occupiedSlots.has(slotKey);
    });
  }

  /**
   * Realiza mutação aleatória quando não consegue resolver conflitos
   */
  private performRandomMutation(
    cromossomo: Cromossomo,
    context: ConflictContext
  ): void {
    if (cromossomo.genes.length === 0) return;

    const randomGeneIndex = Math.floor(Math.random() * cromossomo.genes.length);
    const gene = cromossomo.genes[randomGeneIndex];

    // Escolher tipo de mutação aleatoriamente
    const mutationType = Math.floor(Math.random() * 3);

    switch (mutationType) {
      case 0: // Alterar professor
        const randomProfessor =
          context.professores[
            Math.floor(Math.random() * context.professores.length)
          ];
        gene.professorId = randomProfessor.id;
        break;

      case 1: // Alterar sala
        const randomRoom =
          context.salas[Math.floor(Math.random() * context.salas.length)];
        gene.salaId = randomRoom.id;
        break;

      case 2: // Alterar horário
        const availableSlots = this.getAvailableTimeSlots(
          context.horarios,
          cromossomo,
          gene
        );
        if (availableSlots.length > 0) {
          const randomSlot =
            availableSlots[Math.floor(Math.random() * availableSlots.length)];
          gene.horarios = [`${randomSlot.dia_semana}_${randomSlot.codigo}`];
        }
        break;
    }
  }

  /**
   * Gera relatório detalhado de conflitos
   */
  public generateDetailedReport(
    cromossomo: Cromossomo,
    context: ConflictContext
  ): string {
    const conflicts = this.analyzeConflicts(cromossomo, context);

    let report = `=== RELATÓRIO DE CONFLITOS ===\n`;
    report += `Total de conflitos: ${conflicts.totalConflicts}\n\n`;

    report += `Conflitos por tipo:\n`;
    report += `- Sobreposição de professor: ${conflicts.conflictsByType.professorOverlap}\n`;
    report += `- Sobreposição de sala: ${conflicts.conflictsByType.roomOverlap}\n`;
    report += `- Violação de capacidade: ${conflicts.conflictsByType.capacityViolation}\n`;
    report += `- Incompatibilidade de sala: ${conflicts.conflictsByType.roomTypeMismatch}\n`;
    report += `- Sobrecarga de professor: ${conflicts.conflictsByType.professorOverload}\n\n`;

    if (conflicts.conflictDetails.length > 0) {
      report += `Detalhes dos conflitos:\n`;
      conflicts.conflictDetails.forEach((conflict, index) => {
        report += `${index + 1}. [${conflict.severity.toUpperCase()}] ${conflict.description}\n`;
        if (conflict.suggestedFix) {
          report += `   Sugestão: ${conflict.suggestedFix}\n`;
        }
        report += `\n`;
      });
    }

    return report;
  }
}

export const conflictResolver = new ConflictResolver();
