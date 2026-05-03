export interface Gene {
  disciplinaId: string;
  professorId: string;
  salaId: string;
  horarios: string[];
}

export interface Cromossomo {
  genes: Gene[];
  fitness: number;
}

export interface GeneticAlgorithmParams {
  populationSize: number;
  minGenerations: number;
  generations: number;
  patience: number;
  fitnessTarget: number;
  mutationRate: number;
  crossoverRate: number;
  elitismRate: number;
}

export interface DisciplinaInput {
  id: string;
  nome: string;
  cargaHoraria: number;
  tipoSala: "Lab" | "Sala";
}

export interface ProfessorInput {
  id: string;
  nome: string;
  carga_horaria_max: number;
  preferencias?: string[];
}

export interface SalaInput {
  id: string;
  nome: string;
  capacidade: number;
  tipo: string;
  computadores: number;
}

export interface HorarioInput {
  id: string;
  codigo: string;
  dia_semana: string;
}

export interface TurmaInput {
  id: string;
  num_alunos: number;
  turno: string;
  disciplinas: DisciplinaInput[];
}

export class GeneticAlgorithm {
  private params: GeneticAlgorithmParams;
  private turma: TurmaInput;
  private professores: ProfessorInput[];
  private salas: SalaInput[];
  private horarios: HorarioInput[];
  private population: Cromossomo[];

  // metricas e taxas adaptativas dos operadores
  private operatorMetrics: {
    crossover: { successes: number; attempts: number };
    mutation: { successes: number; attempts: number };
  };
  private adaptiveCrossoverRate: number;
  private adaptiveMutationRate: number;
  private lastBestFitness: number;
  private stagnationCount: number;

  constructor(
    params: GeneticAlgorithmParams,
    turma: TurmaInput,
    professores: ProfessorInput[],
    salas: SalaInput[],
    horarios: HorarioInput[]
  ) {
    this.params = params;
    this.turma = turma;
    this.professores = professores;
    this.salas = salas;
    this.horarios = horarios;
    this.population = [];

    this.operatorMetrics = {
      crossover: { successes: 0, attempts: 0 },
      mutation: { successes: 0, attempts: 0 },
    };
    this.adaptiveCrossoverRate = params.crossoverRate;
    this.adaptiveMutationRate = params.mutationRate;
    this.lastBestFitness = 0;
    this.stagnationCount = 0;
  }

  // executa o algoritmo genetico e retorna o melhor cromossomo encontrado
  public async execute(): Promise<Cromossomo> {
    this.initializePopulation();

    const maxGenerations = this.params.generations;
    const minGenerations = this.params.minGenerations ?? 60;
    const patience = this.params.patience ?? 50;
    const fitnessTarget = this.params.fitnessTarget ?? 1300;

    let best = null as unknown as Cromossomo;
    let lastBestFitness = -Infinity;
    let stagnationCount = 0;

    for (let gen = 0; gen < maxGenerations; gen++) {
      this.evaluatePopulation();
      const currentBest = this.getBestChromosome();

      if (!best || currentBest.fitness > best.fitness) {
        best = currentBest;
      }

      if (currentBest.fitness <= lastBestFitness) {
        stagnationCount++;
      } else {
        stagnationCount = 0;
      }

      lastBestFitness = currentBest.fitness;

      const reachedTarget = best.fitness >= fitnessTarget;
      const passedMinimum = gen >= minGenerations;
      const stagnated = stagnationCount >= patience;

      if (reachedTarget && passedMinimum && stagnated) {
        break;
      }

      if (gen < maxGenerations - 1) {
        this.adaptOperatorRates(currentBest.fitness);
        this.evolveGeneration();
      }
    }

    this.evaluatePopulation();
    return this.getBestChromosome();
  }

  // cria a populacao inicial usando heuristicas e etapa de reparo
  private initializePopulation(): void {
    this.population = [];

    for (let i = 0; i < this.params.populationSize; i++) {
      let cromossomo = this.createRandomChromosome();
      cromossomo = this.repairChromosome(cromossomo);
      this.population.push(cromossomo);
    }
  }

  // monta um cromossomo selecionando professor, sala e horarios por disciplina
  private createRandomChromosome(): Cromossomo {
    const genes: Gene[] = [];
    const usedProfessorHorarios = new Map<string, Set<string>>();
    const usedSalaHorarios = new Map<string, Set<string>>();

    for (const disciplina of this.turma.disciplinas) {
      const professor = this.selectBestProfessor(
        disciplina,
        usedProfessorHorarios
      );

      const sala = this.selectBestSala(disciplina, usedSalaHorarios);

      const distribuicaoAulas = this.calculateClassDistribution(
        disciplina.cargaHoraria
      );
      const horariosEscolhidos = this.selectOptimalHorariosWithDistribution(
        distribuicaoAulas,
        usedProfessorHorarios.get(professor.id) || new Set(),
        usedSalaHorarios.get(sala.id) || new Set()
      );

      if (!usedProfessorHorarios.has(professor.id)) {
        usedProfessorHorarios.set(professor.id, new Set());
      }
      if (!usedSalaHorarios.has(sala.id)) {
        usedSalaHorarios.set(sala.id, new Set());
      }

      horariosEscolhidos.forEach((horario) => {
        usedProfessorHorarios.get(professor.id)!.add(horario);
        usedSalaHorarios.get(sala.id)!.add(horario);
      });

      genes.push({
        disciplinaId: disciplina.id,
        professorId: professor.id,
        salaId: sala.id,
        horarios: horariosEscolhidos,
      });
    }

    return {
      genes,
      fitness: 0,
    };
  }

  // calcula a distribuicao semanal preferida a partir da carga horaria
  private calculateClassDistribution(cargaHoraria: number): {
    aulasSemanais: number;
    preferirConsecutivas: boolean;
    totalAulas: number;
    distribuicaoTipo:
      | "2-mesmo-dia"
      | "3-mesmo-dia"
      | "4-dois-dias"
      | "6-dois-dias"
      | "padrao";
  } {
    const totalAulas = Math.ceil(cargaHoraria * 1.2);

    if (cargaHoraria === 90) {
      return {
        aulasSemanais: 6,
        preferirConsecutivas: true,
        totalAulas,
        distribuicaoTipo: "6-dois-dias",
      };
    } else if (cargaHoraria === 60) {
      return {
        aulasSemanais: 4,
        preferirConsecutivas: false,
        totalAulas,
        distribuicaoTipo: "4-dois-dias",
      };
    } else if (cargaHoraria === 45) {
      return {
        aulasSemanais: 3,
        preferirConsecutivas: true,
        totalAulas,
        distribuicaoTipo: "3-mesmo-dia",
      };
    } else if (cargaHoraria === 30) {
      return {
        aulasSemanais: 2,
        preferirConsecutivas: true,
        totalAulas,
        distribuicaoTipo: "2-mesmo-dia",
      };
    } else {
      return {
        aulasSemanais: Math.min(4, Math.ceil(cargaHoraria / 15)),
        preferirConsecutivas: false,
        totalAulas,
        distribuicaoTipo: "padrao",
      };
    }
  }

