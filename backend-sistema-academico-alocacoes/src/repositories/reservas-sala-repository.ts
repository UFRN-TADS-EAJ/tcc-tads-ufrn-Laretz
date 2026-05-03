import { ReservaSala, Prisma } from "@prisma/client";

export interface ReservasSalaRepository {
  findById(id: string): Promise<ReservaSala | null>;
  findManyBySeriesId(seriesId: string): Promise<ReservaSala[]>;
  findManyWithFilters(params: {
    salaId?: string;
    horarioId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    periodoId: string;
    page: number;
    limit?: number;
  }): Promise<{ reservas: ReservaSala[]; total: number }>;
  
  // Verifica se já existe reserva para a mesma sala, horário e data(s)
  findConflicts(
    salaId: string,
    horarioId: string,
    dates: Date[],
    periodoId: string,
  ): Promise<ReservaSala[]>;

  create(data: Prisma.ReservaSalaUncheckedCreateInput): Promise<ReservaSala>;
  createMany(data: Prisma.ReservaSalaUncheckedCreateInput[]): Promise<ReservaSala[]>;
  updateStatus(id: string, status: "ATIVA" | "CANCELADA"): Promise<ReservaSala>;
  updateSeriesStatus(seriesId: string, status: "ATIVA" | "CANCELADA"): Promise<number>;
}
