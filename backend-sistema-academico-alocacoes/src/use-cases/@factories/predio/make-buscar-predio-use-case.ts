import { PrismaPrediosRepository } from "@/repositories/prisma-repositories/prisma-predios-repository";
import { BuscarPredioUseCase } from "@/use-cases/predio/buscar-predio";

export function makeBuscarPredioUseCase() {
  const prediosRepository = new PrismaPrediosRepository();
  const buscarPredioUseCase = new BuscarPredioUseCase(prediosRepository);

  return buscarPredioUseCase;
}
