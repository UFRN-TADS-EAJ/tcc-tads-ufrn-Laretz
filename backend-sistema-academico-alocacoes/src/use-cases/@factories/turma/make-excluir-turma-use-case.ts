import { PrismaTurmasRepository } from "@/repositories/prisma-repositories/prisma-turmas-repository";
import { ExcluirTurmaUseCase } from "@/use-cases/turma/excluir-turma";

export function makeExcluirTurmaUseCase() {
    const turmasRepository = new PrismaTurmasRepository();
    const excluirTurmaUseCase = new ExcluirTurmaUseCase(turmasRepository);
    
    return excluirTurmaUseCase;
}
