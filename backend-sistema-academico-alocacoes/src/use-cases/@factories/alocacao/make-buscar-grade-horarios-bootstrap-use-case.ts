import { PrismaHorariosRepository } from "@/repositories/prisma-repositories/prisma-horarios-repository";
import { PrismaPeriodosLetivosRepository } from "@/repositories/prisma-repositories/prisma-periodos-letivos-repository";
import { PrismaSalasRepository } from "@/repositories/prisma-repositories/prisma-salas-repository";
import { PrismaTurmasRepository } from "@/repositories/prisma-repositories/prisma-turmas-repository";
import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { BuscarGradeHorariosBootstrapUseCase } from "@/use-cases/alocacao/buscar-grade-horarios-bootstrap";

export function makeBuscarGradeHorariosBootstrapUseCase() {
  const turmasRepository = new PrismaTurmasRepository();
  const salasRepository = new PrismaSalasRepository();
  const usersRepository = new PrismaUsersRepository();
  const periodosRepository = new PrismaPeriodosLetivosRepository();
  const horariosRepository = new PrismaHorariosRepository();

  return new BuscarGradeHorariosBootstrapUseCase(
    turmasRepository,
    salasRepository,
    usersRepository,
    periodosRepository,
    horariosRepository,
  );
}

