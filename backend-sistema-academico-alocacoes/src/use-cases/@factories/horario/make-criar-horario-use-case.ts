import { PrismaHorariosRepository } from "@/repositories/prisma-repositories/prisma-horarios-repository";
import { CriarHorarioUseCase } from "@/use-cases/horario/criar-horario";

export function makeCriarHorarioUseCase() {
    const horariosRepository = new PrismaHorariosRepository();
    const criarHorarioUseCase = new CriarHorarioUseCase(horariosRepository);
    
    return criarHorarioUseCase;
}
