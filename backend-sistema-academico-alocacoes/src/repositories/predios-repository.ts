import { Prisma, Predio } from "@prisma/client";

export type PredioComSalasBasico = Prisma.PredioGetPayload<{
  include: {
    salas: {
      select: {
        id: true;
        nome: true;
        capacidade: true;
        tipo: true;
        computadores: true;
      };
    };
  };
}>;

export type PredioComSalasAtivas = Prisma.PredioGetPayload<{
  include: {
    salas: {
      where: { ativa: true };
      select: {
        id: true;
        nome: true;
        numero: true;
        capacidade: true;
        tipo: true;
        computadores: true;
        ativa: true;
      };
    };
  };
}>;

export type PredioComSalasResumo = Prisma.PredioGetPayload<{
  include: {
    salas: {
      select: {
        id: true;
        nome: true;
        capacidade: true;
        tipo: true;
      };
    };
  };
}>;

export interface BuscarPrediosParams {
  search?: string;
  sortBy?: "nome" | "codigo" | "descricao" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

export interface PrediosRepository {
  create(data: Prisma.PredioCreateInput): Promise<Predio>;
  findByIdWithSalasBasico(id: string): Promise<PredioComSalasBasico | null>;
  findByCodigo(codigo: string): Promise<Predio | null>;
  findManyWithSalasAtivas(params: BuscarPrediosParams): Promise<PredioComSalasAtivas[]>;
  updateWithSalasResumo(
    id: string,
    data: Prisma.PredioUpdateInput,
  ): Promise<PredioComSalasResumo>;
  delete(id: string): Promise<void>;
}