  // seleciona horarios com base no tipo de distribuicao e disponibilidade
  private selectOptimalHorariosWithDistribution(
    distribuicao: {
      aulasSemanais: number;
      preferirConsecutivas: boolean;
      totalAulas: number;
      distribuicaoTipo: string;
    },
    professorHorariosUsados: Set<string>,
    salaHorariosUsados: Set<string>
  ): string[] {
    const horariosDisponiveis = this.filterByTurnoPreference(
      this.horarios
    ).filter(
      (h) =>
        !professorHorariosUsados.has(`${h.dia_semana}_${h.codigo}`) &&
        !salaHorariosUsados.has(`${h.dia_semana}_${h.codigo}`)
    );

    if (horariosDisponiveis.length === 0) {
      return this.selectRandomHorarios(distribuicao.aulasSemanais);
    }

    switch (distribuicao.distribuicaoTipo) {
      case "2-mesmo-dia": {
        const horarios2Consecutivos = this.findConsecutiveHorarios(
          horariosDisponiveis,
          2
        );
        if (horarios2Consecutivos.length === 2) {
          return horarios2Consecutivos;
        }
        const sameDayHorarios = this.findSameDayHorarios(
          horariosDisponiveis,
          2
        );
        if (sameDayHorarios.length === 2) {
          return sameDayHorarios;
        }
        break;
      }

      case "3-mesmo-dia": {
        const horarios3Consecutivos = this.findConsecutiveHorarios(
          horariosDisponiveis,
          3
        );
        if (horarios3Consecutivos.length === 3) {
          return horarios3Consecutivos;
        }
        const sameDayHorarios = this.findSameDayHorarios(
          horariosDisponiveis,
          3
        );
        if (sameDayHorarios.length === 3) {
          return sameDayHorarios;
        }
        break;
      }

      case "4-dois-dias": {
        const distribuicao2x2 =
          this.findTwoByTwoDistribution(horariosDisponiveis);
        if (distribuicao2x2.length === 4) {
          return distribuicao2x2;
        }
        const distributedHorarios = this.findDistributedHorarios(
          horariosDisponiveis,
          4,
          2
        );
        if (distributedHorarios.length === 4) {
          return distributedHorarios;
        }
        break;
      }

      case "6-dois-dias": {
        const distribuicao3x3 =
          this.findThreeByThreeDistribution(horariosDisponiveis);
        if (distribuicao3x3.length === 6) {
          return distribuicao3x3;
        }
        const distributedHorarios = this.findDistributedHorarios(
          horariosDisponiveis,
          6,
          2
        );
        if (distributedHorarios.length === 6) {
          return distributedHorarios;
        }
        break;
      }
    }

    const horariosDistribuidos = this.selectDistributedHorarios(
      horariosDisponiveis,
      distribuicao.aulasSemanais
    );
    if (horariosDistribuidos.length === distribuicao.aulasSemanais) {
      return horariosDistribuidos;
    }

    return this.selectRandomHorarios(distribuicao.aulasSemanais);
  }

  // encontra horarios consecutivos no mesmo dia
  private findConsecutiveHorarios(
    horarios: HorarioInput[],
    quantidade: number
  ): string[] {
    const diasDisponiveis = [...new Set(horarios.map((h) => h.dia_semana))];

    for (const dia of diasDisponiveis) {
      const horariosDoDia = horarios
        .filter((h) => h.dia_semana === dia)
        .sort((a, b) => a.codigo.localeCompare(b.codigo));

      if (horariosDoDia.length >= quantidade) {
        for (let i = 0; i <= horariosDoDia.length - quantidade; i++) {
          const consecutivos = horariosDoDia.slice(i, i + quantidade);
          const saoConsecutivos = this.areHorariosConsecutive(consecutivos);

          if (saoConsecutivos) {
            return consecutivos.map((h) => `${h.dia_semana}_${h.codigo}`);
          }
        }
      }
    }

    return [];
  }

  // encontra horarios no mesmo dia, priorizando consecutivos quando possivel
  private findSameDayHorarios(
    horarios: HorarioInput[],
    quantidade: number
  ): string[] {
    const diasDisponiveis = [...new Set(horarios.map((h) => h.dia_semana))];

    for (const dia of diasDisponiveis) {
      const horariosDoDia = horarios.filter((h) => h.dia_semana === dia);

      if (horariosDoDia.length >= quantidade) {
        const horariosOrdenados = horariosDoDia.sort((a, b) =>
          a.codigo.localeCompare(b.codigo)
        );

        for (let i = 0; i <= horariosOrdenados.length - quantidade; i++) {
          const consecutivos = horariosOrdenados.slice(i, i + quantidade);
          if (this.areHorariosConsecutive(consecutivos)) {
            return consecutivos.map((h) => `${h.dia_semana}_${h.codigo}`);
          }
        }

        const totalHorarios = horariosOrdenados.length;
        const intervalo = Math.max(1, Math.floor(totalHorarios / quantidade));
        const selecionados: HorarioInput[] = [];

        for (let i = 0; i < quantidade && i * intervalo < totalHorarios; i++) {
          const index = Math.min(i * intervalo, totalHorarios - 1);
          const selecionado = horariosOrdenados[index];
          if (selecionado) {
            selecionados.push(selecionado);
          }
        }

        while (
          selecionados.length < quantidade &&
          selecionados.length < totalHorarios
        ) {
          for (const horario of horariosOrdenados) {
            if (!selecionados.includes(horario)) {
              selecionados.push(horario);
              if (selecionados.length >= quantidade) break;
            }
          }
        }

        return selecionados.map((h) => `${h.dia_semana}_${h.codigo}`);
      }
    }

    return [];
  }

