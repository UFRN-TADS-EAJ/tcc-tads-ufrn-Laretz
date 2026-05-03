import { PrismaCursosRepository } from "@/repositories/prisma-repositories/prisma-cursos-repository";
import { AtualizarCursoUseCase } from "@/use-cases/curso/atualizar-curso";

export function makeAtualizarCursoUseCase() {
    const cursosRepository = new PrismaCursosRepository();
    const atualizarCursoUseCase = new AtualizarCursoUseCase(cursosRepository);
    
    return atualizarCursoUseCase;
}
