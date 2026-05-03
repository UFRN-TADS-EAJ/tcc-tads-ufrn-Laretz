import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CursosRepository } from "../cursos-repository";

export class PrismaCursosRepository implements CursosRepository {
    async create(data: Prisma.CursoCreateInput) {
        const curso = await prisma.curso.create({
            data,
        });
        return curso;
    }

    async findById(id: string) {
        const curso = await prisma.curso.findFirst({
            where: { id, isDeleted: null },
        });

        return curso;
    }

    async findByNome(nome: string) {
        const curso = await prisma.curso.findFirst({
            where: { nome, isDeleted: null },
        });

        return curso;
    }

    async findByCodigo(codigo: string) {
        const curso = await prisma.curso.findFirst({
            where: { codigo, isDeleted: null },
        });

        return curso;
    }

    async findMany() {

        const cursos = await prisma.curso.findMany({
            where: { isDeleted: null },
            orderBy: { nome: 'asc' },
        });

        return cursos;
    }

    async update(id: string, data: Prisma.CursoUpdateInput) {
        const curso = await prisma.curso.update({
            where: { id },
            data,
            include: {
                disciplinas: true
            }
        });

        return curso;
    }

    async delete(id: string) {
        await prisma.curso.update({
            where: { id },
            data: { isDeleted: new Date() },
        });
    }
}