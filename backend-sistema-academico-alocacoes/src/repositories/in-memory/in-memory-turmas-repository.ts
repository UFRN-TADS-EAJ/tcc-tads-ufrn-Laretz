import type { Prisma, Turma } from "@prisma/client";
import { TurmasRepository } from "../turmas-repository";

export class InMemoryTurmasRepository implements TurmasRepository {
  private turmas: Turma[] = [];

  async create(data: Prisma.TurmaCreateInput): Promise<Turma> {
    const turma: Turma = {
      id: `turma-${this.turmas.length + 1}`,
      nome: data.nome,
      num_alunos: data.num_alunos || 30,
      turno: data.turno || "MATUTINO",
      id_curso:
        typeof data.curso === "object" &&
        "connect" in data.curso &&
        data.curso.connect?.id
          ? data.curso.connect.id
          : "curso-default",
      semestre: data.semestre || 1,
      ativa: data.ativa !== undefined ? data.ativa : true,
    };

    this.turmas.push(turma);

    return turma;
  }

  async findById(id: string): Promise<Turma | null> {
    const turma = this.turmas.find((t) => t.id === id);
    return turma ?? null;
  }

  async findAll(): Promise<Turma[]> {
    return this.turmas;
  }

  async findByNome(nome: string): Promise<Turma | null> {
    const turma = this.turmas.find((t) => t.nome === nome);
    return turma ?? null;
  }

  async findMany({
    page,
    limit,
    search,
    sortBy = "nome",
    sortOrder = "asc",
    turno,
    semestre,
    ativa,
    id_curso,
  }: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    turno?: string;
    semestre?: number;
    ativa?: boolean;
    id_curso?: string;
  }): Promise<{ turmas: Turma[]; total: number }> {
    let filteredTurmas = [...this.turmas];

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTurmas = filteredTurmas.filter(
        (turma) =>
          turma.nome.toLowerCase().includes(searchLower) ||
          (turma.semestre && turma.semestre.toString().includes(search)),
      );
    }

    if (turno) {
      filteredTurmas = filteredTurmas.filter((turma) => turma.turno === turno);
    }

    if (semestre !== undefined) {
      filteredTurmas = filteredTurmas.filter(
        (turma) => turma.semestre === semestre,
      );
    }

    if (ativa !== undefined) {
      filteredTurmas = filteredTurmas.filter((turma) => turma.ativa === ativa);
    }

    if (id_curso) {
      filteredTurmas = filteredTurmas.filter(
        (turma) => turma.id_curso === id_curso,
      );
    }

    // Aplicar ordenação
    filteredTurmas.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const total = filteredTurmas.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const turmas = filteredTurmas.slice(startIndex, endIndex);

    return { turmas, total };
  }

  async update(id: string, data: Prisma.TurmaUpdateInput): Promise<Turma> {
    const turmaIndex = this.turmas.findIndex((t) => t.id === id);

    if (turmaIndex === -1) {
      throw new Error("Turma não encontrada");
    }

    const turmaAtual = this.turmas[turmaIndex];
    if (!turmaAtual) {
      throw new Error("Turma não encontrada");
    }

    const turmaAtualizada: Turma = {
      ...turmaAtual,
      nome: (data.nome as string) ?? turmaAtual.nome,
      num_alunos: (data.num_alunos as number) ?? turmaAtual.num_alunos,
      turno: (data.turno as string) ?? turmaAtual.turno,
      id_curso:
        typeof data.curso === "object" &&
        "connect" in data.curso &&
        data.curso.connect?.id
          ? data.curso.connect.id
          : turmaAtual.id_curso,
      semestre: (data.semestre as number) ?? turmaAtual.semestre,
      ativa:
        data.ativa !== undefined ? (data.ativa as boolean) : turmaAtual.ativa,
    };

    this.turmas[turmaIndex] = turmaAtualizada;

    return turmaAtualizada;
  }

  async delete(id: string): Promise<void> {
    const turmaIndex = this.turmas.findIndex((t) => t.id === id);

    if (turmaIndex === -1) {
      throw new Error("Turma não encontrada");
    }

    this.turmas.splice(turmaIndex, 1);
  }
}
