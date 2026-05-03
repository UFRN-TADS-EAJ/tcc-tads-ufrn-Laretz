import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { TurmasRepository } from "../turmas-repository";

export class PrismaTurmasRepository implements TurmasRepository {
  async create(data: Prisma.TurmaCreateInput) {
    const turma = await prisma.turma.create({
      data,
    });
    return turma;
  }

  async findById(id: string) {
    const turma = await prisma.turma.findFirst({
      where: { id, curso: { isDeleted: null } },
      include: {
        curso: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
      },
    });

    return turma;
  }

  async findAll() {
    const turmas = await prisma.turma.findMany({
      where: {
        curso: { isDeleted: null },
      },
      include: {
        curso: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return turmas;
  }

  async findByNome(nome: string) {
    const turma = await prisma.turma.findFirst({
      where: { nome },
    });

    return turma;
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
  }) {
    const where: any = {};

    if (search) {
      where.OR = [{ nome: { contains: search, mode: "insensitive" } }];
    }

    if (turno) {
      where.turno = turno;
    }

    if (semestre !== undefined) {
      where.semestre = semestre;
    }

    if (ativa !== undefined) {
      where.ativa = ativa;
    }

    if (id_curso) {
      where.id_curso = id_curso;
    }

    where.curso = { isDeleted: null };

    const [turmas, total] = await Promise.all([
      prisma.turma.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          curso: {
            select: {
              id: true,
              nome: true,
              codigo: true,
            },
          },
        },
      }),
      prisma.turma.count({ where }),
    ]);

    return { turmas, total };
  }

  async update(id: string, data: Prisma.TurmaUpdateInput) {
    const turma = await prisma.turma.update({
      where: { id },
      data,
      include: {
        alocacoes: true,
      },
    });

    return turma;
  }

  async delete(id: string) {
    await prisma.turma.delete({
      where: { id },
    });
  }
}
