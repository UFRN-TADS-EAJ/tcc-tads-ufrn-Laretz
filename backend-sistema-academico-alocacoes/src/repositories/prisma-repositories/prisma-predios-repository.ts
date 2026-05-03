import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { PrediosRepository, BuscarPrediosParams } from "../predios-repository";

export class PrismaPrediosRepository implements PrediosRepository {
  async create(data: Prisma.PredioCreateInput) {
    const predio = await prisma.predio.create({
      data,
    });

    return predio;
  }

  async findByIdWithSalasBasico(id: string) {
    const predio = await prisma.predio.findUnique({
      where: { id },
      include: {
        salas: {
          select: {
            id: true,
            nome: true,
            capacidade: true,
            tipo: true,
            computadores: true,
          },
        },
      },
    });

    return predio;
  }

  async findByCodigo(codigo: string) {
    const predio = await prisma.predio.findUnique({
      where: { codigo },
    });

    return predio;
  }

  async findManyWithSalasAtivas({
    search,
    sortBy = "nome",
    sortOrder = "asc",
  }: BuscarPrediosParams) {
    const where = search
      ? {
          OR: [
            { nome: { contains: search, mode: "insensitive" as const } },
            { codigo: { contains: search, mode: "insensitive" as const } },
            { descricao: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const predios = await prisma.predio.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        salas: {
          where: {
            ativa: true,
          },
          select: {
            id: true,
            nome: true,
            numero: true,
            capacidade: true,
            tipo: true,
            computadores: true,
            ativa: true,
          },
        },
      },
    });

    return predios ?? [];
  }

  async updateWithSalasResumo(id: string, data: Prisma.PredioUpdateInput) {
    const predio = await prisma.predio.update({
      where: { id },
      data,
      include: {
        salas: {
          select: {
            id: true,
            nome: true,
            capacidade: true,
            tipo: true,
          },
        },
      },
    });

    return predio;
  }

  async delete(id: string) {
    await prisma.predio.delete({
      where: { id },
    });
  }
}
