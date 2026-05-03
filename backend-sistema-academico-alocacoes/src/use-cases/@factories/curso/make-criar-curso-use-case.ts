import { PrismaCursosRepository } from "@/repositories/prisma-repositories/prisma-cursos-repository";
import { CriarCursoUseCase } from "@/use-cases/curso/criar-curso";

export function makeCriarCursoUseCase() {
    const cursosRepository = new PrismaCursosRepository();
    const criarCursoUseCase = new CriarCursoUseCase(cursosRepository);
    
    return criarCursoUseCase;
}
