import { Prisma, Sala } from "@prisma/client";

export interface SalasRepository {
    create(data: Prisma.SalaCreateInput): Promise<Sala>
    findById(id: string): Promise<Sala | null>
    findByNome(nome: string): Promise<Sala | null>
    findMany(page: number): Promise<Sala[]>
    findByPredioId(predioId: string): Promise<Sala[]>
    update(id: string, data: Prisma.SalaUpdateInput): Promise<Sala>
    delete(id: string): Promise<void>
}