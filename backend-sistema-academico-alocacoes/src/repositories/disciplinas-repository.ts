import { Prisma, Disciplina } from "@prisma/client";

export interface DisciplinasRepository {
    create(data: Prisma.DisciplinaCreateInput): Promise<Disciplina>
    findById(id: string): Promise<Disciplina | null>
    findByNome(nome: string): Promise<Disciplina | null>


    findMany(page: number): Promise<Disciplina[]>

    findByIds(ids: string[]): Promise<Disciplina[]>
    findByCurso(cursoId: string): Promise<Disciplina[]>
    findAll(): Promise<Disciplina[]>
    update(id: string, data: Prisma.DisciplinaUpdateInput): Promise<Disciplina>
    delete(id: string): Promise<void>
}