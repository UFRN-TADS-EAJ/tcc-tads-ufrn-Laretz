import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { PrismaHorariosRepository } from "@/repositories/prisma-repositories/prisma-horarios-repository";
import { PrismaSalasRepository } from "@/repositories/prisma-repositories/prisma-salas-repository";
import { PrismaTurmasRepository } from "@/repositories/prisma-repositories/prisma-turmas-repository";
import { PrismaUsersRepository } from "@/repositories/prisma-repositories/prisma-users-repository";
import { BuscarAlocacoesBootstrapUseCase } from "@/use-cases/alocacao/buscar-alocacoes-bootstrap";

export function makeBuscarAlocacoesBootstrapUseCase() {
  const turmasRepository = new PrismaTurmasRepository();
  const salasRepository = new PrismaSalasRepository();
  const usersRepository = new PrismaUsersRepository();
  const horariosRepository = new PrismaHorariosRepository();
  const disciplinasRepository = new PrismaDisciplinasRepository();

  return new BuscarAlocacoesBootstrapUseCase(
    turmasRepository,
    salasRepository,
    usersRepository,
    horariosRepository,
    disciplinasRepository,
  );
}

