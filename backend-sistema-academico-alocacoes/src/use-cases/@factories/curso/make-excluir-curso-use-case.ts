import { PrismaCursosRepository } from "@/repositories/prisma-repositories/prisma-cursos-repository";
import { ExcluirCursoUseCase } from "@/use-cases/curso/excluir-curso";

export function makeExcluirCursoUseCase() {
    const cursosRepository = new PrismaCursosRepository();
    const excluirCursoUseCase = new ExcluirCursoUseCase(cursosRepository);
    
    return excluirCursoUseCase;
}
