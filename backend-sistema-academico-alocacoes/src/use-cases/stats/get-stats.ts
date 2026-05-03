import { prisma } from "@/lib/prisma";

function getDiaSemanaKey(date: Date): string {
  const map = [
    "DOMINGO",
    "SEGUNDA",
    "TERCA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SABADO",
  ];
  // Em algumas bases pode estar como TERÇA/SÁBADO com acento ou formas por extenso.
  // Usaremos a chave sem acento e caixa alta, e construímos um conjunto de variantes para consulta.
  const idx = date.getDay();
  return map[idx] || "DOMINGO";
}

function getDiaSemanaVariants(key: string): string[] {
  // Retorna possíveis variações salvas no campo Horario.dia_semana
  switch (key) {
    case "SEGUNDA":
      return [
        "SEGUNDA",
        "Segunda",
        "segunda",
        "segunda-feira",
        "Segunda-feira",
      ];
    case "TERCA":
      return ["TERCA", "Terça", "terça", "terca", "terça-feira", "terca-feira"];
    case "QUARTA":
      return ["QUARTA", "Quarta", "quarta", "quarta-feira"];
    case "QUINTA":
      return ["QUINTA", "Quinta", "quinta", "quinta-feira"];
    case "SEXTA":
      return ["SEXTA", "Sexta", "sexta", "sexta-feira"];
    case "SABADO":
      return ["SABADO", "Sábado", "sabado", "sábado"];
    default:
      return [key];
  }
}

export class GetStatsUseCase {
  async execute() {
    const now = new Date();
    const diaKey = getDiaSemanaKey(now);
    const diaVariants = getDiaSemanaVariants(diaKey);

    // Início/fim do dia (para reservas por data)
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    // Contagens totais
    const [
      usuarios,
      cursos,
      turmas,
      disciplinas,
      salas,
      horarios,
      alocacoes,
      reservasAtivas,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.curso.count(),
      prisma.turma.count(),
      prisma.disciplina.count(),
      prisma.sala.count(),
      prisma.horario.count(),
      prisma.alocacao.count(),
      prisma.reservaSala.count({ where: { status: "ATIVA" } }),
    ]);

    // Métricas do dia
    const [alocsHoje, reservasHoje, alocsAgora] = await Promise.all([
      prisma.alocacao.count({
        where: {
          horario: {
            dia_semana: { in: diaVariants },
          },
        },
      }),
      prisma.reservaSala.count({
        where: {
          status: "ATIVA",
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.alocacao.findMany({
        where: {
          horario: {
            dia_semana: { in: diaVariants },
            horario_inicio: { lte: now },
            horario_fim: {
              // Para banco com apenas horário (time), a comparação considera hoje.
              // Prisma com @db.Time usa o componente de hora, mas a comparação com Date funciona para intervalos no dia.
              gte: now,
            },
          },
        },
        select: { id_sala: true },
      }),
    ]);

    const salasOcupadasAgora = new Set(alocsAgora.map((a) => a.id_sala)).size;

    return {
      timestamp: now.toISOString(),
      totals: {
        usuarios,
        cursos,
        turmas,
        disciplinas,
        salas,
        horarios,
        alocacoes,
        reservasAtivas,
      },
      hoje: {
        dia_semana: diaKey,
        alocacoesHoje: alocsHoje,
        reservasHojeAtivas: reservasHoje,
        salasOcupadasAgora,
      },
    };
  }
}
