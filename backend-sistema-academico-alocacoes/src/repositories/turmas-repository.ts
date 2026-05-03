import { Prisma, Turma } from "@prisma/client";

interface FindManyParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  turno?: string;
  semestre?: number;
  ativa?: boolean;
  id_curso?: string;
}

interface FindManyResult {
  turmas: Turma[];
  total: number;
}

export interface TurmasRepository {
  create(data: Prisma.TurmaCreateInput): Promise<Turma>;
  findById(id: string): Promise<Turma | null>;
  findAll(): Promise<Turma[]>;
  findByNome(nome: string): Promise<Turma | null>;
  findMany(params: FindManyParams): Promise<FindManyResult>;
  update(id: string, data: Prisma.TurmaUpdateInput): Promise<Turma>;
  delete(id: string): Promise<void>;
}
