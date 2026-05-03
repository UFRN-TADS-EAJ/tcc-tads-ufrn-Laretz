import { Cromossomo, Gene } from "./genetic-algorithm";
import {
  ProfessorInput,
  SalaInput,
  HorarioInput,
  DisciplinaInput,
  TurmaInput,
} from "./genetic-algorithm";

export interface SelectionResult {
  parent1: Cromossomo;
  parent2: Cromossomo;
}

export interface CrossoverResult {
  offspring1: Cromossomo;
  offspring2: Cromossomo;
}

export class GeneticOperators {
  private professores: ProfessorInput[];
  private salas: SalaInput[];
  private horarios: HorarioInput[];
  private disciplinas: DisciplinaInput[];
  private turma: TurmaInput;

  constructor(
    professores: ProfessorInput[],
    salas: SalaInput[],
    horarios: HorarioInput[],
    disciplinas: DisciplinaInput[],
    turma: TurmaInput
  ) {
    this.professores = professores;
    this.salas = salas;
    this.horarios = horarios;
    this.disciplinas = disciplinas;
    this.turma = turma;
  }

  /**
   * Seleção por Torneio
   * Seleciona dois pais através de torneios independentes
   */
  public tournamentSelection(
    population: Cromossomo[],
    tournamentSize: number = 3
  ): SelectionResult {
    const parent1 = this.runTournament(population, tournamentSize);
    const parent2 = this.runTournament(population, tournamentSize);

    return { parent1, parent2 };
  }

  private runTournament(
    population: Cromossomo[],
    tournamentSize: number
  ): Cromossomo {
    if (population.length === 0) {
      throw new Error("Population is empty");
    }

    let best = population[Math.floor(Math.random() * population.length)]!;

    for (let i = 1; i < tournamentSize; i++) {
      const candidate =
        population[Math.floor(Math.random() * population.length)]!;
      if (candidate.fitness > best.fitness) {
        best = candidate;
      }
    }

    return best;
  }

  /**
   * Seleção por Roleta
   * Probabilidade de seleção proporcional ao fitness
   */
  public rouletteSelection(population: Cromossomo[]): SelectionResult {
    const parent1 = this.selectByRoulette(population);
    const parent2 = this.selectByRoulette(population);

    return { parent1, parent2 };
  }

  private selectByRoulette(population: Cromossomo[]): Cromossomo {
    // Normalizar fitness para valores positivos
    const minFitness = Math.min(...population.map((c) => c.fitness));
    const adjustedFitness = population.map((c) => c.fitness - minFitness + 1);
    const totalFitness = adjustedFitness.reduce((sum, f) => sum + f, 0);

    let random = Math.random() * totalFitness;

    for (let i = 0; i < population.length; i++) {
      random -= adjustedFitness[i];
      if (random <= 0) {
        return population[i];
      }
    }

    return population[population.length - 1];
  }

  /**
   * Crossover de Um Ponto
   * Troca genes após um ponto de corte aleatório
   */
  public singlePointCrossover(
    parent1: Cromossomo,
    parent2: Cromossomo,
    crossoverRate: number = 0.8
  ): CrossoverResult {
    if (Math.random() > crossoverRate) {
      return {
        offspring1: { ...parent1, fitness: 0 },
        offspring2: { ...parent2, fitness: 0 },
      };
    }

    const crossoverPoint = Math.floor(Math.random() * parent1.genes.length);

    const offspring1Genes = [
      ...parent1.genes.slice(0, crossoverPoint),
      ...parent2.genes.slice(crossoverPoint),
    ];

    const offspring2Genes = [
      ...parent2.genes.slice(0, crossoverPoint),
      ...parent1.genes.slice(crossoverPoint),
    ];

    return {
      offspring1: { genes: offspring1Genes, fitness: 0 },
      offspring2: { genes: offspring2Genes, fitness: 0 },
    };
  }

