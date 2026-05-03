import { randomUUID } from "node:crypto";
import type { Prisma, TurnoCurso, Curso } from "@prisma/client";
import { CursosRepository } from "../cursos-repository";

// interface Curso {
//   id: string;
//   codigo: string;
//   nome: string;
//   turno: TurnoCurso;
//   duracao_semestres: number;
//   ativo: boolean;
//   isDeleted: Date | null;
//   created_at: Date;
//   updated_at: Date;
// }

export class InMemoryCursosRepository implements CursosRepository {
  public items: Curso[] = [];

  async create(data: Prisma.CursoCreateInput): Promise<Curso> {
    const curso: Curso = {
      id: randomUUID(),
      codigo: data.codigo,
      nome: data.nome,
      turno: data.turno,
      duracao_semestres: data.duracao_semestres,
      ativo: data.ativo ?? true,
      isDeleted: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.items.push(curso);
    return curso;
  }

  async findById(id: string): Promise<Curso | null> {
    const curso = this.items.find(
      (item) => item.id === id && item.isDeleted === null
    );
    return curso || null;
  }

  async findByCodigo(codigo: string): Promise<Curso | null> {
    const curso = this.items.find(
      (item) => item.codigo === codigo && item.isDeleted === null
    );
    return curso || null;
  }

  async findByNome(nome: string): Promise<Curso | null> {
    const curso = this.items.find(
      (item) => item.nome === nome && item.isDeleted === null
    );
    return curso || null;
  }

  async findMany(): Promise<Curso[]> {
    return this.items
      .filter((i) => i.isDeleted === null)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async update(id: string, data: Prisma.CursoUpdateInput): Promise<Curso> {
    const cursoIndex = this.items.findIndex((item) => item.id === id);

    if (cursoIndex === -1) {
      throw new Error("Curso not found");
    }

    const curso = this.items[cursoIndex];
    const updatedCurso: Curso = {
      id: curso?.id ?? "",
      codigo:
        typeof data.codigo === "string" ? data.codigo : (curso?.codigo ?? ""),
      nome: typeof data.nome === "string" ? data.nome : (curso?.nome ?? ""),
      turno: data.turno
        ? (data.turno as TurnoCurso)
        : (curso?.turno ?? ("MATUTINO" as TurnoCurso)),
      duracao_semestres:
        typeof data.duracao_semestres === "number"
          ? data.duracao_semestres
          : (curso?.duracao_semestres ?? 0),
      ativo:
        typeof data.ativo === "boolean" ? data.ativo : (curso?.ativo ?? true),
      isDeleted: curso?.isDeleted ?? null,
      created_at: curso?.created_at ?? new Date(),
      updated_at: new Date(),
    };

    this.items[cursoIndex] = updatedCurso;
    return updatedCurso;
  }

  async delete(id: string): Promise<void> {
    const cursoIndex = this.items.findIndex((item) => item.id === id);

    if (cursoIndex === -1) {
      throw new Error("Curso not found");
    }

    const curso = this.items[cursoIndex] as Curso;
    this.items[cursoIndex] = { ...curso, isDeleted: new Date() } as Curso;
  }
}
