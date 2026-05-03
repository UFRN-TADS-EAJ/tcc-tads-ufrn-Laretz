import { PrismaPrediosRepository } from "@/repositories/prisma-repositories/prisma-predios-repository";
import { AtualizarPredioUseCase } from "@/use-cases/predio/atualizar-predio";

export function makeAtualizarPredioUseCase() {
  const prediosRepository = new PrismaPrediosRepository();
  const atualizarPredioUseCase = new AtualizarPredioUseCase(prediosRepository);

  return atualizarPredioUseCase;
}
