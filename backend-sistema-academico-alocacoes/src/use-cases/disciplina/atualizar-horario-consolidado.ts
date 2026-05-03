import { DisciplinasRepository } from "../../repositories/disciplinas-repository";
import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";
import { GerarHorarioConsolidadoUseCase } from "./gerar-horario-consolidado";
import { calcularUltimoDiaAula } from "../../utils/parse-horario-consolidado";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface AtualizarHorarioConsolidadoUseCaseRequest {
  disciplinaId: string;
}

interface AtualizarHorarioConsolidadoUseCaseResponse {
  disciplina: {
    id: string;
    horario_consolidado: string | null;
  };
}

export class AtualizarHorarioConsolidadoUseCase {
  constructor(
    private disciplinasRepository: DisciplinasRepository,
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({ disciplinaId }: AtualizarHorarioConsolidadoUseCaseRequest): Promise<AtualizarHorarioConsolidadoUseCaseResponse> {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    // Verificar se a disciplina existe
    const disciplinaExiste = await this.disciplinasRepository.findById(disciplinaId);

    if (!disciplinaExiste) {
      throw new RecursoNaoEncontradoError();
    }

    // Gerar horário consolidado
    const gerarHorarioUseCase = new GerarHorarioConsolidadoUseCase(this.alocacoesRepository);
    const { horarioConsolidado } = await gerarHorarioUseCase.execute({
      disciplinaId,
      periodoId: periodoAtivo.id,
    });
    
    // Calcular nova data de fim baseada no horário consolidado
    let dataFimReal: Date | null = null;
    if (horarioConsolidado && disciplinaExiste.data_inicio && disciplinaExiste.carga_horaria) {
      const totalAulas = Math.ceil((disciplinaExiste.carga_horaria * 60) / 50);
      dataFimReal = calcularUltimoDiaAula(
        horarioConsolidado,
        disciplinaExiste.data_inicio,
        totalAulas
      );
    }
    
    // Atualizar disciplina com o horário consolidado e nova data de fim
    const disciplina = await this.disciplinasRepository.update(disciplinaId, { 
      horario_consolidado: horarioConsolidado || null,
      data_fim_real: dataFimReal
    });

    return {
      disciplina: {
        id: disciplina.id,
        horario_consolidado: disciplina.horario_consolidado
      }
    };
  }
}
