import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { ExcluirAlocacaoUseCase } from "@/use-cases/alocacao/excluir-alocacao";

export function makeExcluirAlocacaoUseCase() {
    const alocacoesRepository = new PrismaAlocacoesRepository();
    const disciplinasRepository = new PrismaDisciplinasRepository();
    const periodosRepository = new PrismaPeriodosLetivosRepository();
    const excluirAlocacaoUseCase = new ExcluirAlocacaoUseCase(
        alocacoesRepository,
        disciplinasRepository,
        periodosRepository,
    );
    
    return excluirAlocacaoUseCase;
}
