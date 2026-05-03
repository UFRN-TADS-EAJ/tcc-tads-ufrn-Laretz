import { Prisma, Curso } from "@prisma/client";

export interface CursosRepository {
    create(data: Prisma.CursoCreateInput): Promise<Curso>
    findById(id: string): Promise<Curso | null>
    findByNome(nome: string): Promise<Curso | null>
    findByCodigo(codigo: string): Promise<Curso | null>

    findMany(): Promise<Curso[]>

    update(id: string, data: Prisma.CursoUpdateInput): Promise<Curso>
    delete(id: string): Promise<void>
}