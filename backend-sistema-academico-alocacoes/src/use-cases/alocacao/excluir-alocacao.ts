import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { DisciplinasRepository } from "../../repositories/disciplinas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";
import { GerarHorarioConsolidadoUseCase } from "../disciplina/gerar-horario-consolidado";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface ExcluirAlocacaoUseCaseRequest {
    id: string;
}

export class ExcluirAlocacaoUseCase {
    constructor(
        private alocacoesRepository: AlocacoesRepository,
        private disciplinasRepository: DisciplinasRepository,
        private periodosRepository: PeriodosLetivosRepository,
    ) {}

    async execute({ id }: ExcluirAlocacaoUseCaseRequest) {
        const periodoAtivo = await this.periodosRepository.findActive();
        if (!periodoAtivo) {
            throw new Error("Nenhum período letivo ativo encontrado");
        }

        const alocacaoExiste = await this.alocacoesRepository.findById(id, periodoAtivo.id);

        if (!alocacaoExiste) {
            throw new RecursoNaoEncontradoError();
        }

        // Guardar o ID da disciplina antes de excluir
        const disciplinaId = alocacaoExiste.id_disciplina;
        
        await this.alocacoesRepository.delete(id, periodoAtivo.id);
        
        // Regenerar horário consolidado após excluir alocação
        const gerarHorarioUseCase = new GerarHorarioConsolidadoUseCase(this.alocacoesRepository);
        const { horarioConsolidado } = await gerarHorarioUseCase.execute({
            disciplinaId,
            periodoId: periodoAtivo.id,
        });
        
        // Atualizar disciplina com o horário consolidado (pode ser vazio se não há mais alocações)
        await this.disciplinasRepository.update(disciplinaId, { horario_consolidado: horarioConsolidado || null });
    }
}
