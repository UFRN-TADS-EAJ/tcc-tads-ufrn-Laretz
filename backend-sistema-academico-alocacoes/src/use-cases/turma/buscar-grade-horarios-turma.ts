import {
  AlocacoesRepository,
  AlocacaoWithRelations,
} from "../../repositories/alocacoes-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarGradeHorariosTurmaUseCaseRequest {
  turmaId: string;
  periodoId?: string;
}

interface AlocacaoInfo {
  id: string;
  disciplina: {
    id: string;
    nome: string;
    codigo: string;
    cargaHoraria: number;
    horario_consolidado: string;
  };
  professor: {
    id: string;
    nome: string;
    email: string;
  };
  sala: {
    id: string;
    nome: string;
    predio: string;
    capacidade: number;
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

interface BuscarGradeHorariosTurmaUseCaseResponse {
  turmaId: string;
  grade: GradeHorarios;
  resumo: {
    totalAlocacoes: number;
    disciplinasUnicas: number;
    professoresUnicos: number;
  };
}

export class BuscarGradeHorariosTurmaUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({
    turmaId,
    periodoId,
  }: BuscarGradeHorariosTurmaUseCaseRequest): Promise<BuscarGradeHorariosTurmaUseCaseResponse> {
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

    // Buscar todas as alocações da turma com relacionamentos
    const alocacoes: AlocacaoWithRelations[] =
      await this.alocacoesRepository.findAllByTurmaId(turmaId, periodo.id);

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
        grade[dia]![codigo] = null;
      });
    });

    // Preencher grade com alocações
    alocacoes.forEach((alocacao) => {
      // Verificar se os relacionamentos essenciais existem
      if (!alocacao.horario || !alocacao.disciplina) {
        return; // Pular alocação sem horário ou disciplina
      }

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

      // Verificar se o dia existe na grade
      if (!grade[dia_semana]) {
        // Se o dia não existe (ex: DOMINGO), podemos ignorar ou adicionar dinamicamente.
        // Vamos ignorar por enquanto para manter consistência com diasSemana
        return;
      }

      // Se o código não existe na grade inicializada (ex: código novo), inicializa
      if (grade[dia_semana][codigoHorario] === undefined) {
        grade[dia_semana][codigoHorario] = null;
      }

      grade[dia_semana]![codigoHorario] = {
        id: alocacao.id,
        disciplina: {
          id: alocacao.disciplina?.id || "",
          nome: alocacao.disciplina?.nome || "",
          codigo: alocacao.disciplina?.codigo || "",
          cargaHoraria: alocacao.disciplina?.carga_horaria || 0,
          horario_consolidado: alocacao.disciplina?.horario_consolidado || "",
        },
        professor: {
          id: alocacao.user?.id || "",
          nome: alocacao.user?.nome || "Sem Professor",
          email: alocacao.user?.email || "",
        },
        sala: {
          id: alocacao.sala?.id || "",
          nome: alocacao.sala?.nome || "Sem Sala",
          predio: alocacao.sala?.predio?.nome || "",
          capacidade: alocacao.sala?.capacidade || 0,
        },
        horario: {
          id: alocacao.horario?.id || "",
          codigo: alocacao.horario?.codigo || "",
          dia_semana: alocacao.horario?.dia_semana || "",
          horario_inicio: alocacao.horario?.horario_inicio || new Date(),
          horario_fim: alocacao.horario?.horario_fim || new Date(),
        },
      };
    });

    // Calcular resumo
    const disciplinasUnicas = new Set(
      alocacoes.filter((a) => a.disciplina?.id).map((a) => a.disciplina!.id),
    ).size;
    const professoresUnicos = new Set(
      alocacoes.filter((a) => a.user?.id).map((a) => a.user!.id),
    ).size;

    return {
      turmaId,
      grade,
      resumo: {
        totalAlocacoes: alocacoes.length,
        disciplinasUnicas,
        professoresUnicos,
      },
    };
  }
}
