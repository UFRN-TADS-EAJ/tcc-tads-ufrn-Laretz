export interface HardConstraint {
  name: string;
  weight: number;
  validate: (gene: any, context: any) => boolean;
}

export interface SoftConstraint {
  name: string;
  weight: number;
  score: (gene: any, context: any) => number;
}

import { env } from '../../env';

export class ConstraintManager {
  private hardConstraints: HardConstraint[];
  private softConstraints: SoftConstraint[];

  constructor() {
    this.hardConstraints = this.initializeHardConstraints();
    this.softConstraints = this.initializeSoftConstraints();
  }

  private initializeHardConstraints(): HardConstraint[] {
    return [
      // hard constraints (obrigatorias)
      // professor availability: professor nao pode estar em dois lugares ao mesmo tempo
      {
        name: "professor_availability",
        weight: env.GA_WEIGHT_PROFESSOR_AVAILABILITY,
        validate: (gene, context) => {
          const { professorId, horarios } = gene;
          const { allGenes } = context;

          for (const otherGene of allGenes) {
            if (otherGene !== gene && otherGene.professorId === professorId) {
              const overlap = horarios.some((h) =>
                otherGene.horarios.includes(h)
              );
              if (overlap) return false;
            }
          }
          return true;
        },
      },
      // room availability: sala nao pode ter duas aulas ao mesmo tempo
      {
        name: "room_availability",
        weight: env.GA_WEIGHT_ROOM_AVAILABILITY,
        validate: (gene, context) => {
          const { salaId, horarios } = gene;
          const { allGenes } = context;

          for (const otherGene of allGenes) {
            if (otherGene !== gene && otherGene.salaId === salaId) {
              const overlap = horarios.some((h) =>
                otherGene.horarios.includes(h)
              );
              if (overlap) return false;
            }
          }
          return true;
        },
      },
      // room capacity: sala deve ter capacidade suficiente para a turma
      {
        name: "room_capacity",
        weight: env.GA_WEIGHT_ROOM_CAPACITY,
        validate: (gene, context) => {
          const { salaId } = gene;
          const { salas, turma } = context;
          const sala = salas.find((s) => s.id === salaId);
          return sala ? sala.capacidade >= turma.num_alunos : false;
        },
      },
      // room type compatibility: disciplina lab exige sala com computadores
      {
        name: "room_type_compatibility",
        weight: env.GA_WEIGHT_ROOM_TYPE_COMPATIBILITY,
        validate: (gene, context) => {
          const { disciplinaId, salaId } = gene;
          const { disciplinas, salas } = context;

          const disciplina = disciplinas.find((d) => d.id === disciplinaId);
          const sala = salas.find((s) => s.id === salaId);

          if (!disciplina || !sala) return false;

          if (disciplina.tipoSala === "Lab") {
            return sala.computadores > 0;
          }

          return true;
        },
      },
      // workload limit: professor nao pode exceder carga horaria maxima
      {
        name: "workload_limit",
        weight: env.GA_WEIGHT_WORKLOAD_LIMIT,
        validate: (gene, context) => {
          const { professorId, horarios } = gene;
          const { allGenes, professores } = context;

          const professor = professores.find((p) => p.id === professorId);
          if (!professor) return false;

          const totalHoras = allGenes
            .filter((g) => g.professorId === professorId)
            .reduce((total, g) => total + g.horarios.length, 0);

          return totalHoras * 15 <= professor.carga_horaria_max * 60;
        },
      },
      // turma availability: turma nao pode ter duas aulas ao mesmo tempo
      {
        name: "turma_availability",
        weight: env.GA_WEIGHT_TURMA_AVAILABILITY,
        validate: (gene, context) => {
          const { horarios } = gene;
          const { allGenes } = context;

          for (const otherGene of allGenes) {
            if (otherGene !== gene) {
              const overlap = horarios.some((h) =>
                otherGene.horarios.includes(h)
              );
              if (overlap) return false;
            }
          }
          return true;
        },
      },
      // no sunday: nao permitir aulas aos domingos
      {
        name: "no_sunday",
        weight: env.GA_WEIGHT_NO_SUNDAY,
        validate: (gene, context) => {
          const { horarios } = gene;
          return horarios.every((h: string) => h.split("_")[0] !== "DOMINGO");
        },
      },
    ];
  }

