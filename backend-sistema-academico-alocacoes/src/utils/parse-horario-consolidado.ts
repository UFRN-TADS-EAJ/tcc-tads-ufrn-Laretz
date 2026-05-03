export interface HorarioParseado {
  diaSemana: string;
  horarios: string[];
  horaInicio: string;
  horaFim: string;
}

export function parseHorarioConsolidado(
  horarioConsolidado: string,
): HorarioParseado[] {
  if (!horarioConsolidado || horarioConsolidado.trim() === "") {
    return [];
  }

  const resultado: HorarioParseado[] = [];

  const diasSemanaMap: Record<string, string> = {
    "1": "DOMINGO",
    "2": "SEGUNDA",
    "3": "TERCA",
    "4": "QUARTA",
    "5": "QUINTA",
    "6": "SEXTA",
    "7": "SABADO",
  };

  const padroes = horarioConsolidado.split(",").map((p) => p.trim());

  for (const padrao of padroes) {
    const match = padrao.match(/^(\d+)([MTN])(\d+)$/);

    if (match) {
      const diasStr = match[1];
      const periodo = match[2];
      const horariosStr = match[3];

      if (diasStr) {
        for (const diaChar of diasStr) {
          const diaSemana = diasSemanaMap[diaChar];
          if (diaSemana && horariosStr) {
            const horarios: string[] = [];
            for (const horarioChar of horariosStr) {
              horarios.push(`${periodo}${horarioChar}`);
            }

            let horaInicio = "07:00";
            let horaFim = "07:50";

            if (periodo === "M") {
              horaInicio = "07:00";
              const minutosFinais = horarios.length * 50;
              const horasFinais = Math.floor(minutosFinais / 60) + 7;
              const minutosRestantes = minutosFinais % 60;
              horaFim = `${horasFinais.toString().padStart(2, "0")}:${minutosRestantes.toString().padStart(2, "0")}`;
            } else if (periodo === "T") {
              horaInicio = "13:00";
              const minutosFinais = horarios.length * 50;
              const horasFinais = Math.floor(minutosFinais / 60) + 13;
              const minutosRestantes = minutosFinais % 60;
              horaFim = `${horasFinais.toString().padStart(2, "0")}:${minutosRestantes.toString().padStart(2, "0")}`;
            } else if (periodo === "N") {
              horaInicio = "19:00";
              const minutosFinais = horarios.length * 50;
              const horasFinais = Math.floor(minutosFinais / 60) + 19;
              const minutosRestantes = minutosFinais % 60;
              horaFim = `${horasFinais.toString().padStart(2, "0")}:${minutosRestantes.toString().padStart(2, "0")}`;
            }

            resultado.push({
              diaSemana,
              horarios,
              horaInicio,
              horaFim,
            });
          }
        }
      }
    }
  }

  return resultado;
}

export function calcularAulasPorSemana(horarioConsolidado: string): number {
  const horarios = parseHorarioConsolidado(horarioConsolidado);
  return horarios.reduce(
    (total, horario) => total + horario.horarios.length,
    0,
  );
}

export function extrairDiasSemana(horarioConsolidado: string): string[] {
  const horarios = parseHorarioConsolidado(horarioConsolidado);
  return [...new Set(horarios.map((h) => h.diaSemana))];
}

export function calcularUltimoDiaAula(
  horarioConsolidado: string,
  dataInicio: Date,
  totalAulas: number,
): Date | null {
  if (!horarioConsolidado || !dataInicio || totalAulas <= 0) {
    return null;
  }

  const diasSemanaMap: Record<string, number> = {
    DOMINGO: 0,
    SEGUNDA: 1,
    TERCA: 2,
    QUARTA: 3,
    QUINTA: 4,
    SEXTA: 5,
    SABADO: 6,
  };

  const horariosParseados = parseHorarioConsolidado(horarioConsolidado);

  if (horariosParseados.length === 0) {
    return null;
  }

  const aulasPorDia = new Map<number, number>();
  horariosParseados.forEach((horario) => {
    const diaNumero = diasSemanaMap[horario.diaSemana];
    if (diaNumero !== undefined) {
      const aulasNoDia = horario.horarios.length;
      aulasPorDia.set(
        diaNumero,
        (aulasPorDia.get(diaNumero) || 0) + aulasNoDia,
      );
    }
  });

  if (aulasPorDia.size === 0) {
    return null;
  }

  let dataAtual = new Date(dataInicio);
  let aulasContadas = 0;

  let iteracoes = 0;
  const maxIteracoes = totalAulas * 10;

  while (aulasContadas < totalAulas && iteracoes < maxIteracoes) {
    const diaSemanaAtual = dataAtual.getDay();

    const aulasNesteDia = aulasPorDia.get(diaSemanaAtual) || 0;
    if (aulasNesteDia > 0) {
      aulasContadas += aulasNesteDia;

      if (aulasContadas >= totalAulas) {
        return new Date(dataAtual);
      }
    }

    dataAtual.setDate(dataAtual.getDate() + 1);
    iteracoes++;
  }

  return null;
}
