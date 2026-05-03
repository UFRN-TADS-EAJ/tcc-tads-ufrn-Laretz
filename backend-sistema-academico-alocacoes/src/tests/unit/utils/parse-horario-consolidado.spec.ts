import { describe, it, expect } from "vitest";
import {
  parseHorarioConsolidado,
  calcularAulasPorSemana,
  extrairDiasSemana,
  calcularUltimoDiaAula,
} from "@/utils/parse-horario-consolidado";

describe("parseHorarioConsolidado", () => {
  it("deve parsear horário simples com um dia e um horário", () => {
    const resultado = parseHorarioConsolidado("2M1");

    expect(resultado).toEqual([
      {
        diaSemana: "SEGUNDA",
        horarios: ["M1"],
        horaInicio: "07:00",
        horaFim: "07:50",
      },
    ]);
  });

  it("deve parsear horário com múltiplos horários no mesmo dia", () => {
    const resultado = parseHorarioConsolidado("2M12");

    expect(resultado).toEqual([
      {
        diaSemana: "SEGUNDA",
        horarios: ["M1", "M2"],
        horaInicio: "07:00",
        horaFim: "08:40",
      },
    ]);
  });

  it("deve parsear horário com múltiplos dias", () => {
    const resultado = parseHorarioConsolidado("23M12");

    expect(resultado).toHaveLength(2);
    expect(resultado[0]).toEqual({
      diaSemana: "SEGUNDA",
      horarios: ["M1", "M2"],
      horaInicio: "07:00",
      horaFim: "08:40",
    });
    expect(resultado[1]).toEqual({
      diaSemana: "TERCA",
      horarios: ["M1", "M2"],
      horaInicio: "07:00",
      horaFim: "08:40",
    });
  });

  it("deve parsear horário com dias e horários diferentes separados por vírgula", () => {
    const resultado = parseHorarioConsolidado("2M1,3M6,4M56");

    expect(resultado).toHaveLength(3);
    expect(resultado[0]).toEqual({
      diaSemana: "SEGUNDA",
      horarios: ["M1"],
      horaInicio: "07:00",
      horaFim: "07:50",
    });
    expect(resultado[1]).toEqual({
      diaSemana: "TERCA",
      horarios: ["M6"],
      horaInicio: "07:00",
      horaFim: "07:50",
    });
    expect(resultado[2]).toEqual({
      diaSemana: "QUARTA",
      horarios: ["M5", "M6"],
      horaInicio: "07:00",
      horaFim: "08:40",
    });
  });

  it("deve parsear horários da tarde", () => {
    const resultado = parseHorarioConsolidado("2T12");

    expect(resultado).toEqual([
      {
        diaSemana: "SEGUNDA",
        horarios: ["T1", "T2"],
        horaInicio: "13:00",
        horaFim: "14:40",
      },
    ]);
  });

  it("deve parsear horários da noite", () => {
    const resultado = parseHorarioConsolidado("2N12");

    expect(resultado).toEqual([
      {
        diaSemana: "SEGUNDA",
        horarios: ["N1", "N2"],
        horaInicio: "19:00",
        horaFim: "20:40",
      },
    ]);
  });

  it("deve retornar array vazio para entrada inválida", () => {
    expect(parseHorarioConsolidado("")).toEqual([]);
    expect(parseHorarioConsolidado("ABC")).toEqual([]);
    expect(parseHorarioConsolidado("123")).toEqual([]);
  });
});

describe("calcularAulasPorSemana", () => {
  it("deve calcular corretamente para horário simples", () => {
    expect(calcularAulasPorSemana("2M1")).toBe(1);
    expect(calcularAulasPorSemana("2M12")).toBe(2);
  });

  it("deve calcular corretamente para múltiplos dias", () => {
    expect(calcularAulasPorSemana("23M12")).toBe(4);
    expect(calcularAulasPorSemana("234M1")).toBe(3);
  });

  it("deve calcular corretamente para horários separados por vírgula", () => {
    expect(calcularAulasPorSemana("2M1,3M6,4M56")).toBe(4);
  });

  it("deve retornar 0 para entrada inválida", () => {
    expect(calcularAulasPorSemana("")).toBe(0);
    expect(calcularAulasPorSemana("ABC")).toBe(0);
  });
});

describe("extrairDiasSemana", () => {
  it("deve extrair dias únicos", () => {
    expect(extrairDiasSemana("2M1")).toEqual(["SEGUNDA"]);
    expect(extrairDiasSemana("23M12")).toEqual(["SEGUNDA", "TERCA"]);
    expect(extrairDiasSemana("234M1")).toEqual(["SEGUNDA", "TERCA", "QUARTA"]);
  });

  it("deve extrair dias de horários separados por vírgula", () => {
    const dias = extrairDiasSemana("2M1,3M6,4M56");
    expect(dias).toContain("SEGUNDA");
    expect(dias).toContain("TERCA");
    expect(dias).toContain("QUARTA");
    expect(dias).toHaveLength(3);
  });

  it("deve retornar array vazio para entrada inválida", () => {
    expect(extrairDiasSemana("")).toEqual([]);
    expect(extrairDiasSemana("ABC")).toEqual([]);
  });
});

