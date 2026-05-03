import { TurmasRepository } from "../../repositories/turmas-repository";

interface BuscarTurmasUseCaseRequest {
  page: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  turno?: string;
  semestre?: number;
  ativa?: boolean;
  id_curso?: string;
}

export class BuscarTurmasUseCase {
  constructor(private turmasRepository: TurmasRepository) {}

  async execute({
    page,
    limit = 20,
    search,
    sortBy,
    sortOrder,
    turno,
    semestre,
    ativa,
    id_curso,
  }: BuscarTurmasUseCaseRequest) {
    const params: any = { page, limit };

    if (search !== undefined) params.search = search;
    if (sortBy !== undefined) params.sortBy = sortBy;
    if (sortOrder !== undefined) params.sortOrder = sortOrder;
    if (turno !== undefined) params.turno = turno;
    if (semestre !== undefined) params.semestre = semestre;
    if (ativa !== undefined) params.ativa = ativa;
    if (id_curso !== undefined) params.id_curso = id_curso;

    const { turmas, total } = await this.turmasRepository.findMany(params);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return { turmas, pagination };
  }
}
