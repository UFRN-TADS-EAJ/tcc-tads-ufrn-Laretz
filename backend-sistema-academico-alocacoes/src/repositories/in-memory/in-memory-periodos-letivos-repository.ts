import type { PeriodoLetivo, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { PeriodosLetivosRepository } from "../periodos-letivos-repository";

type PeriodoLetivoSeed = Omit<PeriodoLetivo, "status"> & {
  status?: PeriodoLetivo["status"];
};

export class InMemoryPeriodosLetivosRepository
  implements PeriodosLetivosRepository
{
  public items: PeriodoLetivoSeed[] = [];

  private toPeriodo(item: PeriodoLetivoSeed): PeriodoLetivo {
    return {
      ...item,
      status: item.status ?? (item.ativo ? "ATIVO" : "FUTURO"),
    };
  }

  async findActive(): Promise<PeriodoLetivo | null> {
    const ativos = this.items.filter((p) => p.ativo);
    if (ativos.length === 0) return null;
    const item = ativos.sort(
      (a, b) => b.data_inicio.getTime() - a.data_inicio.getTime(),
    )[0]!;
    return this.toPeriodo(item);
  }

  async findById(id: string): Promise<PeriodoLetivo | null> {
    const item = this.items.find((p) => p.id === id) ?? null;
    return item ? this.toPeriodo(item) : null;
  }

  async findByNome(nome: string): Promise<PeriodoLetivo | null> {
    const item = this.items.find((p) => p.nome === nome) ?? null;
    return item ? this.toPeriodo(item) : null;
  }

  async findByDate(date: Date): Promise<PeriodoLetivo | null> {
    const encontrados = this.items.filter(
      (p) => p.data_inicio <= date && p.data_fim >= date,
    );
    if (encontrados.length === 0) return null;
    const item = encontrados.sort(
      (a, b) => b.data_inicio.getTime() - a.data_inicio.getTime(),
    )[0]!;
    return this.toPeriodo(item);
  }

  async findMany(options?: { order?: "asc" | "desc" }): Promise<PeriodoLetivo[]> {
    const order = options?.order ?? "desc";
    return [...this.items]
      .sort((a, b) => {
      const diff = a.data_inicio.getTime() - b.data_inicio.getTime();
      return order === "asc" ? diff : -diff;
      })
      .map((p) => this.toPeriodo(p));
  }

  async create(data: Prisma.PeriodoLetivoCreateInput): Promise<PeriodoLetivo> {
    const periodo: PeriodoLetivo = {
      id: randomUUID(),
      nome: data.nome,
      data_inicio: data.data_inicio as Date,
      data_fim: data.data_fim as Date,
      ativo: data.ativo ?? true,
      status: (data.ativo ?? true) ? "ATIVO" : "FUTURO",
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (periodo.ativo) {
      this.items = this.items.map((p) => ({
        ...p,
        ativo: false,
        status: "ENCERRADO",
      }));
    }

    this.items.push(periodo);
    return periodo;
  }

  async activateById(id: string): Promise<PeriodoLetivo> {
    const existente = this.items.find((p) => p.id === id);
    if (!existente) throw new Error("Período letivo não encontrado");

    this.items = this.items.map((p) => ({
      ...p,
      ativo: p.id === id,
      status: p.id === id ? "ATIVO" : "ENCERRADO",
      updated_at: new Date(),
    }));

    return this.toPeriodo(this.items.find((p) => p.id === id)!);
  }

  async closeActive(): Promise<number> {
    let count = 0;
    this.items = this.items.map((p) => {
      if (!p.ativo) return p;
      count++;
      return { ...p, ativo: false, status: "ENCERRADO", updated_at: new Date() };
    });
    return count;
  }

  async closeById(id: string): Promise<PeriodoLetivo> {
    const existente = this.items.find((p) => p.id === id);
    if (!existente) throw new Error("Período letivo não encontrado");
    this.items = this.items.map((p) =>
      p.id === id ? { ...p, ativo: false, status: "ENCERRADO", updated_at: new Date() } : p,
    );
    return this.toPeriodo(this.items.find((p) => p.id === id)!);
  }
}