  /**
   * Crossover Uniforme
   * Para cada gene, escolhe aleatoriamente de qual pai herdar
   */
  public uniformCrossover(
    parent1: Cromossomo,
    parent2: Cromossomo,
    crossoverRate: number = 0.8
  ): CrossoverResult {
    if (Math.random() > crossoverRate) {
      return {
        offspring1: { ...parent1, fitness: 0 },
        offspring2: { ...parent2, fitness: 0 },
      };
    }

    const offspring1Genes: Gene[] = [];
    const offspring2Genes: Gene[] = [];

    for (let i = 0; i < parent1.genes.length; i++) {
      if (Math.random() < 0.5) {
        offspring1Genes.push({ ...parent1.genes[i] });
        offspring2Genes.push({ ...parent2.genes[i] });
      } else {
        offspring1Genes.push({ ...parent2.genes[i] });
        offspring2Genes.push({ ...parent1.genes[i] });
      }
    }

    return {
      offspring1: { genes: offspring1Genes, fitness: 0 },
      offspring2: { genes: offspring2Genes, fitness: 0 },
    };
  }

  /**
   * Crossover Baseado em Ordem (OX)
   * Preserva a ordem relativa dos genes
   */
  public orderCrossover(
    parent1: Cromossomo,
    parent2: Cromossomo,
    crossoverRate: number = 0.8
  ): CrossoverResult {
    if (Math.random() > crossoverRate) {
      return {
        offspring1: { ...parent1, fitness: 0 },
        offspring2: { ...parent2, fitness: 0 },
      };
    }

    const length = parent1.genes.length;
    const start = Math.floor(Math.random() * length);
    const end = Math.floor(Math.random() * (length - start)) + start;

    const offspring1 = this.createOrderedOffspring(
      parent1,
      parent2,
      start,
      end
    );
    const offspring2 = this.createOrderedOffspring(
      parent2,
      parent1,
      start,
      end
    );

    return { offspring1, offspring2 };
  }

  private createOrderedOffspring(
    parent1: Cromossomo,
    parent2: Cromossomo,
    start: number,
    end: number
  ): Cromossomo {
    const offspring: Gene[] = new Array(parent1.genes.length);

    // Copiar segmento do parent1
    for (let i = start; i <= end; i++) {
      offspring[i] = { ...parent1.genes[i] };
    }

    // Preencher posições restantes com genes do parent2
    let parent2Index = 0;
    for (let i = 0; i < offspring.length; i++) {
      if (i < start || i > end) {
        while (parent2Index < parent2.genes.length) {
          const gene = parent2.genes[parent2Index];
          parent2Index++;

          // Verificar se o gene já existe no segmento copiado
          const exists = offspring
            .slice(start, end + 1)
            .some((g) => g && g.disciplinaId === gene.disciplinaId);

          if (!exists) {
            offspring[i] = { ...gene };
            break;
          }
        }
      }
    }

    return { genes: offspring, fitness: 0 };
  }

  /**
   * Mutação Simples
   * Altera aleatoriamente componentes de genes selecionados
   */
  public simpleMutation(
    cromossomo: Cromossomo,
    mutationRate: number = 0.1
  ): Cromossomo {
    const mutatedGenes = cromossomo.genes.map((gene) => {
      if (Math.random() < mutationRate) {
        return this.mutateGene(gene);
      }
      return { ...gene };
    });

    return { genes: mutatedGenes, fitness: 0 };
  }

  private mutateGene(gene: Gene): Gene {
    const mutationType = Math.random();
    const mutatedGene = { ...gene };

    if (mutationType < 0.33) {
      // Mutar professor
      const newProfessor =
        this.professores[Math.floor(Math.random() * this.professores.length)];
      mutatedGene.professorId = newProfessor.id;
    } else if (mutationType < 0.66) {
      // Mutar sala
      const disciplina = this.disciplinas.find(
        (d) => d.id === gene.disciplinaId
      );
      if (disciplina) {
        const salasCompativeis = this.salas.filter(
          (sala) =>
            sala.capacidade >= this.turma.num_alunos &&
            (disciplina.tipoSala === "Lab" ? sala.computadores > 0 : true)
        );
        if (salasCompativeis.length > 0) {
          const newSala =
            salasCompativeis[
              Math.floor(Math.random() * salasCompativeis.length)
            ];
          mutatedGene.salaId = newSala.id;
        }
      }
    } else {
      // Mutar horários
      const newHorarios = this.generateRandomHorarios(gene.horarios.length);
      mutatedGene.horarios = newHorarios;
    }

    return mutatedGene;
  }

