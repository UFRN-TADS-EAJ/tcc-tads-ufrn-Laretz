import { PrismaHorariosRepository } from "@/repositories/prisma-repositories/prisma-horarios-repository";
import { BuscarHorariosGradeConfigUseCase } from "@/use-cases/horario/buscar-horarios-grade-config";

export function makeBuscarHorariosGradeConfigUseCase() {
  const horariosRepository = new PrismaHorariosRepository();
  return new BuscarHorariosGradeConfigUseCase(horariosRepository);
}

