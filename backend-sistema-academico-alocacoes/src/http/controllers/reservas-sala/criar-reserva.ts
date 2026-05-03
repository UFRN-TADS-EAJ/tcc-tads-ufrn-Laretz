import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  createReservaSalaSchema,
  reservaSalaCoreSchema,
} from "@/schemas/reserva-sala";
import { makeCriarReservaUseCase } from "@/use-cases/@factories/reservas-sala/make-criar-reserva-use-case";
import { ConflitoReservaAlocacaoError } from "@/use-cases/errors/conflito-reserva-alocacao";
import { DataIncompativelDiaSemanaError } from "@/use-cases/errors/data-incompativel-dia-semana";
import { DataInvalidaError } from "@/use-cases/errors/data-invalida";
import { HorarioInexistenteError } from "@/use-cases/errors/horario-inexistente";

function respondBadRequest(
  reply: FastifyReply,
  code: string,
  message: string,
  details?: unknown
) {
  return reply.status(400).send({ code, message, details });
}

function respondConflict(
  reply: FastifyReply,
  message: string,
  conflicts: { type: "ALOCACAO" | "RESERVA"; date?: string }[]
) {
  return reply.status(409).send({ message, conflicts });
}

type StatusReserva = "ATIVA" | "CANCELADA";

function serializeReserva(reserva: any) {
  const status: StatusReserva =
    reserva.status === "CANCELADA" ? "CANCELADA" : "ATIVA";
  return {
    id: String(reserva.id),
    salaId: String(reserva.salaId),
    horarioId: String(reserva.horarioId),
    date:
      reserva.date instanceof Date
        ? reserva.date.toISOString().slice(0, 10)
        : String(reserva.date),
    titulo: String(reserva.titulo),
    descricao: reserva.descricao ?? null,
    criado_por: String(reserva.criado_por),
    status,
    recurrenceRule: reserva.recurrenceRule ?? null,
    recurrenceEnd: reserva.recurrenceEnd
      ? reserva.recurrenceEnd instanceof Date
        ? reserva.recurrenceEnd.toISOString().slice(0, 10)
        : String(reserva.recurrenceEnd)
      : null,
    seriesId: reserva.seriesId ?? null,
    created_at:
      reserva.created_at instanceof Date
        ? reserva.created_at.toISOString()
        : String(reserva.created_at),
    updated_at:
      reserva.updated_at instanceof Date
        ? reserva.updated_at.toISOString()
        : String(reserva.updated_at),
    criadorNome: reserva.criadoPor?.nome,
  };
}

export async function criarReservaSala(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createReservaSalaSchema.parse(request.body);

  const userId = request.user?.sub;
  if (!userId) {
    return reply.status(401).send({ message: "Usuário não autenticado" });
  }

  const criarReservaUseCase = makeCriarReservaUseCase();

  try {
    const executeParams: any = {
      salaId: body.salaId,
      horarioId: body.horarioId,
      date: body.date,
      titulo: body.titulo,
      criado_por: userId,
    };
    if (body.descricao !== undefined) executeParams.descricao = body.descricao;
    if (body.recurrenceRule !== undefined) executeParams.recurrenceRule = body.recurrenceRule;
    if (body.recurrenceEnd !== undefined) executeParams.recurrenceEnd = body.recurrenceEnd;

    const { reservas } = await criarReservaUseCase.execute(executeParams);

    const reservasSerialized = reservas.map(serializeReserva);

    type Response201 = { reservas: z.infer<typeof reservaSalaCoreSchema>[] };
    const payload: Response201 = { reservas: reservasSerialized };

    const Reserva201Schema = z.object({
      reservas: z.array(reservaSalaCoreSchema),
    });

    const parsed = Reserva201Schema.safeParse(payload);
    if (!parsed.success) {
      console.error(
        "[reservas-sala] Resposta 201 inválida:",
        parsed.error.issues
      );
      return reply.status(500).send({
        error: "Erro de Resposta",
        message: "Ocorreu um erro ao formatar a resposta do servidor.",
        issues: parsed.error.issues,
      });
    }

    return reply.status(201).send(payload);
  } catch (error) {
    if (error instanceof DataInvalidaError) {
      return respondBadRequest(reply, "DATA_INVALIDA", error.message);
    }
    if (error instanceof HorarioInexistenteError) {
      return respondBadRequest(reply, "HORARIO_INEXISTENTE", error.message);
    }
    if (error instanceof DataIncompativelDiaSemanaError) {
      return respondBadRequest(
        reply,
        "DATA_INCOMPATIVEL_DIA_SEMANA",
        error.message,
        {
          diaSelecionado: error.diaSelecionado,
          esperado: error.esperado,
        }
      );
    }
    if (error instanceof ConflitoReservaAlocacaoError) {
      const hasReserva = error.conflicts.some((c) => c.type === "RESERVA");
      const hasAlocacao = error.conflicts.some((c) => c.type === "ALOCACAO");

      let message = error.message;
      if (hasReserva && !hasAlocacao) {
        message =
          "Já existe uma reserva ativa para esta sala e horário na(s) data(s) selecionada(s).";
      } else if (!hasReserva && hasAlocacao) {
        message =
          "Existe uma alocação ativa para esta sala e horário; não é possível criar reserva.";
      }

      return respondConflict(reply, message, error.conflicts);
    }

    throw error;
  }
}
