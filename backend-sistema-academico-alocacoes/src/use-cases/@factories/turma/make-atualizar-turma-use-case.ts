import { PrismaTurmasRepository } from "@/repositories/prisma-repositories/prisma-turmas-repository";
import { AtualizarTurmaUseCase } from "@/use-cases/turma/atualizar-turma";

export function makeAtualizarTurmaUseCase() {
    const turmasRepository = new PrismaTurmasRepository();
    const atualizarTurmaUseCase = new AtualizarTurmaUseCase(turmasRepository);
    
    return atualizarTurmaUseCase;
}
