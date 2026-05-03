import { DisciplinasRepository } from "../../repositories/disciplinas-repository";
import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { parseHorarioConsolidado, calcularUltimoDiaAula } from "../../utils/parse-horario-consolidado";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface AtualizarProgressoDisciplinasUseCaseRequest {
  disciplinaId?: string;
  turmaId?: string;
}

interface AtualizarProgressoDisciplinasUseCaseResponse {
  disciplinasAtualizadas: number;
}

export class AtualizarProgressoDisciplinasUseCase {
  constructor(
    private disciplinasRepository: DisciplinasRepository,
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({
    disciplinaId,
    turmaId,
  }: AtualizarProgressoDisciplinasUseCaseRequest): Promise<AtualizarProgressoDisciplinasUseCaseResponse> {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    let disciplinas;

    if (disciplinaId) {
      const disciplina =
        await this.disciplinasRepository.findById(disciplinaId);
      disciplinas = disciplina ? [disciplina] : [];
    } else if (turmaId) {
      const alocacoes = await this.alocacoesRepository.findByTurma(
        turmaId,
        periodoAtivo.id,
      );
      const disciplinaIds = alocacoes.map((alocacao) => alocacao.id_disciplina);
      disciplinas = await this.disciplinasRepository.findByIds(disciplinaIds);
    } else {
      disciplinas = await this.disciplinasRepository.findAll();
    }

    let disciplinasAtualizadas = 0;
    const dataAtual = new Date();

    for (const disciplina of disciplinas) {
      const horarios = parseHorarioConsolidado(disciplina.horario_consolidado || "");

      if (horarios.length === 0) {
        continue;
      }

      // --- CORREÇÃO: CALCULAR TOTAL DE AULAS CORRETAMENTE ---
      const duracaoTotalPorSemana = horarios.reduce((acc, horario) => {
        const inicio = this.parseTime(horario.horaInicio);
        const fim = this.parseTime(horario.horaFim);
        return acc + (fim - inicio) / (1000 * 60); // duração em minutos
      }, 0);

      const cargaHorariaMinutos = disciplina.carga_horaria * 60;
      const semanasTotais = Math.ceil(
        cargaHorariaMinutos / duracaoTotalPorSemana
      );

      // Corrigido: Conta a quantidade total de blocos de horário por semana
      const totalBlocosPorSemana = horarios.reduce(
        (sum, h) => sum + h.horarios.length,
        0
      );
      const totalAulas = totalBlocosPorSemana * semanasTotais;
      // --- FIM DA CORREÇÃO ---

      const inicioSemestre =
        disciplina.data_inicio || new Date(dataAtual.getFullYear(), 1, 1);

      if (inicioSemestre > dataAtual) {
        await this.disciplinasRepository.update(disciplina.id, {
          carga_horaria_atual: 0,
          total_aulas: totalAulas,
          aulas_ministradas: 0,
          data_fim_real: null,
        });
        disciplinasAtualizadas++;
        continue;
      }

      // --- LÓGICA DE CÁLCULO OTIMIZADA E REVISADA ---
      let aulasMinistradas = 0;

      const diasDaSemana = horarios.map((h) =>
        this.getDiaSemanaNumero(h.diaSemana)
      );

      for (const diaSemanaNumero of diasDaSemana) {
        const aulasPorDia =
          horarios.find(
            (h) => this.getDiaSemanaNumero(h.diaSemana) === diaSemanaNumero
          )?.horarios.length || 0;

        let dataAtualTemp = new Date(inicioSemestre);
        let contadorAulas = 0;

        while (dataAtualTemp <= dataAtual) {
          if (dataAtualTemp.getDay() === diaSemanaNumero) {
            contadorAulas += aulasPorDia;
          }
          dataAtualTemp.setDate(dataAtualTemp.getDate() + 1);
        }

        aulasMinistradas += contadorAulas;
      }

      // --- FIM DA LÓGICA REVISADA ---

      // Calcular carga horária atual
      const cargaHorariaAtual = Math.min(
        (aulasMinistradas / totalAulas) * disciplina.carga_horaria,
        disciplina.carga_horaria
      );

      // Calcular data_fim_real usando a função correta baseada no horário consolidado
      let dataFimReal = null;
      if (disciplina.horario_consolidado && disciplina.data_inicio && totalAulas > 0) {
        dataFimReal = calcularUltimoDiaAula(
          disciplina.horario_consolidado,
          disciplina.data_inicio,
          totalAulas
        );
      }

      await this.disciplinasRepository.update(disciplina.id, {
        carga_horaria_atual: Math.round(cargaHorariaAtual),
        total_aulas: totalAulas,
        aulas_ministradas: aulasMinistradas,
        data_fim_real: dataFimReal,
      });

      disciplinasAtualizadas++;
    }

    return {
      disciplinasAtualizadas,
    };
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes).getTime();
  }

  private getDiaSemanaNumero(diaSemana: string): number {
    const dias = {
      DOMINGO: 0,
      SEGUNDA: 1,
      TERCA: 2,
      QUARTA: 3,
      QUINTA: 4,
      SEXTA: 5,
      SABADO: 6,
    };
    return dias[diaSemana as keyof typeof dias] || 0;
  }
}
