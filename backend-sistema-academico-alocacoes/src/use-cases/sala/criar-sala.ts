import { SalasRepository } from "@/repositories/salas-repository";

interface CriarSalaUseCaseRequest {
  nome: string;
  numero?: string;
  predioId: string;
  capacidade: number;
  tipo: string;
  computadores?: number;
}
export class CriarSalaUseCase {
  constructor(private salasRepository: SalasRepository) {}

  async execute({
    nome,
    numero,
    predioId,
    capacidade,
    tipo,
    computadores,
  }: CriarSalaUseCaseRequest) {
    const sala = await this.salasRepository.create({
      nome,
      numero: numero ?? "999",
      capacidade,
      tipo,
      computadores: computadores ?? 0,
      predio: { connect: { id: predioId } },
    });

    return { sala };
  }
}
