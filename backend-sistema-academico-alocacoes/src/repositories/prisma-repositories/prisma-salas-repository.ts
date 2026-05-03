import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { SalasRepository } from "../salas-repository";

export class PrismaSalasRepository implements SalasRepository {
    async create(data: Prisma.SalaCreateInput) {
        const sala = await prisma.sala.create({
            data,
        });
        return sala;
    }

    async findById(id: string) {
        const sala = await prisma.sala.findUnique({
            where: { id },
            include: {
                predio: true
            }
        });

        return sala;
    }

    async findByNome(nome: string) {
        const sala = await prisma.sala.findFirst({
            where: { nome },
        });

        return sala;
    }

    async findMany(page: number) {
        const salas = await prisma.sala.findMany({
            take: 20,
            skip: (page - 1) * 20,
            include: {
                predio: true
            }
        });

        if (!salas) {
            return [];
        }

        return salas;
    }

    async findByPredioId(predioId: string) {
        const salas = await prisma.sala.findMany({
            where: { predioId },
            include: {
                predio: true
            }
        });

        return salas;
    }

    async update(id: string, data: Prisma.SalaUpdateInput) {
        const sala = await prisma.sala.update({
            where: { id },
            data,
        });

        return sala;
    }

    async delete(id: string) {
        await prisma.sala.delete({
            where: { id },
        });
    }
}