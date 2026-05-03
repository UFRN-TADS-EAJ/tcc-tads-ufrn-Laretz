import { DisciplinasRepository } from "../../repositories/disciplinas-repository";
import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { TurmasRepository } from "../../repositories/turmas-repository";
import { CursosRepository } from "../../repositories/cursos-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarDisciplinasComProgressoRequest {
  turmaId?: string;
  cursoId?: string;
}

interface DisciplinaComProgresso {
  id: string;
  nome: string;
  codigo: string | null;
  carga_horaria: number;
  total_aulas: number;
  carga_horaria_atual: number;
  aulas_ministradas: number;
  tipo_de_sala: string;
  data_inicio: Date | null;
  data_fim_prevista: Date | null;
  data_fim_real: Date | null;
  periodo_letivo: string | null;
  horario_consolidado: string | null;
  id_curso: string;
  semestre: number;
  obrigatoria: boolean;
  progresso_temporal: number;
  progresso_aulas: number;
  aulas_previstas_ate_hoje: number;
}

export class BuscarDisciplinasComProgressoUseCase {
  constructor(
    private disciplinasRepository: DisciplinasRepository,
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
    private turmasRepository?: TurmasRepository,
    private cursosRepository?: CursosRepository
  ) {}

  async execute({ turmaId, cursoId }: BuscarDisciplinasComProgressoRequest) {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    // Buscar disciplinas baseado nos filtros
    let disciplinas;

    if (turmaId) {
      if (this.turmasRepository) {
        const turma = await this.turmasRepository.findById(turmaId);
        if (!turma) {
          throw new RecursoNaoEncontradoError();
        }
      }
      const alocacoes = await this.alocacoesRepository.findByTurma(
        turmaId,
        periodoAtivo.id,
      );
      const disciplinaIds = [...new Set(alocacoes.map((a) => a.id_disciplina))];
      disciplinas = await this.disciplinasRepository.findByIds(disciplinaIds);
    } else if (cursoId) {
      if (this.cursosRepository) {
        const curso = await this.cursosRepository.findById(cursoId);
        if (!curso) {
          throw new RecursoNaoEncontradoError();
        }
      }
      disciplinas = await this.disciplinasRepository.findByCurso(cursoId);
    } else {
      disciplinas = await this.disciplinasRepository.findAll();
    }

    // Calcular progresso para cada disciplina
    const disciplinasComProgresso: DisciplinaComProgresso[] = await Promise.all(
      disciplinas.map(async (disciplina) => {
        const progresso = await this.calcularProgressoDisciplina(
          disciplina,
          periodoAtivo.id,
        );
        return {
          ...disciplina,
          ...progresso
        };
      })
    );
    return { disciplinas: disciplinasComProgresso };
  }

  private getDiaSemanaNumero(diaSemana: string): number {
    const dias: { [key: string]: number } = {
      domingo: 0,
      segunda: 1,
      terca: 2,
      quarta: 3,
      quinta: 4,
      sexta: 5,
      sabado: 6,
    };
    return dias[diaSemana.toLowerCase()] || 0;
  }

