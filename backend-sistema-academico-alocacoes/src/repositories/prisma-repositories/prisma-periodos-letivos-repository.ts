import { PeriodoLetivo, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PeriodosLetivosRepository } from "../periodos-letivos-repository";

export class PrismaPeriodosLetivosRepository
  implements PeriodosLetivosRepository
{
  async findActive(): Promise<PeriodoLetivo | null> {
    return prisma.periodoLetivo.findFirst({
      where: { ativo: true },
      orderBy: { data_inicio: "desc" },
    });
  }

  async findById(id: string): Promise<PeriodoLetivo | null> {
    return prisma.periodoLetivo.findUnique({ where: { id } });
  }

  async findByNome(nome: string): Promise<PeriodoLetivo | null> {
    return prisma.periodoLetivo.findUnique({ where: { nome } });
  }

  async findByDate(date: Date): Promise<PeriodoLetivo | null> {
    return prisma.periodoLetivo.findFirst({
      where: {
        data_inicio: { lte: date },
        data_fim: { gte: date },
      },
      orderBy: { data_inicio: "desc" },
    });
  }

  async findMany(options?: { order?: "asc" | "desc" }): Promise<PeriodoLetivo[]> {
    const order = options?.order ?? "desc";
    return prisma.periodoLetivo.findMany({
      orderBy: { data_inicio: order },
    });
  }

  async create(data: Prisma.PeriodoLetivoCreateInput): Promise<PeriodoLetivo> {
    const shouldActivate = data.ativo ?? true;

    if (!shouldActivate) {
      return prisma.periodoLetivo.create({
        data: {
          ...data,
          ativo: false,
          status: "FUTURO",
        },
      });
    }

    return prisma.$transaction(async (tx) => {
      await tx.periodoLetivo.updateMany({
        where: { ativo: true },
        data: { ativo: false, status: "ENCERRADO" },
      });

      return tx.periodoLetivo.create({
        data: {
          ...data,
          ativo: true,
          status: "ATIVO",
        },
      });
    });
  }

  async activateById(id: string): Promise<PeriodoLetivo> {
    return prisma.$transaction(async (tx) => {
      await tx.periodoLetivo.updateMany({
        where: { ativo: true },
        data: { ativo: false, status: "ENCERRADO" },
      });

      return tx.periodoLetivo.update({
        where: { id },
        data: { ativo: true, status: "ATIVO" },
      });
    });
  }

  async closeActive(): Promise<number> {
    const res = await prisma.periodoLetivo.updateMany({
      where: { ativo: true },
      data: { ativo: false, status: "ENCERRADO" },
    });
    return res.count;
  }

  async closeById(id: string): Promise<PeriodoLetivo> {
    return prisma.periodoLetivo.update({
      where: { id },
      data: { ativo: false, status: "ENCERRADO" },
    });
  }
}
