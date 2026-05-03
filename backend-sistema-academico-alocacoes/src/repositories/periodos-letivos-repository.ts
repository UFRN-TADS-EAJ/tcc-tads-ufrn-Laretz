import { PeriodoLetivo, Prisma } from "@prisma/client";

export interface PeriodosLetivosRepository {
  findActive(): Promise<PeriodoLetivo | null>;
  findById(id: string): Promise<PeriodoLetivo | null>;
  findByNome(nome: string): Promise<PeriodoLetivo | null>;
  findByDate(date: Date): Promise<PeriodoLetivo | null>;
  findMany(options?: { order?: "asc" | "desc" }): Promise<PeriodoLetivo[]>;
  create(data: Prisma.PeriodoLetivoCreateInput): Promise<PeriodoLetivo>;
  activateById(id: string): Promise<PeriodoLetivo>;
  closeActive(): Promise<number>;
  closeById(id: string): Promise<PeriodoLetivo>;
}
