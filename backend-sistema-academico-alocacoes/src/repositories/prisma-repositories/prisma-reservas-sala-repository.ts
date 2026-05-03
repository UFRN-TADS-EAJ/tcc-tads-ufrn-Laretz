import { Prisma, ReservaSala } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ReservasSalaRepository } from "../reservas-sala-repository";

export class PrismaReservasSalaRepository implements ReservasSalaRepository {
  async findById(id: string): Promise<ReservaSala | null> {
    return prisma.reservaSala.findUnique({
      where: { id },
      include: {
        criadoPor: { select: { id: true, nome: true } },
        sala: { select: { id: true, nome: true } },
        horario: { select: { id: true, codigo: true, dia_semana: true } }
      }
    });
  }

  async findManyBySeriesId(seriesId: string): Promise<ReservaSala[]> {
    return prisma.reservaSala.findMany({
      where: { seriesId },
    });
  }

  async findManyWithFilters({
    salaId,
    horarioId,
    dateFrom,
    dateTo,
    periodoId,
    page,
    limit = 20,
  }: {
    salaId?: string;
    horarioId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    periodoId: string;
    page: number;
    limit?: number;
  }): Promise<{ reservas: ReservaSala[]; total: number }> {
    const where: any = {};
    if (salaId) where.salaId = salaId;
    if (horarioId) where.horarioId = horarioId;
    where.periodoId = periodoId;

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const [reservas, total] = await Promise.all([
      prisma.reservaSala.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: [{ date: "asc" }, { horario: { codigo: "asc" } }],
        include: {
          criadoPor: { select: { id: true, nome: true } },
          sala: { select: { id: true, nome: true } },
          horario: { select: { id: true, codigo: true, dia_semana: true } }
        },
      }),
      prisma.reservaSala.count({ where }),
    ]);

    return { reservas, total };
  }

  async findConflicts(
    salaId: string,
    horarioId: string,
    dates: Date[],
    periodoId: string,
  ): Promise<ReservaSala[]> {
    return prisma.reservaSala.findMany({
      where: {
        salaId,
        horarioId,
        status: "ATIVA",
        date: { in: dates },
        periodoId,
      },
    });
  }

  async create(data: Prisma.ReservaSalaUncheckedCreateInput): Promise<ReservaSala> {
    return prisma.reservaSala.create({
      data,
      include: { criadoPor: { select: { id: true, nome: true } } },
    });
  }

  async createMany(data: Prisma.ReservaSalaUncheckedCreateInput[]): Promise<ReservaSala[]> {
    if (data.length === 0) return [];
    
    await prisma.reservaSala.createMany({
      data,
    });
    
    // Find created records because createMany doesn't return them directly
    const createdDates = data.map((d) => d.date as Date);
    const firstData = data[0];
    if (!firstData) return [];

    return prisma.reservaSala.findMany({
      where: {
        salaId: firstData.salaId,
        horarioId: firstData.horarioId,
        date: { in: createdDates },
        periodoId: firstData.periodoId,
      },
      include: { criadoPor: { select: { id: true, nome: true } } },
    });
  }

  async updateStatus(
    id: string,
    status: "ATIVA" | "CANCELADA"
  ): Promise<ReservaSala> {
    return prisma.reservaSala.update({
      where: { id },
      data: { status },
    });
  }

  async updateSeriesStatus(
    seriesId: string,
    status: "ATIVA" | "CANCELADA"
  ): Promise<number> {
    const result = await prisma.reservaSala.updateMany({
      where: { seriesId },
      data: { status },
    });
    return result.count;
  }
}
