import { ReservaSala } from "@prisma/client";
import { ReservasSalaRepository } from "@/repositories/reservas-sala-repository";
import { AlocacoesRepository } from "@/repositories/alocacoes-repository";
import { HorariosRepository } from "@/repositories/horarios-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";
import { DataInvalidaError } from "../errors/data-invalida";
import { HorarioInexistenteError } from "../errors/horario-inexistente";
import { DataIncompativelDiaSemanaError } from "../errors/data-incompativel-dia-semana";
import { ConflitoReservaAlocacaoError } from "../errors/conflito-reserva-alocacao";
import { randomUUID } from "crypto";

interface CriarReservaUseCaseRequest {
  salaId: string;
  horarioId: string;
  date: Date | string;
  titulo: string;
  descricao?: string;
  criado_por: string;
  recurrenceRule?: "WEEKLY";
  recurrenceEnd?: Date | string;
}

interface CriarReservaUseCaseResponse {
  reservas: ReservaSala[];
  conflicts?: { type: "ALOCACAO" | "RESERVA"; date?: string }[];
}

function ensureDateString(input: string | Date | null | undefined): string {
  if (!input) return "";
  if (typeof input === "string") return input;
    if (input instanceof Date) return input.toISOString().slice(0, 10);
  return String(input);
}

function parseDateUTC(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function getDiaSemanaKeyUTC(date: Date): string {
  const map: Record<number, string> = {
    0: "DOMINGO",
    1: "SEGUNDA",
    2: "TERCA",
    3: "QUARTA",
    4: "QUINTA",
    5: "SEXTA",
    6: "SABADO",
  };
  const dia = map[date.getUTCDay()];
  return dia || "";
}

function buildWeeklyDatesUTC(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    result.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return result;
}

export class CriarReservaUseCase {
  constructor(
    private reservasRepository: ReservasSalaRepository,
    private alocacoesRepository: AlocacoesRepository,
    private horariosRepository: HorariosRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({
    salaId,
    horarioId,
    date,
    titulo,
    descricao,
    criado_por,
    recurrenceRule,
    recurrenceEnd,
  }: CriarReservaUseCaseRequest): Promise<CriarReservaUseCaseResponse> {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    const startDateStr = ensureDateString(date);
    const startDate = parseDateUTC(startDateStr);
    
    if (!startDateStr || Number.isNaN(startDate.getTime())) {
      throw new DataInvalidaError("A data informada é inválida.");
    }

    const horario = await this.horariosRepository.findById(horarioId);
    if (!horario) {
      throw new HorarioInexistenteError();
    }

    const diaDate = getDiaSemanaKeyUTC(startDate);
    if (horario.dia_semana && horario.dia_semana !== diaDate) {
      throw new DataIncompativelDiaSemanaError(diaDate, horario.dia_semana);
    }

    let dates: Date[] = [startDate];
    let seriesId: string | undefined;

    if (recurrenceRule === "WEEKLY") {
      if (!recurrenceEnd) {
        throw new DataInvalidaError("recurrenceEnd é obrigatório para recorrência semanal.");
      }
      const endDateStr = ensureDateString(recurrenceEnd);
      const endDate = parseDateUTC(endDateStr);
      if (!endDateStr || Number.isNaN(endDate.getTime())) {
        throw new DataInvalidaError("recurrenceEnd inválido.");
      }

      seriesId = randomUUID();
      dates = buildWeeklyDatesUTC(startDate, endDate);
    }

    const conflicts: { type: "ALOCACAO" | "RESERVA"; date?: string }[] = [];

    // checa reservas conflitantes
    const reservasConflitantes = await this.reservasRepository.findConflicts(
      salaId,
      horarioId,
      dates,
      periodoAtivo.id,
    );
    for (const reserva of reservasConflitantes) {
      conflicts.push({ type: "RESERVA", date: reserva.date.toISOString().slice(0, 10) });
    }

    // checa alocacoes fixas no mesmo horario
    const alocacao = await this.alocacoesRepository.findBySalaIdAndHorarioId(
      salaId,
      horarioId,
      periodoAtivo.id,
    );
    if (alocacao) {
      conflicts.push({ type: "ALOCACAO" });
    }

    if (conflicts.length > 0) {
      throw new ConflitoReservaAlocacaoError(conflicts);
    }

    // cria array de objetos para insercao em lote
    const reservasToCreate = dates.map(d => ({
      salaId,
      horarioId,
      date: d,
      titulo,
      descricao: descricao ?? null,
      criado_por,
      recurrenceRule: recurrenceRule ?? null,
      recurrenceEnd: recurrenceRule && recurrenceEnd
        ? parseDateUTC(ensureDateString(recurrenceEnd))
        : null,
      seriesId: seriesId ?? null,
      periodoId: periodoAtivo.id,
    }));

    const reservas = await this.reservasRepository.createMany(reservasToCreate);

    return { reservas };
  }
}