  /**
   * Mutação por Troca
   * Troca posições de dois genes aleatórios
   */
  public swapMutation(
    cromossomo: Cromossomo,
    mutationRate: number = 0.1
  ): Cromossomo {
    if (Math.random() > mutationRate) {
      return { ...cromossomo, fitness: 0 };
    }

    const genes = [...cromossomo.genes];
    const index1 = Math.floor(Math.random() * genes.length);
    const index2 = Math.floor(Math.random() * genes.length);

    // Trocar genes
    [genes[index1], genes[index2]] = [genes[index2], genes[index1]];

    return { genes, fitness: 0 };
  }

  /**
   * Mutação por Inserção
   * Remove um gene e o insere em outra posição
   */
  public insertionMutation(
    cromossomo: Cromossomo,
    mutationRate: number = 0.1
  ): Cromossomo {
    if (Math.random() > mutationRate) {
      return { ...cromossomo, fitness: 0 };
    }

    const genes = [...cromossomo.genes];
    const removeIndex = Math.floor(Math.random() * genes.length);
    const insertIndex = Math.floor(Math.random() * genes.length);

    const [removedGene] = genes.splice(removeIndex, 1);
    genes.splice(insertIndex, 0, removedGene);

    return { genes, fitness: 0 };
  }

  /**
   * Mutação Adaptativa
   * Ajusta a taxa de mutação baseada na diversidade da população
   */
  public adaptiveMutation(
    cromossomo: Cromossomo,
    population: Cromossomo[],
    baseMutationRate: number = 0.1
  ): Cromossomo {
    const diversity = this.calculatePopulationDiversity(population);
    const adaptedRate = baseMutationRate * (1 + (1 - diversity));

    return this.simpleMutation(cromossomo, adaptedRate);
  }

