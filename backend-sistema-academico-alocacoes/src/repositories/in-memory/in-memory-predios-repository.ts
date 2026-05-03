import { randomUUID } from "node:crypto";
import type { Predio, Prisma } from "@prisma/client";
import type {
  BuscarPrediosParams,
  PredioComSalasAtivas,
  PredioComSalasBasico,
  PredioComSalasResumo,
  PrediosRepository,
} from "../predios-repository";

type SalaItem = {
  id: string;
  nome: string;
  numero?: string | null;
  capacidade: number;
  tipo: string;
  computadores: number;
  ativa?: boolean;
  predioId?: string | null;
};

export class InMemoryPrediosRepository implements PrediosRepository {
  public items: Predio[] = [];

  constructor(private salasRepository?: { items: SalaItem[] }) {}

  async create(data: Prisma.PredioCreateInput): Promise<Predio> {
    const predio: Predio = {
      id: randomUUID(),
      codigo: data.codigo,
      nome: data.nome,
      descricao: (data.descricao as string | null | undefined) ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.items.push(predio);
    return predio;
  }

  async findByCodigo(codigo: string): Promise<Predio | null> {
    const predio = this.items.find((p) => p.codigo === codigo) ?? null;
    return predio;
  }

  async findByIdWithSalasBasico(id: string): Promise<PredioComSalasBasico | null> {
    const predio = this.items.find((p) => p.id === id) ?? null;
    if (!predio) return null;

    const salas = (this.salasRepository?.items ?? [])
      .filter((s) => s.predioId === predio.id)
      .map((s) => ({
        id: s.id,
        nome: s.nome,
        capacidade: s.capacidade,
        tipo: s.tipo,
        computadores: s.computadores,
      }));

    return { ...predio, salas } as unknown as PredioComSalasBasico;
  }

  async findManyWithSalasAtivas(params: BuscarPrediosParams): Promise<PredioComSalasAtivas[]> {
    const search = params.search?.trim().toLowerCase();
    const sortBy = params.sortBy ?? "nome";
    const sortOrder = params.sortOrder ?? "asc";

    let predios = [...this.items];

    if (search) {
      predios = predios.filter((p) => {
        const codigo = p.codigo?.toLowerCase() ?? "";
        const nome = p.nome?.toLowerCase() ?? "";
        const descricao = p.descricao?.toLowerCase() ?? "";
        return codigo.includes(search) || nome.includes(search) || descricao.includes(search);
      });
    }

    predios.sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal instanceof Date && bVal instanceof Date) {
        return (aVal.getTime() - bVal.getTime()) * dir;
      }

      return String(aVal ?? "").localeCompare(String(bVal ?? "")) * dir;
    });

    const result = predios.map((predio) => {
      const salas = (this.salasRepository?.items ?? [])
        .filter((s) => s.predioId === predio.id)
        .filter((s) => s.ativa === true)
        .map((s) => ({
          id: s.id,
          nome: s.nome,
          numero: s.numero ?? null,
          capacidade: s.capacidade,
          tipo: s.tipo,
          computadores: s.computadores,
          ativa: true,
        }));

      return { ...predio, salas } as unknown as PredioComSalasAtivas;
    });

    return result;
  }

  async updateWithSalasResumo(id: string, data: Prisma.PredioUpdateInput): Promise<PredioComSalasResumo> {
    const idx = this.items.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error("Predio not found");
    }

    const current = this.items[idx]!;
    const updated: Predio = {
      ...current,
      codigo: (data.codigo as string) ?? current.codigo,
      nome: (data.nome as string) ?? current.nome,
      descricao: data.descricao !== undefined ? ((data.descricao as string | null) ?? null) : current.descricao,
      updated_at: new Date(),
    };

    this.items[idx] = updated;

    const salas = (this.salasRepository?.items ?? [])
      .filter((s) => s.predioId === id)
      .map((s) => ({
        id: s.id,
        nome: s.nome,
        capacidade: s.capacidade,
        tipo: s.tipo,
      }));

    return { ...updated, salas } as unknown as PredioComSalasResumo;
  }

  async delete(id: string): Promise<void> {
    const idx = this.items.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error("Predio not found");
    }
    this.items.splice(idx, 1);
  }
}