describe("calcularUltimoDiaAula", () => {
  it("deve calcular data final corretamente para horário simples", () => {
    const dataInicio = new Date("2025-07-01");
    const resultado = calcularUltimoDiaAula("2M12", dataInicio, 4);
    expect(resultado).toEqual(new Date("2025-07-08"));
  });

  it("deve calcular data final para múltiplos dias por semana", () => {
    const dataInicio = new Date("2025-07-01");
    const resultado = calcularUltimoDiaAula("23M12", dataInicio, 72);
    expect(resultado).toEqual(new Date("2025-10-29"));
  });

  it("deve calcular corretamente para horários em dias diferentes", () => {
    const dataInicio = new Date("2025-07-01");
    const resultado = calcularUltimoDiaAula("2M1,4M1", dataInicio, 8);
    expect(resultado).toEqual(new Date("2025-07-24"));
  });

  it("deve retornar null para horário inválido", () => {
    const dataInicio = new Date("2025-07-01");
    expect(calcularUltimoDiaAula("", dataInicio, 10)).toBeNull();
    expect(calcularUltimoDiaAula("ABC", dataInicio, 10)).toBeNull();
  });

  it("deve retornar null para total de aulas zero ou negativo", () => {
    const dataInicio = new Date("2025-07-01");
    expect(calcularUltimoDiaAula("2M1", dataInicio, 0)).toBeNull();
    expect(calcularUltimoDiaAula("2M1", dataInicio, -5)).toBeNull();
  });

  it("deve lidar com casos onde a data de início não coincide com dia de aula", () => {
    const dataInicio = new Date("2025-07-01");
    const resultado = calcularUltimoDiaAula("4M1", dataInicio, 4);
    expect(resultado).toEqual(new Date("2025-07-24"));
  });

  it("deve calcular corretamente para cenário real da disciplina Banco de dados", () => {
    const dataInicio = new Date("2025-07-01");
    const resultado = calcularUltimoDiaAula("23M12", dataInicio, 72);
    expect(resultado).toEqual(new Date("2025-10-29"));
  });
});

describe("Cenários de consolidação de horários", () => {
  it("deve consolidar corretamente: 2m1 + 2m2 + 3m1 + 3m2 = 23m12", () => {
    const horarioConsolidado = "23M12";
    const resultado = parseHorarioConsolidado(horarioConsolidado);
    expect(resultado).toHaveLength(2);
    expect(calcularAulasPorSemana(horarioConsolidado)).toBe(4);
    const segunda = resultado.find((h) => h.diaSemana === "SEGUNDA");
    const terca = resultado.find((h) => h.diaSemana === "TERCA");
    expect(segunda?.horarios).toEqual(["M1", "M2"]);
    expect(terca?.horarios).toEqual(["M1", "M2"]);
  });

  it("deve consolidar corretamente: 2m1 + 3m6 + 4m6 + 4m5 = 2m1,3m6,4m56", () => {
    const horarioConsolidado = "2M1,3M6,4M56";
    const resultado = parseHorarioConsolidado(horarioConsolidado);
    expect(resultado).toHaveLength(3);
    expect(calcularAulasPorSemana(horarioConsolidado)).toBe(4);
    const segunda = resultado.find((h) => h.diaSemana === "SEGUNDA");
    const terca = resultado.find((h) => h.diaSemana === "TERCA");
    const quarta = resultado.find((h) => h.diaSemana === "QUARTA");
    expect(segunda?.horarios).toEqual(["M1"]);
    expect(terca?.horarios).toEqual(["M6"]);
    expect(quarta?.horarios).toEqual(["M5", "M6"]);
  });

  it("deve lidar com horários em períodos diferentes no mesmo dia", () => {
    const horarioConsolidado = "2M12,2T34,2N56";
    const resultado = parseHorarioConsolidado(horarioConsolidado);
    expect(resultado).toHaveLength(3);
    expect(calcularAulasPorSemana(horarioConsolidado)).toBe(6);
    expect(resultado.every((h) => h.diaSemana === "SEGUNDA")).toBe(true);
    const manha = resultado.find((h) => h.horarios.includes("M1"));
    const tarde = resultado.find((h) => h.horarios.includes("T3"));
    const noite = resultado.find((h) => h.horarios.includes("N5"));
    expect(manha?.horarios).toEqual(["M1", "M2"]);
    expect(tarde?.horarios).toEqual(["T3", "T4"]);
    expect(noite?.horarios).toEqual(["N5", "N6"]);
  });
});
