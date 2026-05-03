import { DisciplinasRepository } from "../../repositories/disciplinas-repository";
import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";
import { GerarHorarioConsolidadoUseCase } from "./gerar-horario-consolidado";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

// Função auxiliar para calcular número de aulas baseado na carga horária
function calcularTotalAulas(cargaHoraria: number): number {
    // Considerando aulas de 50 minutos
    return Math.ceil((cargaHoraria * 60) / 50);
}

interface AtualizarDisciplinaUseCaseRequest {
  id: string;
  nome?: string | undefined;
  carga_horaria?: number | undefined;
  tipo_de_sala?: 'Sala' | 'Lab' | undefined;
  data_inicio?: Date | undefined;
  data_fim_prevista?: Date | undefined;
  data_fim_real?: Date | undefined;
}

export class AtualizarDisciplinaUseCase {
  constructor(
    private disciplinasRepository: DisciplinasRepository,
    private alocacoesRepository: AlocacoesRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({
    id,
    nome,
    carga_horaria,
    tipo_de_sala,
    data_inicio,
    data_fim_prevista,
    data_fim_real,
  }: AtualizarDisciplinaUseCaseRequest) {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    const disciplinaExiste = await this.disciplinasRepository.findById(id);

    if (!disciplinaExiste) {
      throw new RecursoNaoEncontradoError();
    }

    // Cria um objeto com apenas os campos que foram fornecidos
    const updateData: Partial<{
      nome: string;
      carga_horaria: number;
      total_aulas: number;
      tipo_de_sala: 'Sala' | 'Lab';
      data_inicio: Date;
      data_fim_prevista: Date;
      data_fim_real: Date;
    }> = {};
    if (nome !== undefined) updateData.nome = nome;
    if (carga_horaria !== undefined) {
      updateData.carga_horaria = carga_horaria;
      // Recalcula o total de aulas quando a carga horária é alterada
      updateData.total_aulas = calcularTotalAulas(carga_horaria);
    }
    if (tipo_de_sala !== undefined) updateData.tipo_de_sala = tipo_de_sala;
    if (data_inicio !== undefined) updateData.data_inicio = data_inicio;
    if (data_fim_prevista !== undefined) updateData.data_fim_prevista = data_fim_prevista;
    if (data_fim_real !== undefined) updateData.data_fim_real = data_fim_real;
    
    const disciplina = await this.disciplinasRepository.update(id, updateData);

    // Gerar horário consolidado automaticamente após atualização
    const gerarHorarioUseCase = new GerarHorarioConsolidadoUseCase(this.alocacoesRepository);
    const { horarioConsolidado } = await gerarHorarioUseCase.execute({
      disciplinaId: id,
      periodoId: periodoAtivo.id,
    });
    
    // Atualizar disciplina com o horário consolidado
    await this.disciplinasRepository.update(id, {
      horario_consolidado: horarioConsolidado || null,
    });

    return { disciplina };
  }
}