  // distribui horarios em dias diferentes
  private findDistributedHorarios(
    horarios: HorarioInput[],
    totalAulas: number,
    diasDesejados: number
  ): string[] {
    const diasDisponiveis = [...new Set(horarios.map((h) => h.dia_semana))];

    if (diasDisponiveis.length < diasDesejados) {
      return [];
    }

    const aulasPorDia = Math.ceil(totalAulas / diasDesejados);
    const resultado: string[] = [];

    for (let i = 0; i < diasDesejados && resultado.length < totalAulas; i++) {
      const dia = diasDisponiveis[i];
      const horariosDoDia = horarios.filter((h) => h.dia_semana === dia);

      const aulasParaEsseDia = Math.min(
        aulasPorDia,
        totalAulas - resultado.length
      );
      const horariosEscolhidos = horariosDoDia
        .sort((a, b) => a.codigo.localeCompare(b.codigo))
        .slice(0, aulasParaEsseDia);

      resultado.push(
        ...horariosEscolhidos.map((h) => `${h.dia_semana}_${h.codigo}`)
      );
    }

    return resultado;
  }

  // encontra distribuicao 2+2 para quatro aulas semanais
  private findTwoByTwoDistribution(horarios: HorarioInput[]): string[] {
    const diasDisponiveis = [...new Set(horarios.map((h) => h.dia_semana))];

    for (let i = 0; i < diasDisponiveis.length; i++) {
      for (let j = i + 1; j < diasDisponiveis.length; j++) {
        const dia1 = diasDisponiveis[i];
        const dia2 = diasDisponiveis[j];

        const horariosDia1 = horarios.filter((h) => h.dia_semana === dia1);
        const horariosDia2 = horarios.filter((h) => h.dia_semana === dia2);

        if (horariosDia1.length >= 2 && horariosDia2.length >= 2) {
          const consecutivosDia1 = this.findConsecutiveHorarios(
            horariosDia1,
            2
          );
          const consecutivosDia2 = this.findConsecutiveHorarios(
            horariosDia2,
            2
          );

          if (consecutivosDia1.length === 2 && consecutivosDia2.length === 2) {
            return [...consecutivosDia1, ...consecutivosDia2];
          }
        }
      }
    }

    return [];
  }

  // encontra distribuicao 3+3 para seis aulas semanais
  private findThreeByThreeDistribution(horarios: HorarioInput[]): string[] {
    const diasDisponiveis = [...new Set(horarios.map((h) => h.dia_semana))];

    for (let i = 0; i < diasDisponiveis.length; i++) {
      for (let j = i + 1; j < diasDisponiveis.length; j++) {
        const dia1 = diasDisponiveis[i];
        const dia2 = diasDisponiveis[j];

        const horariosDia1 = horarios.filter((h) => h.dia_semana === dia1);
        const horariosDia2 = horarios.filter((h) => h.dia_semana === dia2);

        if (horariosDia1.length >= 3 && horariosDia2.length >= 3) {
          const consecutivosDia1 = this.findConsecutiveHorarios(
            horariosDia1,
            3
          );
          const consecutivosDia2 = this.findConsecutiveHorarios(
            horariosDia2,
            3
          );

          if (consecutivosDia1.length === 3 && consecutivosDia2.length === 3) {
            return [...consecutivosDia1, ...consecutivosDia2];
          }
        }
      }
    }

    return [];
  }

  // valida se uma lista de horarios e consecutiva pela ordem do codigo
  private areHorariosConsecutive(horarios: HorarioInput[]): boolean {
    if (horarios.length < 2) return true;

    const codigos = horarios.map((h) => h.codigo).sort();

    for (let i = 1; i < codigos.length; i++) {
      const atual = this.getHorarioNumber(codigos[i]);
      const anterior = this.getHorarioNumber(codigos[i - 1]);

      if (atual !== anterior + 1) {
        return false;
      }
    }

    return true;
  }