  private contarAulasEntreDatas(
    dataInicio: Date,
    dataFim: Date,
    diaSemana: number
  ): number {
    let contador = 0;
    const dataAtual = new Date(dataInicio);

    // Avançar para o primeiro dia da semana desejado
    while (dataAtual.getDay() !== diaSemana && dataAtual <= dataFim) {
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    // Contar todas as ocorrências do dia da semana até a data fim
    while (dataAtual <= dataFim) {
      contador++;
      dataAtual.setDate(dataAtual.getDate() + 7); // Próxima semana
    }

    return contador;
  }

  private async calcularProgressoDisciplina(disciplina: any, periodoId: string) {
    const hoje = new Date();

    // Buscar todas as alocações desta disciplina
    const alocacoes = await this.alocacoesRepository.findByDisciplinaId(
      disciplina.id,
      periodoId,
    );

    // Calcular aulas ministradas baseado na data de início e dias da semana
    let aulas_ministradas = 0;

    if (disciplina.data_inicio && new Date(disciplina.data_inicio) <= hoje) {
      const dataInicio = new Date(disciplina.data_inicio);

      // Para cada alocação, contar quantas vezes o dia da semana ocorreu desde o início
      alocacoes.forEach((alocacao) => {
        const diaSemana = this.getDiaSemanaNumero(alocacao.horario.dia_semana);
        const aulasNesteDia = this.contarAulasEntreDatas(
          dataInicio,
          hoje,
          diaSemana
        );
        aulas_ministradas += aulasNesteDia;
      });
    }

    // Calcular total de aulas baseado no horário consolidado e período letivo
    const total_aulas = this.calcularTotalAulas(
      disciplina.horario_consolidado,
      disciplina.carga_horaria
    );

    // Calcular carga horária atual baseada no progresso
    const carga_horaria_atual =
      total_aulas > 0
        ? Math.round(
            (aulas_ministradas / total_aulas) * disciplina.carga_horaria
          )
        : 0;

    // Calcular aulas previstas até hoje
    const aulas_previstas_ate_hoje = this.calcularAulasPrevistasAteHoje(
      disciplina.horario_consolidado,
      disciplina.data_inicio,
      hoje
    );

    // Calcular progresso temporal (baseado em aulas previstas vs aulas ministradas)
    let progresso_temporal = 0;

    if (aulas_previstas_ate_hoje > 0) {
      progresso_temporal = Math.min(
        (aulas_ministradas / aulas_previstas_ate_hoje) * 100,
        100
      );
    } else if (disciplina.data_inicio && disciplina.data_fim_prevista) {
      // Fallback: calcular progresso temporal baseado em datas
      const dataInicio = new Date(disciplina.data_inicio);
      const dataFim = new Date(disciplina.data_fim_prevista);

      if (dataInicio <= hoje && dataFim > dataInicio) {
        const totalDias = Math.ceil(
          (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
        );
        const diasDecorridos = Math.ceil(
          (hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
        );
        progresso_temporal = Math.min(
          Math.max((diasDecorridos / totalDias) * 100, 0),
          100
        );
      }
    }

    // Calcular progresso de aulas (baseado no total do semestre)
    const progresso_aulas =
      total_aulas > 0 ? Math.min((aulas_ministradas / total_aulas) * 100, 100) : 0;

    // Calcular percentual concluído (baseado no progresso de aulas)
    const percentual_concluido = Math.round(Math.min(progresso_aulas, 100));

    // Calcular aulas restantes
    const aulas_restantes = Math.max(0, total_aulas - aulas_ministradas);

    // Determinar status baseado no progresso
    let status: "NAO_INICIADA" | "EM_ANDAMENTO" | "CONCLUIDA";
    if (aulas_ministradas === 0) {
      status = "NAO_INICIADA";
    } else if (percentual_concluido >= 100) {
      status = "CONCLUIDA";
    } else {
      status = "EM_ANDAMENTO";
    }

    return {
      percentual_concluido,
      aulas_restantes,
      status,
      // Manter campos adicionais para possível uso futuro
      progresso_temporal: Math.round(progresso_temporal),
      progresso_aulas: Math.round(progresso_aulas),
      aulas_previstas_ate_hoje,
      aulas_ministradas,
      carga_horaria_atual,
      total_aulas,
    };
  }

  private calcularTotalAulas(
    horarioConsolidado: string,
    cargaHoraria: number
  ): number {
    try {
      if (!horarioConsolidado) {
        // Se não há horário consolidado, usar cálculo baseado em aulas de 50 minutos
        return Math.ceil((cargaHoraria * 60) / 50);
      }

      // Parse do horário consolidado para contar quantas aulas por semana
      const horarios = horarioConsolidado.split(",").map((h) => h.trim());
      const aulasPorSemana = horarios.length;

      // Estimar total de aulas baseado na carga horária
      // Considerando aulas de 50 minutos (padrão do sistema)
      const totalAulasEstimado = Math.ceil((cargaHoraria * 60) / 50);

      return totalAulasEstimado;
    } catch (error) {
      console.error("Erro ao calcular total de aulas:", error);
      return 0;
    }
  }

  private calcularAulasPrevistasAteHoje(
    horarioConsolidado: string,
    dataInicio: string | null,
    hoje: Date
  ): number {
    try {
      if (!horarioConsolidado || !dataInicio) return 0;

      const inicioSemestre = new Date(dataInicio);

      // Se a disciplina ainda não começou, não há aulas previstas
      if (inicioSemestre > hoje) return 0;

      // Parse do horário consolidado (ex: "SEG 07:30-09:10, TER 09:20-11:00")
      const horarios = horarioConsolidado.split(",").map((h) => h.trim());
      const diasSemana: { [key: string]: number } = {
        DOM: 0,
        SEG: 1,
        TER: 2,
        QUA: 3,
        QUI: 4,
        SEX: 5,
        SAB: 6,
      };

      let totalAulas = 0;
      const dataAtual = new Date(inicioSemestre);

      while (dataAtual <= hoje) {
        const diaSemana = dataAtual.getDay();

        // Verificar se há aula neste dia
        const temAula = horarios.some((horario) => {
          const partes = horario.split(" ");
          const dia = partes[0];
          return dia && diasSemana[dia] === diaSemana;
        });

        if (temAula) {
          totalAulas++;
        }

        dataAtual.setDate(dataAtual.getDate() + 1);
      }

      return totalAulas;
    } catch (error) {
      console.error("Erro ao calcular aulas previstas:", error);
      return 0;
    }
  }
}
