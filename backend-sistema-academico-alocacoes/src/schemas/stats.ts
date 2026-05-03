import { z } from "zod";

// schema: response /stats
export const statsResponseSchema = z.object({
  timestamp: z.string().describe("Data/hora ISO da geração dos dados"),
  totals: z.object({
    usuarios: z.number().int().nonnegative(),
    cursos: z.number().int().nonnegative(),
    turmas: z.number().int().nonnegative(),
    disciplinas: z.number().int().nonnegative(),
    salas: z.number().int().nonnegative(),
    horarios: z.number().int().nonnegative(),
    alocacoes: z.number().int().nonnegative(),
    reservasAtivas: z.number().int().nonnegative(),
  }),
  hoje: z.object({
    dia_semana: z.string().describe("Dia da semana normalizado (ex.: SEGUNDA, TERCA)"),
    alocacoesHoje: z.number().int().nonnegative(),
    reservasHojeAtivas: z.number().int().nonnegative(),
    salasOcupadasAgora: z.number().int().nonnegative(),
  }),
});
