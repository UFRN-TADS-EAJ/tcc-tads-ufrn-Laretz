import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarGradeHorariosSalaUseCaseRequest {
  salaId: string;
  periodoId?: string;
}

interface AlocacaoInfo {
  id: string;
  disciplina: {
    id: string;
    nome: string;
    cargaHorariaTotal: number;
  };
  professor: {
    id: string;
    nome: string;
    email: string;
  };
  turma: {
    id: string;
    nome: string;
    num_alunos: number;
    semestre: number;
    turno: string;
  };
  horario: {
    id: string;
    codigo: string;
    dia_semana: string;
    horario_inicio: Date;
    horario_fim: Date;
  };
}

interface GradeHorarios {
  [dia_semana: string]: {
    [codigoHorario: string]: AlocacaoInfo | null;
  };
}

interface BuscarGradeHorariosSalaUseCaseResponse {
  salaId: string;
  grade: GradeHorarios;
  resumo: {
    totalAlocacoes: number;
    disciplinasUnicas: number;
    professoresUnicos: number;
    turmasUnicas: number;
  };
}

export class BuscarGradeHorariosSalaUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  private async fetchAllPages<T>(
    fetcher: (page: number) => Promise<T[]>,
    opts?: { pageSize?: number; maxPages?: number },
  ): Promise<T[]> {
    const pageSize = opts?.pageSize ?? 20;
    const maxPages = opts?.maxPages ?? 50;
    const all: T[] = [];

    for (let page = 1; page <= maxPages; page++) {
      const chunk = await fetcher(page);
      all.push(...chunk);
      if (chunk.length < pageSize) break;
    }

    return all;
  }

  async execute({
    salaId,
    periodoId,
  }: BuscarGradeHorariosSalaUseCaseRequest): Promise<BuscarGradeHorariosSalaUseCaseResponse> {
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

    // Buscar todas as alocações da sala com relacionamentos
     const alocacoes = await this.fetchAllPages((page) =>
      this.alocacoesRepository.findBySalaId(salaId, page, periodo.id),
    );

    // Inicializar grade vazia
    const diasSemana = [
      "SEGUNDA",
      "TERCA",
      "QUARTA",
      "QUINTA",
      "SEXTA",
      "SABADO",
    ];
    const codigosHorarios = [
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

    const grade: GradeHorarios = {};

    // Inicializar grade com valores null
    diasSemana.forEach((dia) => {
      grade[dia] = {};
      codigosHorarios.forEach((codigo) => {
        if (grade[dia]) {
          grade[dia][codigo] = null;
        }
      });
    });

    // Preencher grade com alocações
    alocacoes.forEach((alocacao: any) => {
      if (!alocacao?.horario) return;

      const diaRaw = String(alocacao.horario?.dia_semana || "");
      const codigoRaw = String(alocacao.horario?.codigo || "");

      const dia_semana = diaRaw
        .trim()
        .toUpperCase()
        .replace(/-FEIRA$/i, "")
        .replace("Ç", "C")
        .replace("Á", "A")
        .replace("Ã", "A")
        .replace("Â", "A")
        .replace("É", "E")
        .replace("Ê", "E")
        .replace("Í", "I")
        .replace("Ó", "O")
        .replace("Ô", "O")
        .replace("Õ", "O")
        .replace("Ú", "U");

      const codigoHorario = codigoRaw.trim().toUpperCase();

      if (!grade[dia_semana]) {
        return;
      }

      if (grade[dia_semana][codigoHorario] === undefined) {
        grade[dia_semana][codigoHorario] = null;
      }

      grade[dia_semana][codigoHorario] = {
        id: String(alocacao.id || ""),
        disciplina: {
          id: String(alocacao.disciplina?.id || ""),
          nome: String(alocacao.disciplina?.nome || ""),
          cargaHorariaTotal: Number(
            alocacao.disciplina?.cargaHorariaTotal ??
              alocacao.disciplina?.carga_horaria ??
              0,
          ),
        },
        professor: {
          id: String(alocacao.user?.id || ""),
          nome: String(alocacao.user?.nome || "Sem Professor"),
          email: String(alocacao.user?.email || ""),
        },
        turma: {
          id: String(alocacao.turma?.id || ""),
          nome: String(alocacao.turma?.nome || "Sem Turma"),
          num_alunos: Number(alocacao.turma?.num_alunos || 0),
          semestre: Number(alocacao.turma?.semestre || 0),
          turno: String(alocacao.turma?.turno || ""),
        },
        horario: {
          id: String(alocacao.horario?.id || ""),
          codigo: String(alocacao.horario?.codigo || ""),
          dia_semana: String(alocacao.horario?.dia_semana || ""),
          horario_inicio: alocacao.horario?.horario_inicio || new Date(),
          horario_fim: alocacao.horario?.horario_fim || new Date(),
        },
      };
    });

    // Calcular resumo
    const disciplinasUnicas = new Set(
      alocacoes.map((a: any) => a.disciplina.id),
    ).size;
    const professoresUnicos = new Set(alocacoes.map((a: any) => a.user.id))
      .size;
    const turmasUnicas = new Set(alocacoes.map((a: any) => a.turma.id)).size;

    return {
      salaId,
      grade,
      resumo: {
        totalAlocacoes: alocacoes.length,
        disciplinasUnicas,
        professoresUnicos,
        turmasUnicas,
      },
    };
  }
}