  // extrai a parte numerica do codigo do horario
  private getHorarioNumber(codigo: string): number {
    const match = codigo.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  // seleciona horarios aleatorios aplicando filtro de turno quando possivel
  private selectRandomHorarios(quantidade: number): string[] {
    const horariosDisponiveis = [...this.horarios];
    const selecionados: string[] = [];

    const horariosFiltrados = this.filterByTurnoPreference(horariosDisponiveis);
    const horariosParaUsar =
      horariosFiltrados.length >= quantidade
        ? horariosFiltrados
        : horariosDisponiveis;

    for (let i = 0; i < quantidade && horariosParaUsar.length > 0; i++) {
      const index = Math.floor(Math.random() * horariosParaUsar.length);
      const horario = horariosParaUsar.splice(index, 1)[0];
      selecionados.push(`${horario.dia_semana}_${horario.codigo}`);
    }

    return selecionados;
  }

  // seleciona horarios com distribuicao equilibrada entre dias
  private selectDistributedHorarios(
    horariosDisponiveis: HorarioInput[],
    quantidade: number
  ): string[] {
    if (horariosDisponiveis.length === 0 || quantidade === 0) {
      return [];
    }

    const horariosPorDia = new Map<string, HorarioInput[]>();
    for (const horario of horariosDisponiveis) {
      if (!horariosPorDia.has(horario.dia_semana)) {
        horariosPorDia.set(horario.dia_semana, []);
      }
      horariosPorDia.get(horario.dia_semana)!.push(horario);
    }

    const selecionados: string[] = [];
    const dias = Array.from(horariosPorDia.keys());

    for (let i = 0; i < quantidade && selecionados.length < quantidade; i++) {
      const diaIndex = i % dias.length;
      const dia = dias[diaIndex];
      const horariosNoDia = horariosPorDia.get(dia) || [];

      if (horariosNoDia.length > 0) {
        const middleIndex = Math.floor(horariosNoDia.length / 2);
        const horarioEscolhido = horariosNoDia[middleIndex];

        const horarioKey = `${horarioEscolhido.dia_semana}_${horarioEscolhido.codigo}`;
        if (!selecionados.includes(horarioKey)) {
          selecionados.push(horarioKey);
          horariosNoDia.splice(middleIndex, 1);
        }
      }
    }

    while (selecionados.length < quantidade) {
      const horariosRestantes = horariosDisponiveis.filter((h) => {
        const key = `${h.dia_semana}_${h.codigo}`;
        return !selecionados.includes(key);
      });

      if (horariosRestantes.length === 0) break;

      const index = Math.floor(Math.random() * horariosRestantes.length);
      const horario = horariosRestantes[index];
      selecionados.push(`${horario.dia_semana}_${horario.codigo}`);
    }

    return selecionados;
  }

  // seleciona professor considerando carga e heuristica simples de especializacao
  private selectBestProfessor(
    disciplina: DisciplinaInput,
    usedProfessorHorarios: Map<string, Set<string>>
  ): ProfessorInput {
    const professoresHabilitados = this.professores.filter((prof) => {
      if (
        disciplina.nome.toLowerCase().includes("banco") ||
        disciplina.nome.toLowerCase().includes("bd")
      ) {
        return (
          prof.nome.toLowerCase().includes("carla") ||
          prof.nome.toLowerCase().includes("edson")
        );
      }
      if (
        disciplina.nome.toLowerCase().includes("física") ||
        disciplina.nome.toLowerCase().includes("fis")
      ) {
        return prof.nome.toLowerCase().includes("leonardo");
      }
      if (
        disciplina.nome.toLowerCase().includes("web") ||
        disciplina.nome.toLowerCase().includes("mobile")
      ) {
        return prof.nome.toLowerCase().includes("taniro");
      }
      if (
        disciplina.nome.toLowerCase().includes("interação") ||
        disciplina.nome.toLowerCase().includes("ihc")
      ) {
        return prof.nome.toLowerCase().includes("tasia");
      }
      if (disciplina.nome.toLowerCase().includes("redes")) {
        return prof.nome.toLowerCase().includes("antonino");
      }
      return true;
    });

    const professoresDisponiveis = professoresHabilitados.filter((prof) => {
      const horariosUsados = usedProfessorHorarios.get(prof.id)?.size || 0;
      return horariosUsados < prof.carga_horaria_max;
    });

    if (professoresDisponiveis.length === 0) {
      const todosDisponiveis = this.professores.filter((prof) => {
        const horariosUsados = usedProfessorHorarios.get(prof.id)?.size || 0;
        return horariosUsados < prof.carga_horaria_max;
      });

      if (todosDisponiveis.length === 0) {
        return this.professores[
          Math.floor(Math.random() * this.professores.length)
        ];
      }

      return todosDisponiveis[
        Math.floor(Math.random() * todosDisponiveis.length)
      ];
    }

    professoresDisponiveis.sort((a, b) => {
      const horariosA = usedProfessorHorarios.get(a.id)?.size || 0;
      const horariosB = usedProfessorHorarios.get(b.id)?.size || 0;
      return horariosA - horariosB;
    });

    const topCandidates = professoresDisponiveis.slice(
      0,
      Math.min(3, professoresDisponiveis.length)
    );
    return topCandidates[Math.floor(Math.random() * topCandidates.length)];
  }

  // seleciona sala considerando compatibilidade, disponibilidade e capacidade
  private selectBestSala(
    disciplina: DisciplinaInput,
    usedSalaHorarios: Map<string, Set<string>>
  ): SalaInput {
    const salasCompativeis = this.salas.filter(
      (sala) =>
        sala.capacidade >= this.turma.num_alunos &&
        (disciplina.tipoSala === "Lab" ? sala.computadores > 0 : true)
    );

    if (salasCompativeis.length === 0) {
      return this.salas[Math.floor(Math.random() * this.salas.length)];
    }

    salasCompativeis.sort((a, b) => {
      const horariosA = usedSalaHorarios.get(a.id)?.size || 0;
      const horariosB = usedSalaHorarios.get(b.id)?.size || 0;

      if (horariosA !== horariosB) {
        return horariosA - horariosB;
      }

      const excessoA = a.capacidade - this.turma.num_alunos;
      const excessoB = b.capacidade - this.turma.num_alunos;
      return excessoA - excessoB;
    });

    const topCandidates = salasCompativeis.slice(
      0,
      Math.min(2, salasCompativeis.length)
    );
    return topCandidates[Math.floor(Math.random() * topCandidates.length)];
  }

  // seleciona horarios preferindo o turno da turma e evitando sabado quando possivel
  private selectOptimalHorarios(
    quantidade: number,
    professorHorariosUsados: Set<string>,
    salaHorariosUsados: Set<string>
  ): string[] {
    const horariosDisponiveis = this.horarios.filter((horario) => {
      const horarioKey = `${horario.dia_semana}_${horario.codigo}`;
      return (
        !professorHorariosUsados.has(horarioKey) &&
        !salaHorariosUsados.has(horarioKey)
      );
    });

    const horariosPreferidos =
      this.filterByTurnoPreference(horariosDisponiveis);
    const horariosSemSabado = horariosPreferidos.filter(
      (h) => h.dia_semana !== "SABADO"
    );

    const horariosParaUsar =
      horariosSemSabado.length >= quantidade
        ? horariosSemSabado
        : horariosPreferidos;

    const selecionados: string[] = [];
    const horariosRestantes = [...horariosParaUsar];

    if (quantidade === 1) {
      const index = Math.floor(Math.random() * horariosRestantes.length);
      const horario = horariosRestantes[index];
      return [`${horario.dia_semana}_${horario.codigo}`];
    }

    const consecutivos = this.findConsecutiveHorarios(
      horariosParaUsar,
      quantidade
    );
    if (consecutivos.length === quantidade) {
      return consecutivos;
    }

    const distribuidos = this.findSameDayHorarios(horariosParaUsar, quantidade);
    if (distribuidos.length === quantidade) {
      return distribuidos;
    }

    for (let i = 0; i < quantidade && horariosRestantes.length > 0; i++) {
      let horarioEscolhido;

      if (selecionados.length > 0) {
        const ultimoHorario = selecionados[selecionados.length - 1];
        const [ultimoDia, ultimoCodigo] = ultimoHorario.split("_");

        horarioEscolhido = this.findSequentialHorario(
          horariosRestantes,
          ultimoDia,
          ultimoCodigo
        );
      }

      if (!horarioEscolhido) {
        const index = Math.floor(Math.random() * horariosRestantes.length);
        horarioEscolhido = horariosRestantes[index];
      }

      const horarioKey = `${horarioEscolhido.dia_semana}_${horarioEscolhido.codigo}`;
      selecionados.push(horarioKey);

      const indexToRemove = horariosRestantes.findIndex(
        (h) =>
          h.dia_semana === horarioEscolhido.dia_semana &&
          h.codigo === horarioEscolhido.codigo
      );
      if (indexToRemove !== -1) {
        horariosRestantes.splice(indexToRemove, 1);
      }
    }

    return selecionados;
  }

  // filtra horarios pelo turno da turma com fallback para slots proximos
  private filterByTurnoPreference(horarios: HorarioInput[]): HorarioInput[] {
    const turnoPreferido = this.turma.turno.toUpperCase();

    const codigosPorTurno = {
      MATUTINO: ["M1", "M2", "M3", "M4", "M5", "M6"],
      VESPERTINO: ["T1", "T2", "T3", "T4", "T5", "T6"],
      NOTURNO: ["N1", "N2", "N3", "N4"],
    };

    const codigosPreferidos =
      codigosPorTurno[turnoPreferido as keyof typeof codigosPorTurno] || [];

    const horariosPreferidos = horarios.filter((h) =>
      codigosPreferidos.includes(h.codigo)
    );

    if (horariosPreferidos.length > 0) {
      return horariosPreferidos;
    }

    if (turnoPreferido === "MATUTINO") {
      const horariosProximos = horarios.filter((h) =>
        ["T1", "T2"].includes(h.codigo)
      );
      if (horariosProximos.length > 0) return horariosProximos;
    } else if (turnoPreferido === "VESPERTINO") {
      const horariosProximos = horarios.filter((h) =>
        ["M5", "M6", "N1"].includes(h.codigo)
      );
      if (horariosProximos.length > 0) return horariosProximos;
    }

    return horarios;
  }

  // encontra o proximo codigo sequencial no mesmo dia
  private findSequentialHorario(
    horarios: HorarioInput[],
    dia: string,
    ultimoCodigo: string
  ): HorarioInput | null {
    const sequenciaMap: { [key: string]: number } = {
      M1: 1,
      M2: 2,
      M3: 3,
      M4: 4,
      M5: 5,
      M6: 6,
      T1: 1,
      T2: 2,
      T3: 3,
      T4: 4,
      T5: 5,
      T6: 6,
      N1: 1,
      N2: 2,
      N3: 3,
      N4: 4,
    };

    const numeroMap: { [key: number]: { [key: string]: string } } = {
      1: { M: "M2", T: "T2", N: "N2" },
      2: { M: "M3", T: "T3", N: "N3" },
      3: { M: "M4", T: "T4", N: "N4" },
      4: { M: "M5", T: "T5" },
      5: { M: "M6", T: "T6" },
    };

    const numeroAtual = sequenciaMap[ultimoCodigo];
    const turno = ultimoCodigo.charAt(0);

    if (
      numeroAtual &&
      numeroMap[numeroAtual] &&
      numeroMap[numeroAtual][turno]
    ) {
      const proximoCodigo = numeroMap[numeroAtual][turno];

      return (
        horarios.find(
          (h) => h.dia_semana === dia && h.codigo === proximoCodigo
        ) || null
      );
    }

    return null;
  }

  // calcula o fitness de cada cromossomo na populacao
  private evaluatePopulation(): void {
    for (const cromossomo of this.population) {
      cromossomo.fitness = this.calculateFitness(cromossomo);
    }
  }

  // calcula fitness usando hard constraints como factibilidade e soft como qualidade
  private calculateFitness(cromossomo: Cromossomo): number {
    const { constraintManager } = require("./constraints");

    let totalFitness = 0;
    const context = {
      professores: this.professores,
      salas: this.salas,
      horarios: this.horarios,
      disciplinas: this.turma.disciplinas,
      turma: this.turma,
      allGenes: cromossomo.genes,
    };

    let invalidHardCount = 0;
    for (const gene of cromossomo.genes) {
      const hardValidation = constraintManager.validateHardConstraints(
        gene,
        context
      );
      if (!hardValidation.isValid) {
        invalidHardCount++;
        continue;
      }

      let geneFitness = 100;

      const hardPenalty = constraintManager.getHardConstraintPenalty(
        gene,
        context
      );
      geneFitness -= hardPenalty;

      const softScore = constraintManager.calculateSoftScore(gene, context);
      geneFitness += softScore;

      totalFitness += Math.max(0, geneFitness);
    }

    if (invalidHardCount > 0) {
      return 0;
    }

    totalFitness += this.calculateGlobalBonuses(cromossomo);

    return Math.max(0, totalFitness);
  }

  // calcula bonus globais do cromossomo
  private calculateGlobalBonuses(cromossomo: Cromossomo): number {
    let bonus = 0;

    const conflicts = this.checkConflicts(cromossomo);
    if (conflicts.professorConflicts === 0) bonus += 50;
    if (conflicts.salaConflicts === 0) bonus += 50;

    bonus += this.calculateDistributionBonus(cromossomo);

    bonus += this.calculateSaturdayAvoidanceBonus(cromossomo);

    bonus += this.calculateTurnoAlignmentBonus(cromossomo);

    bonus += this.calculateDayDistributionBonus(cromossomo);

    bonus += this.calculateSequentialClassBonus(cromossomo);

    bonus += this.calculateTimeDistributionBonus(cromossomo);

    return bonus;
  }

  // calcula bonus de distribuicao equilibrada ao longo do dia
  private calculateTimeDistributionBonus(cromossomo: Cromossomo): number {
    let bonus = 0;
    const horariosCount = new Map<string, number>();

    cromossomo.genes.forEach((gene) => {
      gene.horarios.forEach((horario) => {
        const horarioCode = horario.split("_")[1];
        horariosCount.set(
          horarioCode,
          (horariosCount.get(horarioCode) || 0) + 1
        );
      });
    });

    const primeirosPeriodos = ["M1", "M2", "T1", "T2", "N1", "N2"];
    const ultimosPeriodos = ["M5", "M6", "T5", "T6", "N5", "N6"];

    let aulasPrimeiros = 0;
    let aulasUltimos = 0;
    let totalAulas = 0;

    primeirosPeriodos.forEach((periodo) => {
      const count = horariosCount.get(periodo) || 0;
      aulasPrimeiros += count;
      totalAulas += count;
    });

    ultimosPeriodos.forEach((periodo) => {
      const count = horariosCount.get(periodo) || 0;
      aulasUltimos += count;
      totalAulas += count;
    });

    const periodosMeio = ["M3", "M4", "T3", "T4", "N3", "N4"];
    let aulasMeio = 0;
    periodosMeio.forEach((periodo) => {
      const count = horariosCount.get(periodo) || 0;
      aulasMeio += count;
      totalAulas += count;
    });

    if (totalAulas > 0) {
      const proporcaoPrimeiros = aulasPrimeiros / totalAulas;
      const proporcaoMeio = aulasMeio / totalAulas;
      const proporcaoUltimos = aulasUltimos / totalAulas;

      if (proporcaoMeio > 0.4) bonus += 30;
      if (proporcaoPrimeiros < 0.3) bonus += 20;
      if (proporcaoUltimos < 0.3) bonus += 10;
      if (proporcaoPrimeiros > 0.5) bonus -= 40;
      if (proporcaoPrimeiros > 0.7) bonus -= 60;
    }

    return bonus;
  }

  // bonifica distribuicao equilibrada de aulas ao longo da semana
  private calculateDistributionBonus(cromossomo: Cromossomo): number {
    const diasUsados = new Set<string>();

    for (const gene of cromossomo.genes) {
      for (const horario of gene.horarios) {
        const dia = horario.split("_")[0];
        diasUsados.add(dia);
      }
    }

    return diasUsados.size * 10;
  }

  // penaliza aulas aos sabados
  private calculateSaturdayAvoidanceBonus(cromossomo: Cromossomo): number {
    let saturdayClasses = 0;

    for (const gene of cromossomo.genes) {
      for (const horario of gene.horarios) {
        const dia = horario.split("_")[0];
        if (dia === "SABADO") {
          saturdayClasses++;
        }
      }
    }

    return -saturdayClasses * 30;
  }

  // bonifica alinhamento com o turno da turma
  private calculateTurnoAlignmentBonus(cromossomo: Cromossomo): number {
    const turnoPreferido = this.turma.turno.toUpperCase();
    let alignedClasses = 0;
    let totalClasses = 0;

    const codigosPorTurno = {
      MATUTINO: ["M1", "M2", "M3", "M4", "M5", "M6"],
      VESPERTINO: ["T1", "T2", "T3", "T4", "T5", "T6"],
      NOTURNO: ["N1", "N2", "N3", "N4"],
    };

    const codigosPreferidos =
      codigosPorTurno[turnoPreferido as keyof typeof codigosPorTurno] || [];

    for (const gene of cromossomo.genes) {
      for (const horario of gene.horarios) {
        const codigo = horario.split("_")[1];
        totalClasses++;

        if (codigosPreferidos.includes(codigo)) {
          alignedClasses++;
        }
      }
    }

    const alignmentRatio = totalClasses > 0 ? alignedClasses / totalClasses : 0;
    return alignmentRatio * 100;
  }

  // bonifica dias alternados e penaliza dias consecutivos por disciplina
  private calculateDayDistributionBonus(cromossomo: Cromossomo): number {
    let bonus = 0;

    const dayNumbers: { [key: string]: number } = {
      SEGUNDA: 1,
      TERCA: 2,
      QUARTA: 3,
      QUINTA: 4,
      SEXTA: 5,
      SABADO: 6,
    };

    for (const gene of cromossomo.genes) {
      const diasUsados = new Set<number>();

      for (const horario of gene.horarios) {
        const dia = horario.split("_")[0];
        const dayNumber = dayNumbers[dia];
        if (dayNumber) {
          diasUsados.add(dayNumber);
        }
      }

      const diasArray = Array.from(diasUsados).sort();

      const disciplina = this.turma.disciplinas.find(
        (d) => d.id === gene.disciplinaId
      );
      if (!disciplina) continue;

      const cargaHoraria = disciplina.cargaHoraria;

      if (cargaHoraria === 30) {
        if (diasArray.length === 1) {
          bonus += 100;
        } else {
          bonus -= 200;
        }
      } else if (cargaHoraria === 45) {
        if (diasArray.length === 1) {
          bonus += 100;
        } else {
          bonus -= 250;
        }
      } else if (cargaHoraria === 60) {
        if (diasArray.length === 2) {
          const [dia1, dia2] = diasArray;
          if (dia2 - dia1 === 1) {
            bonus -= 100;
          } else if (dia2 - dia1 === 2) {
            bonus += 80;
          } else {
            bonus += 60;
          }
        } else if (diasArray.length === 1) {
          bonus -= 300;
        } else {
          bonus -= 150;
        }
      } else if (cargaHoraria === 90) {
        if (diasArray.length === 2) {
          const [dia1, dia2] = diasArray;
          if (dia2 - dia1 === 1) {
            bonus -= 120;
          } else if (dia2 - dia1 === 2) {
            bonus += 100;
          } else {
            bonus += 80;
          }
        } else if (diasArray.length === 1) {
          bonus -= 400;
        } else {
          bonus -= 200;
        }
      } else {
        for (let i = 0; i < diasArray.length - 1; i++) {
          const diaAtual = diasArray[i];
          const proximoDia = diasArray[i + 1];

          if (proximoDia - diaAtual === 1) {
            bonus -= 50;
          } else if (proximoDia - diaAtual === 2) {
            bonus += 30;
          } else {
            bonus += 20;
          }
        }
      }
    }

    return bonus;
  }

  // bonifica sequencia e penaliza brechas no mesmo dia por disciplina
  private calculateSequentialClassBonus(cromossomo: Cromossomo): number {
    let bonus = 0;

    for (const gene of cromossomo.genes) {
      const horariosPorDia: { [dia: string]: string[] } = {};

      for (const horario of gene.horarios) {
        const [dia, codigo] = horario.split("_");
        if (!horariosPorDia[dia]) {
          horariosPorDia[dia] = [];
        }
        horariosPorDia[dia].push(codigo);
      }

      for (const dia in horariosPorDia) {
        const codigos = horariosPorDia[dia].sort();

        if (codigos.length >= 2) {
          let consecutivos = 0;
          let sequenciaAtual = 1;

          for (let i = 1; i < codigos.length; i++) {
            const numeroAtual = this.getHorarioNumber(codigos[i]);
            const numeroAnterior = this.getHorarioNumber(codigos[i - 1]);

            if (numeroAtual === numeroAnterior + 1) {
              sequenciaAtual++;
            } else {
              if (sequenciaAtual >= 2) {
                consecutivos += sequenciaAtual;
              }
              sequenciaAtual = 1;
            }
          }

          if (sequenciaAtual >= 2) {
            consecutivos += sequenciaAtual;
          }

          if (consecutivos >= 2) {
            bonus += consecutivos * 15;
          }

          if (codigos.length >= 2 && consecutivos < codigos.length) {
            const brechas = codigos.length - consecutivos;
            bonus -= brechas * 10;
          }
        }
      }
    }

    return bonus;
  }

  // conta conflitos de professor e sala no cromossomo
  private checkConflicts(cromossomo: Cromossomo): {
    professorConflicts: number;
    salaConflicts: number;
  } {
    const professorHorarios = new Map<string, Set<string>>();
    const salaHorarios = new Map<string, Set<string>>();
    let professorConflicts = 0;
    let salaConflicts = 0;

    for (const gene of cromossomo.genes) {
      if (!professorHorarios.has(gene.professorId)) {
        professorHorarios.set(gene.professorId, new Set());
      }
      const profHorarios = professorHorarios.get(gene.professorId)!;

      for (const horario of gene.horarios) {
        if (profHorarios.has(horario)) {
          professorConflicts++;
        }
        profHorarios.add(horario);
      }

      if (!salaHorarios.has(gene.salaId)) {
        salaHorarios.set(gene.salaId, new Set());
      }
      const salaHors = salaHorarios.get(gene.salaId)!;

      for (const horario of gene.horarios) {
        if (salaHors.has(horario)) {
          salaConflicts++;
        }
        salaHors.add(horario);
      }
    }

    return { professorConflicts, salaConflicts };
  }

  // evolui uma geracao com elitismo e operadores adaptativos
  private evolveGeneration(): void {
    const newPopulation: Cromossomo[] = [];

    const eliteCount = Math.floor(
      this.params.populationSize * this.params.elitismRate
    );
    const sortedPopulation = [...this.population].sort(
      (a, b) => b.fitness - a.fitness
    );
    newPopulation.push(...sortedPopulation.slice(0, eliteCount));

    while (newPopulation.length < this.params.populationSize) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();

      let offspring = this.adaptiveCrossover(parent1, parent2);
      offspring = this.adaptiveMutate(offspring);

      newPopulation.push(offspring);
    }

    this.population = newPopulation;
  }