  private initializeSoftConstraints(): SoftConstraint[] {
    return [
      // soft constraints (preferencias)
      // avoid consecutive days: penaliza dias seguidos e bonifica intervalo
      {
        name: "avoid_consecutive_days",
        weight: 40,
        score: (gene, context) => {
          const { horarios } = gene;
          if (horarios.length <= 1) return 0; 

          const diasUsados = new Set(horarios.map((h) => h.split("_")[0]));
          const diasOrdenados = Array.from(diasUsados) as string[];

          const ordem = [
            "SEGUNDA",
            "TERCA",
            "QUARTA",
            "QUINTA",
            "SEXTA",
            "SABADO",
          ];

          diasOrdenados.sort((a, b) => {
            return ordem.indexOf(a) - ordem.indexOf(b);
          });

          let penalidade = 0;
          let bonus = 0;

          for (let i = 0; i < diasOrdenados.length - 1; i++) {
            const diaAtual = diasOrdenados[i];
            const proximoDia = diasOrdenados[i + 1];

            if (
              typeof diaAtual === "string" &&
              typeof proximoDia === "string"
            ) {
              if (ordem.indexOf(proximoDia) - ordem.indexOf(diaAtual) === 1) {
                penalidade += 50;
              } else {
                bonus += 20;
              }
            }
          }

          return bonus - penalidade;
        },
      },
      // professor preferences: bonifica horarios preferidos do professor
      {
        name: "professor_preferences",
        weight: 50,
        score: (gene, context) => {
          const { professorId, horarios } = gene;
          const { professores } = context;

          const professor = professores.find((p) => p.id === professorId);
          if (!professor?.preferencias) return 0;

          return horarios.filter((h) => professor.preferencias.includes(h))
            .length;
        },
      },
      // schedule distribution: aplica regras de distribuicao por carga horaria
      {
        name: "schedule_distribution",
        weight: 50,
        score: (gene, context) => {
          const { horarios, disciplinaId } = gene;
          const { disciplinas } = context;

          const disciplina = disciplinas.find((d) => d.id === disciplinaId);
          if (!disciplina) return 0;

          const cargaHoraria =
            disciplina.cargaHoraria || disciplina.carga_horaria_total;
          const dias = new Set(horarios.map((h) => h.split("_")[0]));
          const diasArray = Array.from(dias);

          if (cargaHoraria === 30) {
            if (diasArray.length === 1 && horarios.length === 2) {
              return 100;
            } else if (diasArray.length > 1) {
              return -50;
            }
          } else if (cargaHoraria === 45) {
            if (diasArray.length === 1 && horarios.length === 3) {
              return 100;
            } else if (diasArray.length > 1) {
              return -50;
            }
          } else if (cargaHoraria === 60) {
            if (diasArray.length === 2 && horarios.length === 4) {
              return 100;
            } else if (diasArray.length === 1) {
              return -75;
            } else if (diasArray.length > 2) {
              return -25;
            }
          } else if (cargaHoraria === 90) {
            if (diasArray.length === 2 && horarios.length === 6) {
              return 100;
            } else if (diasArray.length === 1) {
              return -100;
            } else if (diasArray.length > 2) {
              return -25;
            }
          }

          return diasArray.length * 10;
        },
      },
      // consecutive classes: bonifica consecutividade por dia conforme carga horaria
      {
        name: "consecutive_classes",
        weight: env.GA_WEIGHT_CONSECUTIVE_CLASSES,
        score: (gene, context) => {
          const { horarios, disciplinaId } = gene;
          const { disciplinas } = context;

          const disciplina = disciplinas.find((d) => d.id === disciplinaId);
          if (!disciplina) return 0;

          const cargaHoraria =
            disciplina.cargaHoraria || disciplina.carga_horaria_total;
          let consecutiveScore = 0;

          const horariosPorDia = new Map<string, string[]>();
          for (const horario of horarios) {
            const [dia, slot] = horario.split("_");
            if (!horariosPorDia.has(dia)) {
              horariosPorDia.set(dia, []);
            }
            horariosPorDia.get(dia)!.push(slot);
          }

          for (const [dia, slots] of horariosPorDia) {
            const sortedSlots = slots.sort();
            const aulasPorDia = slots.length;

            let consecutivas = 0;
            for (let i = 1; i < sortedSlots.length; i++) {
              if (this.areConsecutive(sortedSlots[i - 1], sortedSlots[i])) {
                consecutivas++;
              }
            }

            if (cargaHoraria === 30) {
              if (aulasPorDia === 2 && consecutivas === 1) {
                consecutiveScore += 50;
              } else if (aulasPorDia === 2 && consecutivas === 0) {
                consecutiveScore -= 40;
              }
            } else if (cargaHoraria === 45) {
              if (aulasPorDia === 3 && consecutivas === 2) {
                consecutiveScore += 60;
              } else if (aulasPorDia === 3 && consecutivas < 2) {
                consecutiveScore -= 60;
              }
            } else if (cargaHoraria === 60) {
              if (aulasPorDia === 2 && consecutivas === 1) {
                consecutiveScore += 35;
              } else if (aulasPorDia === 2 && consecutivas === 0) {
                consecutiveScore -= 40;
              } else if (aulasPorDia > 2) {
                consecutiveScore -= 40;
              }
            } else if (cargaHoraria === 90) {
              if (aulasPorDia === 3 && consecutivas === 2) {
                consecutiveScore += 40;
              } else if (aulasPorDia === 3 && consecutivas < 2) {
                consecutiveScore -= 60;
              } else if (aulasPorDia > 3) {
                consecutiveScore -= 60;
              }
            } else {
              consecutiveScore += consecutivas * 5;
            }
          }

          return consecutiveScore;
        },
      },
      // avoid intra day gaps: penaliza janelas no mesmo dia
      {
        name: "avoid_intra_day_gaps",
        weight: env.GA_WEIGHT_AVOID_INTRA_DAY_GAPS,
        score: (gene, context) => {
          const { horarios } = gene;
          if (horarios.length <= 1) return 0;

          const porDia = new Map<string, number[]>();
          const ordemSlots = ["M1","M2","M3","M4","M5","M6","T1","T2","T3","T4","T5","T6","N1","N2","N3","N4"];
          const toNum = (s: string) => ordemSlots.indexOf(s);

          for (const h of horarios) {
            const [dia, slot] = h.split("_");
            if (!porDia.has(dia)) porDia.set(dia, []);
            porDia.get(dia)!.push(toNum(slot));
          }

          let penalty = 0;
          for (const [dia, nums] of porDia) {
            nums.sort((a,b)=>a-b);
            for (let i=1;i<nums.length;i++) {
              const diff = nums[i]-nums[i-1];
              if (diff > 1) {
                penalty -= 30;
                if (diff >= 2) penalty -= 10;
              }
            }
          }

          return penalty;
        }
      },
      // avoid t6: penaliza aulas no ultimo horario da tarde
      {
        name: "avoid_T6",
        weight: env.GA_WEIGHT_AVOID_T6 ?? 80,
        score: (gene, context) => {
          const { horarios } = gene;
          let score = 0;
          for (const h of horarios) {
            const slot = h.split("_")[1];
            if (slot === "T6") {
              score -= 100;
            }
          }
          return score;
        }
      },
      // prioritize early slots: bonifica horarios iniciais e penaliza tardios
      {
        name: "prioritize_early_slots",
        weight: env.GA_WEIGHT_PRIORITIZE_EARLY_SLOTS ?? 40,
        score: (gene, context) => {
          const early = new Set(["M1","M2","T1","T2","N1","N2"]);
          const late = new Set(["M5","M6","T5","T6","N4"]);
          let score = 0;
          for (const h of gene.horarios) {
            const slot = h.split("_")[1];
            if (early.has(slot)) score += 10;
            if (late.has(slot)) score -= 5;
          }
          return score;
        }
      },
      // avoid start at 2: penaliza comecar no slot 2 sem o slot 1 no mesmo dia
      {
        name: "avoid_start_at_2",
        weight: env.GA_WEIGHT_AVOID_START_AT_2 ?? 50,
        score: (gene, context) => {
          const porDia = new Map<string, Set<string>>();
          for (const h of gene.horarios) {
            const [dia, slot] = h.split("_");
            if (!porDia.has(dia)) porDia.set(dia, new Set());
            porDia.get(dia)!.add(slot);
          }
          let penalty = 0;
          for (const [dia, slots] of porDia) {
            const hasM2 = slots.has("M2"), hasM1 = slots.has("M1");
            const hasT2 = slots.has("T2"), hasT1 = slots.has("T1");
            const hasN2 = slots.has("N2"), hasN1 = slots.has("N1");
            if ((hasM2 && !hasM1) || (hasT2 && !hasT1) || (hasN2 && !hasN1)) {
              penalty -= 20;
            }
          }
          return penalty;
        }
      },
      // avoid lunch break: penaliza aulas em horarios de almoco
      {
        name: "avoid_lunch_break",
        weight: 15,
        score: (gene, context) => {
          const { horarios } = gene;
          const lunchSlots = ["M5", "M6", "T1", "T2"];
          const lunchClasses = horarios.filter((h) => {
            const slot = h.split("_")[1];
            return lunchSlots.includes(slot);
          }).length;

          return -lunchClasses * 10;
        },
      },
      // room utilization: bonifica uso adequado de labs e penaliza lab desnecessario
      {
        name: "room_utilization",
        weight: 10,
        score: (gene, context) => {
          const { disciplinaId, salaId } = gene;
          const { disciplinas, salas } = context;

          const disciplina = disciplinas.find((d) => d.id === disciplinaId);
          const sala = salas.find((s) => s.id === salaId);

          if (!disciplina || !sala) return 0;

          if (disciplina.tipoSala === "Lab" && sala.computadores > 0) {
            return 20;
          }

          if (disciplina.tipoSala === "Sala" && sala.computadores > 0) {
            return -10;
          }

          return 0;
        },
      },
      // avoid saturday: penaliza aulas aos sabados
      {
        name: "avoid_saturday",
        weight: env.GA_WEIGHT_AVOID_SATURDAY,
        score: (gene, context) => {
          const { horarios } = gene;
          let saturdayPenalty = 0;

          for (const horario of horarios) {
            const dia = horario.split("_")[0];
            if (dia === "SABADO") {
              saturdayPenalty -= 50;
            }
          }

          return saturdayPenalty;
        },
      },
      // turno preference: bonifica horarios no turno da turma e penaliza fora do turno
      {
        name: "turno_preference",
        weight: 25,
        score: (gene, context) => {
          const { horarios } = gene;
          const { turma } = context;
          const turnoPreferido = turma?.turno?.toUpperCase();
          if (!turnoPreferido) return 0;

          const codigosPorTurno = {
            MATUTINO: ["M1", "M2", "M3", "M4", "M5", "M6"],
            VESPERTINO: ["T1", "T2", "T3", "T4", "T5", "T6"],
            NOTURNO: ["N1", "N2", "N3", "N4"],
          };

          const codigosPreferidos = codigosPorTurno[turnoPreferido] || [];
          let alignmentScore = 0;

          for (const horario of horarios) {
            const codigo = horario.split("_")[1];

            if (codigosPreferidos.includes(codigo)) {
              alignmentScore += 15;
            } else {
              alignmentScore -= 5;
            }
          }

          return alignmentScore;
        },
      },
      // day interval quality: bonifica intervalo entre dias para 60h e 90h
      {
        name: "day_interval_quality",
        weight: env.GA_WEIGHT_DAY_INTERVAL_QUALITY ?? 50,
        score: (gene, context) => {
          const { horarios, disciplinaId } = gene;
          const { disciplinas } = context;
          const disciplina = disciplinas.find((d) => d.id === disciplinaId);
          if (!disciplina) return 0;

          const cargaHoraria = disciplina.cargaHoraria || disciplina.carga_horaria_total;
          const dias = Array.from(new Set(horarios.map((h) => h.split("_")[0])));

          if (dias.length !== 2) return 0;

          const ordem = [
            "SEGUNDA",
            "TERCA",
            "QUARTA",
            "QUINTA",
            "SEXTA",
            "SABADO",
          ];

          const idx1 = ordem.indexOf(dias[0]);
          const idx2 = ordem.indexOf(dias[1]);
          if (idx1 === -1 || idx2 === -1) return 0;

          const diff = Math.abs(idx2 - idx1);
          let score = 0;

          if (diff === 2) {
            score = 100;
          } else if (diff > 2) {
            score = 75;
          } else if (diff === 1) {
            score = 40;
          } else {
            score = 0;
          }

          if (cargaHoraria === 60 || cargaHoraria === 90) {
            return score;
          }
          return 0;
        },
      },
    ];
  }

