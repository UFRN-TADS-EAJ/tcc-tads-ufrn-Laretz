import { PrismaHorariosRepository } from "@/repositories/prisma-repositories/prisma-horarios-repository";
import { ExcluirHorarioUseCase } from "@/use-cases/horario/excluir-horario";

export function makeExcluirHorarioUseCase() {
    const horariosRepository = new PrismaHorariosRepository();
    const excluirHorarioUseCase = new ExcluirHorarioUseCase(horariosRepository);
    
    return excluirHorarioUseCase;
}
