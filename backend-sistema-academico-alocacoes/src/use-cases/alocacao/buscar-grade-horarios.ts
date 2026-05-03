import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";
import { gradeHorariosResponseSchema } from "@/schemas";
import type { GradeAlocacaoDTO, GradeHorariosResponse, HorarioAlocacaoDTO } from "@/schemas";

interface BuscarGradeHorariosUseCaseRequest {
  id_turma?: string | undefined;
  id_user?: string | undefined;
  id_sala?: string | undefined;
  periodoId?: string | undefined;
}

export class BuscarGradeHorariosUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({
    id_turma,
    id_user,
    id_sala,
    periodoId,
  }: BuscarGradeHorariosUseCaseRequest): Promise<GradeHorariosResponse> {
    const periodo = periodoId
      ? await this.periodosRepository.findById(periodoId)
      : await this.periodosRepository.findActive();

    if (!periodo) {
      throw new Error(
        periodoId
          ? "Periodo not found"
          : "Nenhum período letivo ativo encontrado",
      );
    }

    const fetchAllPages = async <T>(
      fetcher: (page: number) => Promise<T[]>,
      opts?: { pageSize?: number; maxPages?: number },
    ): Promise<T[]> => {
      const pageSize = opts?.pageSize ?? 20;
      const maxPages = opts?.maxPages ?? 50;
      const all: T[] = [];

      for (let page = 1; page <= maxPages; page++) {
        const chunk = await fetcher(page);
        all.push(...chunk);
        if (chunk.length < pageSize) break;
      }

      return all;
    };

    let alocacoes: any[] = [];

    // Busca alocações baseado no filtro fornecido
    if (id_turma) {
      alocacoes = await this.alocacoesRepository.findAllByTurmaId(
        id_turma,
        periodo.id,
      );
    } else if (id_user) {
      alocacoes = await fetchAllPages((page) =>
        this.alocacoesRepository.findByUserId(id_user, page, periodo.id),
      );
    } else if (id_sala) {
      alocacoes = await fetchAllPages((page) =>
        this.alocacoesRepository.findBySalaId(id_sala, page, periodo.id),
      );
    } else {
      // Se nenhum filtro for fornecido, busca todas as alocações
      alocacoes = await fetchAllPages((page) =>
        this.alocacoesRepository.findMany(page, periodo.id),
      );
    }

    const toIsoString = (value: unknown): string => {
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "string" && value) return value;
      return new Date().toISOString();
    };

    const toIsoStringOrNull = (value: unknown): string | null => {
      if (value === null || value === undefined) return null;
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "string" && value) return value;
      return null;
    };

    // Organiza as alocações por dia da semana
    const gradeHorarios: GradeHorariosResponse["gradeHorarios"] = {
      segunda: [],
      terca: [],
      quarta: [],
      quinta: [],
      sexta: [],
      sabado: [],
    };

    // Garantir robustez contra registros incompletos (evitar 500 por serialização)
    alocacoes.forEach((alocacao: any) => {
      // Ignora registros sem relação de horário (id_horario nulo)
      if (!alocacao?.horario) {
        return;
      }

      const horarioAlocacao: HorarioAlocacaoDTO = {
        id: String(alocacao.id || ""),
        dia_semana: String(alocacao.horario.dia_semana || ""),
        horario_inicio: toIsoString(alocacao.horario.horario_inicio),
        horario_fim: toIsoString(alocacao.horario.horario_fim),
        disciplina: {
          id: String(alocacao.disciplina?.id ?? ""),
          nome: String(alocacao.disciplina?.nome ?? ""),
          cargaHorariaTotal: Number(alocacao.disciplina?.carga_horaria ?? 0),
        },
        professor: {
          id: String(alocacao.user?.id ?? ""),
          nome: String(alocacao.user?.nome ?? ""),
          especializacao:
            alocacao.user?.especializacao !== undefined
              ? alocacao.user.especializacao
              : null,
        },
        sala: {
          id: String(alocacao.sala?.id ?? ""),
          nome: String(alocacao.sala?.nome ?? ""),
          predio: String(alocacao.sala?.predio?.nome ?? ""),
          capacidade: Number(alocacao.sala?.capacidade ?? 0),
          tipo: String(alocacao.sala?.tipo ?? ""),
        },
        turma: {
          id: String(alocacao.turma?.id ?? ""),
          nome: String(alocacao.turma?.nome ?? ""),
          num_alunos: Number(alocacao.turma?.num_alunos ?? 0),
          periodo: Number(alocacao.turma?.periodo ?? 0),
          turno: String(alocacao.turma?.turno ?? ""),
        },
      };

      // Mapeia o dia da semana para a propriedade correspondente
      const dia_semana = String(alocacao.horario.dia_semana).toLowerCase();
      switch (dia_semana) {
        case "segunda":
        case "segunda-feira":
          gradeHorarios.segunda.push(horarioAlocacao);
          break;
        case "terca":
        case "terça":
        case "terça-feira":
        case "terca-feira":
          gradeHorarios.terca.push(horarioAlocacao);
          break;
        case "quarta":
        case "quarta-feira":
          gradeHorarios.quarta.push(horarioAlocacao);
          break;
        case "quinta":
        case "quinta-feira":
          gradeHorarios.quinta.push(horarioAlocacao);
          break;
        case "sexta":
        case "sexta-feira":
          gradeHorarios.sexta.push(horarioAlocacao);
          break;
        case "sabado":
        case "sábado":
          gradeHorarios.sabado.push(horarioAlocacao);
          break;
      }
    });

    // Ordena os horários de cada dia por horário de início
    Object.keys(gradeHorarios).forEach((dia) => {
      gradeHorarios[dia as keyof GradeHorariosResponse["gradeHorarios"]].sort(
        (a, b) =>
          new Date(a.horario_inicio).getTime() -
          new Date(b.horario_inicio).getTime()
      );
    });

    const diasGrade = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
    const codigosCanonicos = [
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
      "N5",
      "N6",
    ];

    const grade: GradeHorariosResponse["grade"] = {};
    const toDiaKey = (raw: string): string | null => {
      const dia = raw.toLowerCase();
      if (dia === "segunda" || dia === "segunda-feira") return "SEGUNDA";
      if (dia === "terca" || dia === "terça" || dia === "terça-feira" || dia === "terca-feira") return "TERCA";
      if (dia === "quarta" || dia === "quarta-feira") return "QUARTA";
      if (dia === "quinta" || dia === "quinta-feira") return "QUINTA";
      if (dia === "sexta" || dia === "sexta-feira") return "SEXTA";
      if (dia === "sabado" || dia === "sábado") return "SABADO";
      return null;
    };

    alocacoes.forEach((alocacao: any) => {
      if (!alocacao?.horario?.codigo || !alocacao?.horario?.dia_semana) return;
      const diaKey = toDiaKey(String(alocacao.horario.dia_semana));
      if (!diaKey) return;
      const codigo = String(alocacao.horario.codigo);

      if (!grade[diaKey]) grade[diaKey] = {};
      if (!grade[diaKey]![codigo]) grade[diaKey]![codigo] = [];

      const disciplina = alocacao.disciplina;
      const turma = alocacao.turma;
      const sala = alocacao.sala;
      const predio = alocacao.sala?.predio;
      const user = alocacao.user;
      const horario = alocacao.horario;

      const dto: GradeAlocacaoDTO = {
        id: String(alocacao.id || ""),
        id_user: String(alocacao.id_user || user?.id || ""),
        id_disciplina: String(alocacao.id_disciplina || disciplina?.id || ""),
        id_turma: String(alocacao.id_turma || turma?.id || ""),
        id_sala: String(alocacao.id_sala || sala?.id || ""),
        id_horario: String(alocacao.id_horario || horario?.id || ""),
        is_modulo_principal: Boolean(alocacao.is_modulo_principal ?? false),
        created_at: toIsoString(alocacao.created_at),
        user: user
          ? {
              id: String(user.id || ""),
              nome: String(user.nome || ""),
              email: String(user.email || ""),
              role: String(user.role || ""),
              especializacao:
                user.especializacao !== undefined ? user.especializacao : null,
              carga_horaria_max:
                user.carga_horaria_max !== undefined
                  ? user.carga_horaria_max
                  : null,
              preferencia: user.preferencia !== undefined ? user.preferencia : null,
            }
          : undefined,
        disciplina: disciplina
          ? {
              id: String(disciplina.id || ""),
              nome: String(disciplina.nome || ""),
              codigo: disciplina.codigo ?? null,
              carga_horaria: Number(disciplina.carga_horaria ?? 0),
              carga_horaria_atual: Number(disciplina.carga_horaria_atual ?? 0),
              total_aulas: Number(disciplina.total_aulas ?? 0),
              aulas_ministradas: Number(disciplina.aulas_ministradas ?? 0),
              tipo_de_sala: String(disciplina.tipo_de_sala || ""),
              data_inicio: toIsoStringOrNull(disciplina.data_inicio),
              data_fim_prevista: toIsoStringOrNull(disciplina.data_fim_prevista),
              data_fim_real: toIsoStringOrNull(disciplina.data_fim_real),
              periodo_letivo:
                disciplina.periodo_letivo !== undefined ? disciplina.periodo_letivo : null,
              horario_consolidado:
                disciplina.horario_consolidado !== undefined
                  ? disciplina.horario_consolidado
                  : null,
              id_curso: String(disciplina.id_curso || ""),
              semestre: Number(disciplina.semestre ?? 0),
              obrigatoria: Boolean(disciplina.obrigatoria ?? false),
            }
          : undefined,
        turma: turma
          ? {
              id: String(turma.id || ""),
              nome: String(turma.nome || ""),
              num_alunos: Number(turma.num_alunos ?? 0),
              semestre: Number(turma.semestre ?? 0),
              turno: String(turma.turno || ""),
              id_curso: String(turma.id_curso || ""),
              ativa: Boolean(turma.ativa ?? true),
            }
          : undefined,
        sala: sala
          ? {
              id: String(sala.id || ""),
              nome: String(sala.nome || ""),
              ativa: Boolean(sala.ativa ?? true),
              numero: sala.numero ?? null,
              capacidade: Number(sala.capacidade ?? 0),
              tipo: String(sala.tipo || ""),
              computadores: Number(sala.computadores ?? 0),
              predioId: sala.predioId ?? null,
              predio: predio
                ? {
                    id: String(predio.id || ""),
                    nome: String(predio.nome || ""),
                    codigo: String(predio.codigo || ""),
                    descricao:
                      predio.descricao !== undefined ? predio.descricao : null,
                  }
                : null,
            }
          : undefined,
        horario: horario
          ? {
              id: String(horario.id || ""),
              codigo: String(horario.codigo || ""),
              dia_semana: String(horario.dia_semana || ""),
              horario_inicio: toIsoString(horario.horario_inicio),
              horario_fim: toIsoString(horario.horario_fim),
            }
          : undefined,
      };

      grade[diaKey]![codigo]!.push(dto);
    });

    diasGrade.forEach((diaKey) => {
      if (!grade[diaKey]) grade[diaKey] = {};
      codigosCanonicos.forEach((codigo) => {
        if (!grade[diaKey]![codigo]) grade[diaKey]![codigo] = [];
      });
    });

    const parsed = gradeHorariosResponseSchema.safeParse({ gradeHorarios, grade });
    if (!parsed.success) {
      throw new Error(
        `gradeHorariosResponseSchema mismatch: ${JSON.stringify(parsed.error.issues)}`,
      );
    }
    return parsed.data;
  }
}
