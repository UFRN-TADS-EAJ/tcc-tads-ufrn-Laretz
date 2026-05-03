import { PrismaHorariosRepository } from "@/repositories/prisma-repositories/prisma-horarios-repository";
import { AtualizarHorarioUseCase } from "@/use-cases/horario/atualizar-horario";

export function makeAtualizarHorarioUseCase() {
    const horariosRepository = new PrismaHorariosRepository();
    const atualizarHorarioUseCase = new AtualizarHorarioUseCase(horariosRepository);
    
    return atualizarHorarioUseCase;
}
