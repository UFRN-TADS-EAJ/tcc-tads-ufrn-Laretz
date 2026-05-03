import { Prisma, Horario, RegimeHorario } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HorariosRepository } from "../horarios-repository";

export class PrismaHorariosRepository implements HorariosRepository {
  async create(data: Prisma.HorarioCreateInput) {
    const horario = await prisma.horario.create({
      data,
    });
    return horario;
  }

  async findById(id: string) {
    const horario = await prisma.horario.findUnique({
      where: { id },
    });

    return horario;
  }

  async findByDiaEHorario(
    dia_semana: string,
    horario_inicio: Date,
    horario_fim: Date,
  ): Promise<Horario | null> {
    const horario = await prisma.horario.findFirst({
      where: {
        dia_semana,
        horario_inicio,
        horario_fim,
      },
    });

    return horario;
  }

  async findMany(page?: number, regime?: RegimeHorario) {
    // Definir ordem dos dias da semana
    const ordemDias = {
      SEGUNDA: 1,
      TERCA: 2,
      QUARTA: 3,
      QUINTA: 4,
      SEXTA: 5,
      SABADO: 6,
    };

    const queryParams: any = {
      orderBy: [
        { dia_semana: "asc" },
        { codigo: "asc" },
      ],
    };
    if (regime) {
      queryParams.where = { regime };
    }

    const horarios = await prisma.horario.findMany(queryParams);

    if (!horarios) {
      return [];
    }

    // Ordenação customizada por dia da semana e código
    return horarios.sort((a, b) => {
      // Primeiro ordenar por dia da semana
      const diaA = ordemDias[a.dia_semana as keyof typeof ordemDias] || 7;
      const diaB = ordemDias[b.dia_semana as keyof typeof ordemDias] || 7;

      if (diaA !== diaB) {
        return diaA - diaB;
      }

      // Depois ordenar por código (M1, M2, T1, T2, N1, N2)
      const getOrdemCodigo = (codigo: string) => {
        const periodo = codigo.charAt(0); // M, T, N
        const numero = parseInt(codigo.charAt(1)) || 0; // 1, 2, 3...
        const ordemPeriodo = { M: 0, T: 1, N: 2 };
        return (
          (ordemPeriodo[periodo as keyof typeof ordemPeriodo] || 0) * 10 +
          numero
        );
      };

      return getOrdemCodigo(a.codigo) - getOrdemCodigo(b.codigo);
    });
  }

  async findManyWithFilters(params: {
    page: number;
    limit: number;
    regime?: RegimeHorario;
    dia_semana?: string;
  }) {
    const where: any = {};
    if (params.regime) where.regime = params.regime;
    if (params.dia_semana) where.dia_semana = params.dia_semana;

    const total = await prisma.horario.count({ where });

    const itens = await prisma.horario.findMany({
      where,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: [{ dia_semana: "asc" }, { codigo: "asc" }],
    });

    const ordemDias = {
      SEGUNDA: 1,
      TERCA: 2,
      QUARTA: 3,
      QUINTA: 4,
      SEXTA: 5,
      SABADO: 6,
    } as const;

    const getOrdemCodigo = (codigo: string) => {
      const periodo = codigo.charAt(0);
      const numero = parseInt(codigo.charAt(1)) || 0;
      const ordemPeriodo = { M: 0, T: 1, N: 2 } as const;
      return (
        (ordemPeriodo[periodo as keyof typeof ordemPeriodo] || 3) * 10 + numero
      );
    };

    const horarios = itens.sort((a, b) => {
      const diaA = ordemDias[a.dia_semana as keyof typeof ordemDias] || 7;
      const diaB = ordemDias[b.dia_semana as keyof typeof ordemDias] || 7;
      if (diaA !== diaB) return diaA - diaB;
      return getOrdemCodigo(a.codigo) - getOrdemCodigo(b.codigo);
    });

    return { horarios, total };
  }

  async update(id: string, data: Prisma.HorarioUpdateInput) {
    const horario = await prisma.horario.update({
      where: { id },
      data,
      include: {
        alocacoes: true,
      },
    });

    return horario;
  }

  async delete(id: string) {
    await prisma.horario.delete({
      where: { id },
    });
  }
}