  private calculatePopulationDiversity(population: Cromossomo[]): number {
    if (population.length < 2) return 1;

    let totalDistance = 0;
    let comparisons = 0;

    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        totalDistance += this.calculateChromosomeDistance(
          population[i],
          population[j]
        );
        comparisons++;
      }
    }

    const averageDistance = totalDistance / comparisons;
    const maxPossibleDistance = population[0].genes.length;

    return Math.min(1, averageDistance / maxPossibleDistance);
  }

  private calculateChromosomeDistance(
    chromo1: Cromossomo,
    chromo2: Cromossomo
  ): number {
    let differences = 0;

    for (let i = 0; i < chromo1.genes.length; i++) {
      const gene1 = chromo1.genes[i];
      const gene2 = chromo2.genes[i];

      if (gene1.professorId !== gene2.professorId) differences++;
      if (gene1.salaId !== gene2.salaId) differences++;
      if (JSON.stringify(gene1.horarios) !== JSON.stringify(gene2.horarios))
        differences++;
    }

    return differences;
  }

  private generateRandomHorarios(quantidade: number): string[] {
    const horariosDisponiveis = [...this.horarios];
    const selecionados: string[] = [];

    for (let i = 0; i < quantidade && horariosDisponiveis.length > 0; i++) {
      const index = Math.floor(Math.random() * horariosDisponiveis.length);
      const horario = horariosDisponiveis.splice(index, 1)[0];
      selecionados.push(`${horario.dia_semana}_${horario.codigo}`);
    }

    return selecionados;
  }

  /**
   * Operador de Reparo
   * Corrige genes que violam restrições críticas
   */
  public repairOperator(cromossomo: Cromossomo): Cromossomo {
    const repairedGenes = cromossomo.genes.map((gene) => {
      let repairedGene = { ...gene };

      // Verificar e corrigir compatibilidade de sala
      const disciplina = this.disciplinas.find(
        (d) => d.id === gene.disciplinaId
      );
      const sala = this.salas.find((s) => s.id === gene.salaId);

      if (disciplina && sala) {
        // Verificar capacidade
        if (sala.capacidade < this.turma.num_alunos) {
          const salasCompativeis = this.salas.filter(
            (s) =>
              s.capacidade >= this.turma.num_alunos &&
              (disciplina.tipoSala === "Lab" ? s.computadores > 0 : true)
          );
          if (salasCompativeis.length > 0) {
            const novaSala =
              salasCompativeis[
                Math.floor(Math.random() * salasCompativeis.length)
              ];
            repairedGene.salaId = novaSala.id;
          }
        }

        // Verificar tipo de sala
        if (disciplina.tipoSala === "Lab" && sala.computadores === 0) {
          const labs = this.salas.filter(
            (s) => s.computadores > 0 && s.capacidade >= this.turma.num_alunos
          );
          if (labs.length > 0) {
            const novoLab = labs[Math.floor(Math.random() * labs.length)];
            repairedGene.salaId = novoLab.id;
          }
        }
      }

      return repairedGene;
    });

    return { genes: repairedGenes, fitness: 0 };
  }

  /**
   * Operador de Melhoria Local
   * Aplica busca local para melhorar a solução
   */
  public localImprovement(cromossomo: Cromossomo): Cromossomo {
    let bestChromosome = { ...cromossomo };
    let improved = true;

    while (improved) {
      improved = false;

      for (let i = 0; i < bestChromosome.genes.length; i++) {
        // Tentar diferentes professores
        for (const professor of this.professores) {
          const testGenes = [...bestChromosome.genes];
          testGenes[i] = { ...testGenes[i], professorId: professor.id };
          const testChromosome = { genes: testGenes, fitness: 0 };

          // Se melhorou, aceitar mudança
          if (this.wouldImprove(testChromosome, bestChromosome)) {
            bestChromosome = testChromosome;
            improved = true;
            break;
          }
        }

        if (improved) break;

        // Tentar diferentes salas
        const disciplina = this.disciplinas.find(
          (d) => d.id === bestChromosome.genes[i].disciplinaId
        );
        if (disciplina) {
          const salasCompativeis = this.salas.filter(
            (sala) =>
              sala.capacidade >= this.turma.num_alunos &&
              (disciplina.tipoSala === "Lab" ? sala.computadores > 0 : true)
          );

          for (const sala of salasCompativeis) {
            const testGenes = [...bestChromosome.genes];
            testGenes[i] = { ...testGenes[i], salaId: sala.id };
            const testChromosome = { genes: testGenes, fitness: 0 };

            if (this.wouldImprove(testChromosome, bestChromosome)) {
              bestChromosome = testChromosome;
              improved = true;
              break;
            }
          }
        }

        if (improved) break;
      }
    }

    return bestChromosome;
  }

  private wouldImprove(candidate: Cromossomo, current: Cromossomo): boolean {
    // Implementação simplificada - na prática, calcularia o fitness real
    // Por agora, assume que qualquer mudança que não viole restrições críticas é boa
    return this.hasFewerConflicts(candidate, current);
  }

  private hasFewerConflicts(chromo1: Cromossomo, chromo2: Cromossomo): boolean {
    const conflicts1 = this.countConflicts(chromo1);
    const conflicts2 = this.countConflicts(chromo2);
    return conflicts1 < conflicts2;
  }

  private countConflicts(cromossomo: Cromossomo): number {
    let conflicts = 0;

    // Contar conflitos de professor
    const professorHorarios = new Map<string, Set<string>>();
    for (const gene of cromossomo.genes) {
      if (!professorHorarios.has(gene.professorId)) {
        professorHorarios.set(gene.professorId, new Set());
      }
      const horarios = professorHorarios.get(gene.professorId)!;

      for (const horario of gene.horarios) {
        if (horarios.has(horario)) {
          conflicts++;
        }
        horarios.add(horario);
      }
    }

    // Contar conflitos de sala
    const salaHorarios = new Map<string, Set<string>>();
    for (const gene of cromossomo.genes) {
      if (!salaHorarios.has(gene.salaId)) {
        salaHorarios.set(gene.salaId, new Set());
      }
      const horarios = salaHorarios.get(gene.salaId)!;

      for (const horario of gene.horarios) {
        if (horarios.has(horario)) {
          conflicts++;
        }
        horarios.add(horario);
      }
    }

    return conflicts;
  }
}
