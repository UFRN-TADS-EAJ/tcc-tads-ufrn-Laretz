import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { SalasRepository } from "../salas-repository";

export class PrismaSalasRepository implements SalasRepository {

    private sortSalas<T extends { nome: string; predio?: { nome?: string | null } | null }>(salas: T[]) {
        return salas.sort((a, b) => {
            const predioA = a.predio?.nome ?? "";
            const predioB = b.predio?.nome ?? "";
            const byPredio = predioA.localeCompare(predioB, "pt-BR", { sensitivity: "base" });
            if (byPredio !== 0) return byPredio;

            return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
        });
    }

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
              },
            orderBy: [
                { predio: { nome: "asc" } },
                { nome: "asc" },
            ],
        });

        if (!salas) {
            return [];
        }

        return this.sortSalas(salas);
    }

    async findByPredioId(predioId: string) {
        const salas = await prisma.sala.findMany({
            where: { predioId },
            include: {
                predio: true
            },
            orderBy: {
                nome: "asc",
            },
        });

        return this.sortSalas(salas);
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