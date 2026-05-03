import { PrediosRepository } from "@/repositories/predios-repository";

export interface BuscarPrediosUseCaseRequest {
  search?: string;
  sortBy?: "nome" | "codigo" | "created_at" | "updated_at" | "descricao";
  sortOrder?: "asc" | "desc";
}

export class BuscarPrediosUseCase {
  constructor(private prediosRepository: PrediosRepository) {}

  async execute({
    search,
    sortBy,
    sortOrder,
  }: BuscarPrediosUseCaseRequest = {}) {
    const params: any = {};
    if (search !== undefined) params.search = search;
    if (sortBy !== undefined) params.sortBy = sortBy;
    if (sortOrder !== undefined) params.sortOrder = sortOrder;

    const predios = await this.prediosRepository.findManyWithSalasAtivas(params);
    return { predios };
  }
}
