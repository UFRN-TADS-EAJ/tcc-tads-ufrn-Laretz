import type { ReservaSala, Prisma } from "@prisma/client";
import { ReservasSalaRepository } from "../reservas-sala-repository";
import { randomUUID } from "crypto";

export class InMemoryReservasSalaRepository implements ReservasSalaRepository {
  public items: ReservaSala[] = [];

  async findById(id: string): Promise<ReservaSala | null> {
    const reserva = this.items.find((item) => item.id === id);
    if (!reserva) return null;
    return reserva;
  }

  async findManyBySeriesId(seriesId: string): Promise<ReservaSala[]> {
    return this.items.filter((item) => item.seriesId === seriesId);
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
    let filtered = this.items;

    filtered = filtered.filter((item) => (item as any).periodoId === periodoId);

    if (salaId) {
      filtered = filtered.filter((item) => item.salaId === salaId);
    }

    if (horarioId) {
      filtered = filtered.filter((item) => item.horarioId === horarioId);
    }

    if (dateFrom) {
      filtered = filtered.filter((item) => item.date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter((item) => item.date <= dateTo);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return { reservas: paginated, total };
  }

  async findConflicts(
    salaId: string,
    horarioId: string,
    dates: Date[],
    periodoId: string,
  ): Promise<ReservaSala[]> {
    return this.items.filter(
      (item) =>
        item.salaId === salaId &&
        item.horarioId === horarioId &&
        (item as any).periodoId === periodoId &&
        item.status === "ATIVA" &&
        dates.some((d) => d.getTime() === item.date.getTime())
    );
  }

  async create(data: Prisma.ReservaSalaUncheckedCreateInput): Promise<ReservaSala> {
    const reserva: ReservaSala = {
      id: data.id ?? randomUUID(),
      salaId: data.salaId,
      horarioId: data.horarioId,
      date: new Date(data.date),
      titulo: data.titulo,
      descricao: data.descricao ?? null,
      criado_por: data.criado_por,
      status: data.status ?? "ATIVA",
      recurrenceRule: data.recurrenceRule ?? null,
      recurrenceEnd: data.recurrenceEnd ? new Date(data.recurrenceEnd) : null,
      seriesId: data.seriesId ?? null,
      periodoId: data.periodoId,
      created_at: new Date(),
      updated_at: new Date(),
    } as any;

    this.items.push(reserva);
    return reserva;
  }

  async createMany(data: Prisma.ReservaSalaUncheckedCreateInput[]): Promise<ReservaSala[]> {
    const reservas: ReservaSala[] = [];
    for (const d of data) {
      reservas.push(await this.create(d));
    }
    return reservas;
  }

  async updateStatus(
    id: string,
    status: "ATIVA" | "CANCELADA"
  ): Promise<ReservaSala> {
    const reservaIndex = this.items.findIndex((item) => item.id === id);
    if (reservaIndex === -1) {
      throw new Error("Reserva não encontrada");
    }

    const reserva = this.items[reservaIndex];
    if (reserva) {
      reserva.status = status;
      reserva.updated_at = new Date();
      return reserva;
    }
    throw new Error("Reserva não encontrada");
  }

  async updateSeriesStatus(
    seriesId: string,
    status: "ATIVA" | "CANCELADA"
  ): Promise<number> {
    let count = 0;
    this.items.forEach((item, index) => {
      if (item.seriesId === seriesId) {
        const reserva = this.items[index];
        if (reserva) {
          reserva.status = status;
          reserva.updated_at = new Date();
          count++;
        }
      }
    });
    return count;
  }
}
