import { PrismaCursosRepository } from "@/repositories/prisma-repositories/prisma-cursos-repository";
import { BuscarCursosUseCase } from "@/use-cases/curso/buscar-cursos";

export function makeBuscarCursosUseCase() {
    const cursosRepository = new PrismaCursosRepository();
    const buscarCursosUseCase = new BuscarCursosUseCase(cursosRepository);
    
    return buscarCursosUseCase;
}
