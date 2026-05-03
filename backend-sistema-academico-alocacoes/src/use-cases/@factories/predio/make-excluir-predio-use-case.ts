import { PrismaPrediosRepository } from "@/repositories/prisma-repositories/prisma-predios-repository";
import { ExcluirPredioUseCase } from "@/use-cases/predio/excluir-predio";

export function makeExcluirPredioUseCase() {
  const prediosRepository = new PrismaPrediosRepository();
  const excluirPredioUseCase = new ExcluirPredioUseCase(prediosRepository);

  return excluirPredioUseCase;
}
