import { FastifyReply, FastifyRequest } from "fastify";
import { reservasQuerySchema } from "@/schemas/reserva-sala";
import { makeBuscarReservasUseCase } from "@/use-cases/@factories/reservas-sala/make-buscar-reservas-use-case";

export async function buscarReservasSala(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { salaId, horarioId, dateFrom, dateTo, page } = reservasQuerySchema.parse(
    request.query
  );

  const buscarReservasUseCase = makeBuscarReservasUseCase();
  
  const executeParams: any = { page };
  if (salaId !== undefined) executeParams.salaId = salaId;
  if (horarioId !== undefined) executeParams.horarioId = horarioId;
  if (dateFrom !== undefined) executeParams.dateFrom = dateFrom;
  if (dateTo !== undefined) executeParams.dateTo = dateTo;

  const { reservas } = await buscarReservasUseCase.execute(executeParams);

  // Serializar datas para strings conforme schema de resposta
  const reservasSerialized = reservas.map((r: any) => ({
    id: String(r.id),
    salaId: String(r.salaId),
    horarioId: String(r.horarioId),
    date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String((r as any).date),
    titulo: String(r.titulo),
    descricao: (r as any).descricao ?? null,
    criado_por: String(r.criado_por),
    status: String(r.status) as any,
    recurrenceRule: (r as any).recurrenceRule ?? null,
    recurrenceEnd: (r as any).recurrenceEnd
      ? ((r as any).recurrenceEnd instanceof Date
          ? (r as any).recurrenceEnd.toISOString().slice(0, 10)
          : String((r as any).recurrenceEnd))
      : null,
    seriesId: (r as any).seriesId ?? null,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String((r as any).created_at),
    updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String((r as any).updated_at),
    criadorNome: r.criadoPor?.nome,
  }));

  return reply.status(200).send({ reservas: reservasSerialized });
}