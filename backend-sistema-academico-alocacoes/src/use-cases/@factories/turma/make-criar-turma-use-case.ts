import { PrismaTurmasRepository } from "@/repositories/prisma-repositories/prisma-turmas-repository";
import { CriarTurmaUseCase } from "@/use-cases/turma/criar-turma";

export function makeCriarTurmaUseCase() {
    const turmasRepository = new PrismaTurmasRepository();
    const criarTurmaUseCase = new CriarTurmaUseCase(turmasRepository);
    
    return criarTurmaUseCase;
}