  // checar se dois slots sao consecutivos no mesmo dia
  private areConsecutive(slot1: string, slot2: string): boolean {
    const slotOrder = [
      "M1",
      "M2",
      "M3",
      "M4",
      "M5",
      "M6",
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "N1",
      "N2",
      "N3",
      "N4",
    ];
    const index1 = slotOrder.indexOf(slot1);
    const index2 = slotOrder.indexOf(slot2);

    return Math.abs(index1 - index2) === 1;
  }

  // valida hard constraints e retorna violacoes
  public validateHardConstraints(
    gene: any,
    context: any
  ): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    for (const constraint of this.hardConstraints) {
      if (!constraint.validate(gene, context)) {
        violations.push(constraint.name);
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  // calcula o score soft ponderado de um gene
  public calculateSoftScore(gene: any, context: any): number {
    let totalScore = 0;

    for (const constraint of this.softConstraints) {
      const score = constraint.score(gene, context);
      totalScore += score * constraint.weight;
    }

    return totalScore;
  }

  // calcula a penalidade hard ponderada e aplica multiplicador do env
  public getHardConstraintPenalty(gene: any, context: any): number {
    let penalty = 0;

    for (const constraint of this.hardConstraints) {
      if (!constraint.validate(gene, context)) {
        penalty += constraint.weight;
      }
    }

    return penalty * env.GA_HARD_PENALTY_MULTIPLIER;
  }

  // retorna relatorio de hard constraints, soft scores e penalidades de um gene
  public getConstraintReport(
    gene: any,
    context: any
  ): {
    hardViolations: string[];
    softScores: { [key: string]: number };
    totalPenalty: number;
    totalBonus: number;
  } {
    const hardValidation = this.validateHardConstraints(gene, context);
    const softScores: { [key: string]: number } = {};
    let totalBonus = 0;

    for (const constraint of this.softConstraints) {
      const score = constraint.score(gene, context) * constraint.weight;
      softScores[constraint.name] = score;
      totalBonus += Math.max(0, score);
    }

    return {
      hardViolations: hardValidation.violations,
      softScores,
      totalPenalty: this.getHardConstraintPenalty(gene, context),
      totalBonus,
    };
  }
}

export const constraintManager = new ConstraintManager();
