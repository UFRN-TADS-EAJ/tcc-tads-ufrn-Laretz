import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { BuscarAlocacaoUseCase } from "@/use-cases/alocacao/buscar-alocacao";

export function makeBuscarAlocacaoUseCase() {
    const alocacoesRepository = new PrismaAlocacoesRepository();
    const periodosRepository = new PrismaPeriodosLetivosRepository();
    const buscarAlocacaoUseCase = new BuscarAlocacaoUseCase(
        alocacoesRepository,
        periodosRepository,
    );
    
    return buscarAlocacaoUseCase;
}
