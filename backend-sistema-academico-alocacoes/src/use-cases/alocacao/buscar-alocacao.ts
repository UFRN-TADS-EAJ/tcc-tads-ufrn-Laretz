import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface BuscarAlocacaoUseCaseRequest {
    id: string;
}

export class BuscarAlocacaoUseCase {
    constructor(
        private alocacoesRepository: AlocacoesRepository,
        private periodosRepository: PeriodosLetivosRepository,
    ) {}

    async execute({ id }: BuscarAlocacaoUseCaseRequest) {
        const periodoAtivo = await this.periodosRepository.findActive();
        if (!periodoAtivo) {
            throw new Error("Nenhum período letivo ativo encontrado");
        }

        const alocacao = await this.alocacoesRepository.findById(id, periodoAtivo.id);

        if (!alocacao) {
            throw new RecursoNaoEncontradoError();
        }

        return { alocacao };
    }
}