  // seleciona um pai por torneio (k=3)
  private selectParent(): Cromossomo {
    const tournamentSize = 3;
    let best =
      this.population[Math.floor(Math.random() * this.population.length)];

    for (let i = 1; i < tournamentSize; i++) {
      const candidate =
        this.population[Math.floor(Math.random() * this.population.length)];
      if (candidate.fitness > best.fitness) {
        best = candidate;
      }
    }

    return best;
  }

  // retorna o melhor cromossomo atual da populacao
  private getBestChromosome(): Cromossomo {
    return this.population.reduce((best, current) =>
      current.fitness > best.fitness ? current : best
    );
  }

  // ajusta taxas adaptativas de crossover e mutacao usando estagnacao e sucesso
  private adaptOperatorRates(currentBestFitness: number): void {
    const improvement = currentBestFitness - this.lastBestFitness;

    if (improvement <= 0) {
      this.stagnationCount++;
    } else {
      this.stagnationCount = 0;
    }

    const crossoverSuccessRate =
      this.operatorMetrics.crossover.attempts > 0
        ? this.operatorMetrics.crossover.successes /
          this.operatorMetrics.crossover.attempts
        : 0.5;

    const mutationSuccessRate =
      this.operatorMetrics.mutation.attempts > 0
        ? this.operatorMetrics.mutation.successes /
          this.operatorMetrics.mutation.attempts
        : 0.5;

    if (this.stagnationCount > 5) {
      this.adaptiveMutationRate = Math.min(
        0.3,
        this.adaptiveMutationRate * 1.2
      );
      this.adaptiveCrossoverRate = Math.max(
        0.3,
        this.adaptiveCrossoverRate * 0.9
      );
    } else {
      if (crossoverSuccessRate > 0.6) {
        this.adaptiveCrossoverRate = Math.min(
          0.9,
          this.adaptiveCrossoverRate * 1.1
        );
      } else if (crossoverSuccessRate < 0.3) {
        this.adaptiveCrossoverRate = Math.max(
          0.3,
          this.adaptiveCrossoverRate * 0.9
        );
      }

      if (mutationSuccessRate > 0.6) {
        this.adaptiveMutationRate = Math.min(
          0.3,
          this.adaptiveMutationRate * 1.1
        );
      } else if (mutationSuccessRate < 0.3) {
        this.adaptiveMutationRate = Math.max(
          0.05,
          this.adaptiveMutationRate * 0.9
        );
      }
    }

    this.operatorMetrics.crossover = { successes: 0, attempts: 0 };
    this.operatorMetrics.mutation = { successes: 0, attempts: 0 };
  }

