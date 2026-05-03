import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { DisciplinasRepository } from "../disciplinas-repository";

export class PrismaDisciplinasRepository implements DisciplinasRepository {
    async create(data: Prisma.DisciplinaCreateInput) {
        const disciplina = await prisma.disciplina.create({
            data,
        });
        return disciplina;
    }

    async findById(id: string) {
        const disciplina = await prisma.disciplina.findUnique({
            where: { id },
            include: {
                curso: {
                    select: {
                        id: true,
                        nome: true,
                        codigo: true,
                    },
                },
            },
        });

        return disciplina;
    }

    async findByNome(nome: string) {
        const disciplina = await prisma.disciplina.findFirst({
            where: { nome },
        });

        return disciplina;
    }

    async findByIds(ids: string[]) {
        const disciplinas = await prisma.disciplina.findMany({
            where: {
                id: {
                    in: ids
                }
            },
            include: {
                curso: {
                    select: {
                        id: true,
                        nome: true,
                        codigo: true,
                    },
                },
            },
        });

        return disciplinas;
    }

    async findByCurso(cursoId: string) {
        const links = await prisma.cursoDisciplina.findMany({
            where: { id_curso: cursoId },
            include: {
                disciplina: {
                    include: {
                        curso: {
                            select: {
                                id: true,
                                nome: true,
                                codigo: true,
                            },
                        },
                    },
                },
            },
        });

        return links.map((l) => l.disciplina);
    }

    async findAll() {
        const disciplinas = await prisma.disciplina.findMany({
            include: {
                curso: {
                    select: {
                        id: true,
                        nome: true,
                        codigo: true,
                    },
                },
            },
        });

        return disciplinas;
    }

    async findMany(page: number) {
        const itemsPerPage = 20;
        const skip = (page - 1) * itemsPerPage;
        const disciplinas = await prisma.disciplina.findMany({
            skip,
            take: itemsPerPage,
            include: {
                curso: {
                    select: {
                        id: true,
                        nome: true,
                        codigo: true,
                    },
                },
            },
        });
        return disciplinas;
    }

    async update(id: string, data: Prisma.DisciplinaUpdateInput) {
        const disciplina = await prisma.disciplina.update({
            where: { id },
            data,
            include: {
                curso: {
                    select: {
                        id: true,
                        nome: true,
                        codigo: true,
                    },
                },
                alocacoes: true
            },
        });

        return disciplina;
    }

    async delete(id: string) {
        await prisma.disciplina.delete({
            where: { id },
        });
    }
}