import { PrismaCursosRepository } from "@/repositories/prisma-repositories/prisma-cursos-repository";
import { BuscarCursoUseCase } from "@/use-cases/curso/buscar-curso";

export function makeBuscarCursoUseCase() {
    const cursosRepository = new PrismaCursosRepository();
    const buscarCursoUseCase = new BuscarCursoUseCase(cursosRepository);
    
    return buscarCursoUseCase;
}