  // crossover de um ponto com taxa adaptativa e coleta de metricas
  private adaptiveCrossover(
    parent1: Cromossomo,
    parent2: Cromossomo
  ): Cromossomo {
    this.operatorMetrics.crossover.attempts++;

    if (Math.random() > this.adaptiveCrossoverRate) {
      return { ...parent1, fitness: 0 };
    }

    const genes: Gene[] = [];
    const crossoverPoint = Math.floor(Math.random() * parent1.genes.length);

    for (let i = 0; i < parent1.genes.length; i++) {
      if (i < crossoverPoint) {
        genes.push({ ...parent1.genes[i] });
      } else {
        genes.push({ ...parent2.genes[i] });
      }
    }

    const offspring = { genes, fitness: 0 };

    const isDifferentFromParents =
      !this.areChromosomesEqual(offspring, parent1) &&
      !this.areChromosomesEqual(offspring, parent2);

    if (isDifferentFromParents) {
      this.operatorMetrics.crossover.successes++;
    }

    return offspring;
  }

  // mutacao por gene com taxa adaptativa e coleta de metricas
  private adaptiveMutate(cromossomo: Cromossomo): Cromossomo {
    this.operatorMetrics.mutation.attempts++;

    const originalGenes = cromossomo.genes.map((g) => ({ ...g }));
    let mutationOccurred = false;

    const mutatedGenes = cromossomo.genes.map((gene) => {
      if (Math.random() < this.adaptiveMutationRate) {
        mutationOccurred = true;

        if (Math.random() < 0.33) {
          const newProfessor =
            this.professores[
              Math.floor(Math.random() * this.professores.length)
            ];
          return { ...gene, professorId: newProfessor.id };
        }
        else if (Math.random() < 0.66) {
          const disciplina = this.turma.disciplinas.find(
            (d) => d.id === gene.disciplinaId
          )!;
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
            return { ...gene, salaId: newSala.id };
          }
        }
        else {
          const newHorarios = this.selectRandomHorarios(gene.horarios.length);
          return { ...gene, horarios: newHorarios };
        }
      }
      return gene;
    });

