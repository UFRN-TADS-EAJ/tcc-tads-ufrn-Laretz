import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { PrismaAlocacoesRepository } from "@/repositories/prisma-repositories/prisma-alocacoes-repository";
import { AtualizarDisciplinaUseCase } from "@/use-cases/disciplina/atualizar-disciplina";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";

export function makeAtualizarDisciplinaUseCase() {
    const disciplinasRepository = new PrismaDisciplinasRepository();
    const alocacoesRepository = new PrismaAlocacoesRepository();
    const periodosRepository = new PrismaPeriodosLetivosRepository();
    const atualizarDisciplinaUseCase = new AtualizarDisciplinaUseCase(
        disciplinasRepository,
        alocacoesRepository,
        periodosRepository,
    );
    
    return atualizarDisciplinaUseCase;
}
