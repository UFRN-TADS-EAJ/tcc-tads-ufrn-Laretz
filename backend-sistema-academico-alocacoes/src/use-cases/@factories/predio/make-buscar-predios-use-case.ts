import { PrismaPrediosRepository } from "@/repositories/prisma-repositories/prisma-predios-repository";
import { BuscarPrediosUseCase } from "@/use-cases/predio/buscar-predios";

export function makeBuscarPrediosUseCase() {
  const prediosRepository = new PrismaPrediosRepository();
  const buscarPrediosUseCase = new BuscarPrediosUseCase(prediosRepository);

  return buscarPrediosUseCase;
}
