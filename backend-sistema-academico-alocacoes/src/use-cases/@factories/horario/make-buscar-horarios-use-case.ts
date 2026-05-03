import { PrismaHorariosRepository } from "@/repositories/prisma-repositories/prisma-horarios-repository";
import { BuscarHorariosUseCase } from "@/use-cases/horario/buscar-horarios";

export function makeBuscarHorariosUseCase() {
    const horariosRepository = new PrismaHorariosRepository();
    const buscarHorariosUseCase = new BuscarHorariosUseCase(horariosRepository);
    
    return buscarHorariosUseCase;
}