    if (mutationOccurred) {
      this.operatorMetrics.mutation.successes++;
    }

    return { genes: mutatedGenes, fitness: 0 };
  }

  // verifica se dois cromossomos sao iguais
  private areChromosomesEqual(
    chromo1: Cromossomo,
    chromo2: Cromossomo
  ): boolean {
    if (chromo1.genes.length !== chromo2.genes.length) return false;

    for (let i = 0; i < chromo1.genes.length; i++) {
      const gene1 = chromo1.genes[i];
      const gene2 = chromo2.genes[i];

      if (
        gene1.disciplinaId !== gene2.disciplinaId ||
        gene1.professorId !== gene2.professorId ||
        gene1.salaId !== gene2.salaId ||
        gene1.horarios.length !== gene2.horarios.length ||
        !gene1.horarios.every((h, idx) => h === gene2.horarios[idx])
      ) {
        return false;
      }
    }

    return true;
  }

  // repara um cromossomo corrigindo conflitos basicos
  private repairChromosome(cromossomo: Cromossomo): Cromossomo {
    const repairedGenes = cromossomo.genes.map((gene) => {
      let repairedGene = { ...gene };

      repairedGene = this.repairProfessorConflicts(
        repairedGene,
        cromossomo.genes
      );

      repairedGene = this.repairRoomConflicts(repairedGene, cromossomo.genes);

      repairedGene = this.repairCapacityViolations(repairedGene);

      return repairedGene;
    });

    return { genes: repairedGenes, fitness: 0 };
  }

  // repara conflitos de professor ajustando horarios quando possivel
  private repairProfessorConflicts(gene: Gene, allGenes: Gene[]): Gene {
    const conflictingGenes = allGenes.filter(
      (g) =>
        g !== gene &&
        g.professorId === gene.professorId &&
        g.horarios.some((h) => gene.horarios.includes(h))
    );

    if (conflictingGenes.length === 0) return gene;

    const usedHorarios = new Set<string>();
    allGenes.forEach((g) => {
      if (g !== gene && g.professorId === gene.professorId) {
        g.horarios.forEach((h) => usedHorarios.add(h));
      }
    });

    const availableHorarios = this.horarios
      .map((h) => `${h.dia_semana}_${h.codigo}`)
      .filter((h) => !usedHorarios.has(h));

    if (availableHorarios.length >= gene.horarios.length) {
      const newHorarios = this.selectOptimalHorarios(
        gene.horarios.length,
        usedHorarios,
        new Set()
      );

      if (newHorarios.length === gene.horarios.length) {
        return { ...gene, horarios: newHorarios };
      }
    }

    return gene;
  }

  // repara conflitos de sala trocando por sala compativel sem choque
  private repairRoomConflicts(gene: Gene, allGenes: Gene[]): Gene {
    const conflictingGenes = allGenes.filter(
      (g) =>
        g !== gene &&
        g.salaId === gene.salaId &&
        g.horarios.some((h) => gene.horarios.includes(h))
    );

    if (conflictingGenes.length === 0) return gene;

    const disciplina = this.turma.disciplinas.find(
      (d) => d.id === gene.disciplinaId
    )!;
    const salasCompativeis = this.salas.filter(
      (sala) =>
        sala.id !== gene.salaId &&
        sala.capacidade >= this.turma.num_alunos &&
        (disciplina.tipoSala === "Lab" ? sala.computadores > 0 : true)
    );

    for (const sala of salasCompativeis) {
      const salaConflicts = allGenes.filter(
        (g) =>
          g.salaId === sala.id &&
          g.horarios.some((h) => gene.horarios.includes(h))
      );

      if (salaConflicts.length === 0) {
        return { ...gene, salaId: sala.id };
      }
    }

    return gene;
  }

  // repara violacoes de capacidade de sala trocando por sala adequada
  private repairCapacityViolations(gene: Gene): Gene {
    const sala = this.salas.find((s) => s.id === gene.salaId);
    if (!sala || sala.capacidade >= this.turma.num_alunos) {
      return gene;
    }

    const disciplina = this.turma.disciplinas.find(
      (d) => d.id === gene.disciplinaId
    )!;
    const salasAdequadas = this.salas.filter(
      (s) =>
        s.capacidade >= this.turma.num_alunos &&
        (disciplina.tipoSala === "Lab" ? s.computadores > 0 : true)
    );

    if (salasAdequadas.length > 0) {
      const melhorSala = salasAdequadas.reduce((best, current) =>
        current.capacidade < best.capacidade ? current : best
      );

      return { ...gene, salaId: melhorSala.id };
    }

    return gene;
  }

  // metodos nao utilizados no fluxo principal atual
  private checkCapacityViolations(cromossomo: Cromossomo): number {
    let violations = 0;

    for (const gene of cromossomo.genes) {
      const sala = this.salas.find((s) => s.id === gene.salaId);
      if (sala && sala.capacidade < this.turma.num_alunos) {
        violations++;
      }
    }

    return violations;
  }

  private checkDistribution(cromossomo: Cromossomo): number {
    const diasUtilizados = new Set<string>();

    for (const gene of cromossomo.genes) {
      for (const horario of gene.horarios) {
        const dia = horario.split("_")[0];
        diasUtilizados.add(dia);
      }
    }

    return diasUtilizados.size;
  }

  private checkPreferences(cromossomo: Cromossomo): number {
    let score = 0;

    for (const gene of cromossomo.genes) {
      const professor = this.professores.find((p) => p.id === gene.professorId);
      if (professor?.preferencias) {
        for (const horario of gene.horarios) {
          if (professor.preferencias.includes(horario)) {
            score++;
          }
        }
      }
    }

    return score;
  }

  private crossover(parent1: Cromossomo, parent2: Cromossomo): Cromossomo {
    if (Math.random() > this.params.crossoverRate) {
      return { ...parent1, fitness: 0 };
    }

    const genes: Gene[] = [];
    const crossoverPoint = Math.floor(Math.random() * parent1.genes.length);

    for (let i = 0; i < parent1.genes.length; i++) {
      if (i < crossoverPoint) {
        genes.push({ ...parent1.genes[i] });
      } else {
        genes.push({ ...parent2.genes[i] });
      }
    }

    return { genes, fitness: 0 };
  }

  private mutate(cromossomo: Cromossomo): Cromossomo {
    const mutatedGenes = cromossomo.genes.map((gene) => {
      if (Math.random() < this.params.mutationRate) {
        if (Math.random() < 0.33) {
          const newProfessor =
            this.professores[
              Math.floor(Math.random() * this.professores.length)
            ];
          return { ...gene, professorId: newProfessor.id };
        } else if (Math.random() < 0.66) {
          const disciplina = this.turma.disciplinas.find(
            (d) => d.id === gene.disciplinaId
          )!;
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
            return { ...gene, salaId: newSala.id };
          }
        } else {
          const newHorarios = this.selectRandomHorarios(gene.horarios.length);
          return { ...gene, horarios: newHorarios };
        }
      }
      return gene;
    });

    return { genes: mutatedGenes, fitness: 0 };
  }
}
