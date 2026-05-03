import { PrismaTurmasRepository } from "@/repositories/prisma-repositories/prisma-turmas-repository";
import { ListarTodasTurmasUseCase } from "../../turma/listar-todas-turmas";

export function makeListarTodasTurmasUseCase() {
  const turmasRepository = new PrismaTurmasRepository();
  const useCase = new ListarTodasTurmasUseCase(turmasRepository);

  return useCase;
}
