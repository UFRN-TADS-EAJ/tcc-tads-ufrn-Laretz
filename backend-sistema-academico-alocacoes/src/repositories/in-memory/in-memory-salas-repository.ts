import type { Prisma, Sala } from "@prisma/client";
import { SalasRepository } from "../salas-repository";

export class InMemorySalasRepository implements SalasRepository {
  public items: Sala[] = [] as any;

  async create(data: Prisma.SalaCreateInput): Promise<Sala> {
    const sala: Sala = {
      id: `sala-${this.items.length + 1}`,
      nome: data.nome,
      numero: (data as any).numero ?? "001",
      capacidade: (data as any).capacidade ?? 0,
      tipo: (data as any).tipo ?? "AULA",
      computadores: (data as any).computadores ?? 0,
      predioId:
        typeof (data as any).predio === "object" &&
        "connect" in (data as any).predio &&
        (data as any).predio.connect?.id
          ? (data as any).predio.connect.id
          : "predio-1",
      ativa: true,
    } as any;

    this.items.push(sala);
    return sala;
  }

  async findById(id: string): Promise<Sala | null> {
    const sala = this.items.find((s) => s.id === id);
    return sala ?? null;
  }

  async findByNome(nome: string): Promise<Sala | null> {
    const sala = this.items.find((s) => s.nome === nome);
    return sala ?? null;
  }

  async findMany(page: number): Promise<Sala[]> {
    const start = (page - 1) * 20;
    return this.items.slice(start, start + 20);
  }

  async findByPredioId(predioId: string): Promise<Sala[]> {
    return this.items.filter((s) => (s as any).predioId === predioId);
  }

  async update(id: string, data: Prisma.SalaUpdateInput): Promise<Sala> {
    const index = this.items.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Sala não encontrada");
    const current = this.items[index]!;
    const updated: Sala = {
      ...current,
      nome: (data.nome as string) ?? current.nome,
      numero: (data as any).numero ?? current.numero,
      capacidade: (data as any).capacidade ?? current.capacidade,
      tipo: (data as any).tipo ?? current.tipo,
      computadores: (data as any).computadores ?? current.computadores,
      // suporta atualização via predioId direto ou via predio.connect
      predioId:
        (data as any).predioId ?? (
          typeof (data as any).predio === "object" &&
          "connect" in (data as any).predio &&
          (data as any).predio.connect?.id
            ? (data as any).predio.connect.id
            : current.predioId
        ),
      ativa: (data as any).ativa ?? (current as any).ativa,
    } as any;
    this.items[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Sala não encontrada");
    this.items.splice(index, 1);
  }
}
