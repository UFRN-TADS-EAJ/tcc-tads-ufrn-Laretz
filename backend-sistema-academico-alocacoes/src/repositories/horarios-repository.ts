import { Prisma, Horario, RegimeHorario } from "@prisma/client";

export interface HorariosRepository {
  create(data: Prisma.HorarioCreateInput): Promise<Horario>;
  findById(id: string): Promise<Horario | null>;
  findByDiaEHorario(
    dia_semana: string,
    horario_inicio: Date,
    horario_fim: Date,
  ): Promise<Horario | null>;
  findMany(page?: number, regime?: RegimeHorario): Promise<Horario[]>;
  findManyWithFilters(params: {
    page: number;
    limit: number;
    regime?: RegimeHorario;
    dia_semana?: string;
  }): Promise<{ horarios: Horario[]; total: number }>;
  update(id: string, data: Prisma.HorarioUpdateInput): Promise<Horario>;
  delete(id: string): Promise<void>;
}
