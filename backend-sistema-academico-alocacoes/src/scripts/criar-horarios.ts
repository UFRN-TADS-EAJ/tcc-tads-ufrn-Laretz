import { PrismaClient, RegimeHorario } from "@prisma/client";

const prisma = new PrismaClient();

type Slot = { inicio: { hora: number; minuto: number }; fim: { hora: number; minuto: number } };

const diasSemana = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"] as const;

function timeOnlyUTC(hh: number, mm: number) {
  return new Date(
    `1970-01-01T${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:00.000Z`,
  );
}

const HORARIOS_SUPERIOR: Record<string, Slot[]> = {
  M: [
    { inicio: { hora: 7, minuto: 0 }, fim: { hora: 7, minuto: 50 } },
    { inicio: { hora: 7, minuto: 50 }, fim: { hora: 8, minuto: 40 } },
    { inicio: { hora: 8, minuto: 55 }, fim: { hora: 9, minuto: 45 } },
    { inicio: { hora: 9, minuto: 45 }, fim: { hora: 10, minuto: 35 } },
    { inicio: { hora: 10, minuto: 50 }, fim: { hora: 11, minuto: 40 } },
    { inicio: { hora: 11, minuto: 40 }, fim: { hora: 12, minuto: 30 } },
  ],
  T: [
    { inicio: { hora: 13, minuto: 0 }, fim: { hora: 13, minuto: 50 } },
    { inicio: { hora: 13, minuto: 50 }, fim: { hora: 14, minuto: 40 } },
    { inicio: { hora: 14, minuto: 55 }, fim: { hora: 15, minuto: 45 } },
    { inicio: { hora: 15, minuto: 45 }, fim: { hora: 16, minuto: 35 } },
    { inicio: { hora: 16, minuto: 50 }, fim: { hora: 17, minuto: 40 } },
    { inicio: { hora: 17, minuto: 40 }, fim: { hora: 18, minuto: 30 } },
  ],
  N: [
    { inicio: { hora: 18, minuto: 45 }, fim: { hora: 19, minuto: 35 } },
    { inicio: { hora: 19, minuto: 35 }, fim: { hora: 20, minuto: 25 } },
    { inicio: { hora: 20, minuto: 35 }, fim: { hora: 21, minuto: 25 } },
    { inicio: { hora: 21, minuto: 25 }, fim: { hora: 22, minuto: 15 } },
  ],
};

const HORARIOS_TECNICO: Record<string, Slot[]> = {
  M: [
    { inicio: { hora: 7, minuto: 15 }, fim: { hora: 8, minuto: 0 } },
    { inicio: { hora: 8, minuto: 0 }, fim: { hora: 8, minuto: 45 } },
    { inicio: { hora: 8, minuto: 45 }, fim: { hora: 9, minuto: 30 } },
    { inicio: { hora: 9, minuto: 45 }, fim: { hora: 10, minuto: 30 } },
    { inicio: { hora: 10, minuto: 30 }, fim: { hora: 11, minuto: 15 } },
    { inicio: { hora: 11, minuto: 15 }, fim: { hora: 12, minuto: 0 } },
  ],
  T: [
    { inicio: { hora: 13, minuto: 15 }, fim: { hora: 14, minuto: 0 } },
    { inicio: { hora: 14, minuto: 0 }, fim: { hora: 14, minuto: 45 } },
    { inicio: { hora: 14, minuto: 45 }, fim: { hora: 15, minuto: 30 } },
    { inicio: { hora: 15, minuto: 45 }, fim: { hora: 16, minuto: 30 } },
    { inicio: { hora: 16, minuto: 30 }, fim: { hora: 17, minuto: 15 } },
  ],
};

async function criarHorariosPorRegime(regime: RegimeHorario, horariosDefinidos: Record<string, Slot[]>) {
  for (const dia_semana of diasSemana) {
    for (const [turno, slots] of Object.entries(horariosDefinidos)) {
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (!slot) continue;

        const codigo = `${turno}${i + 1}`;

        const existente = await prisma.horario.findFirst({
          where: { dia_semana, codigo, regime },
          select: { id: true },
        });

        if (existente) continue;

        await prisma.horario.create({
          data: {
            dia_semana,
            codigo,
            horario_inicio: timeOnlyUTC(slot.inicio.hora, slot.inicio.minuto),
            horario_fim: timeOnlyUTC(slot.fim.hora, slot.fim.minuto),
            regime,
          },
        });
      }
    }
  }
}

async function criarHorarios() {
  try {
    await criarHorariosPorRegime("SUPERIOR", HORARIOS_SUPERIOR);
    await criarHorariosPorRegime("TECNICO", HORARIOS_TECNICO);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  criarHorarios();
}

export { criarHorarios };
