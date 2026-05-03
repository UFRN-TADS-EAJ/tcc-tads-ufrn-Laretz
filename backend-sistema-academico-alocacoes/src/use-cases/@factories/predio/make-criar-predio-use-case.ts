import { PrismaPrediosRepository } from "@/repositories/prisma-repositories/prisma-predios-repository";
import { CriarPredioUseCase } from "@/use-cases/predio/criar-predio";

export function makeCriarPredioUseCase() {
  const prediosRepository = new PrismaPrediosRepository();
  const criarPredioUseCase = new CriarPredioUseCase(prediosRepository);

  return criarPredioUseCase;
}
