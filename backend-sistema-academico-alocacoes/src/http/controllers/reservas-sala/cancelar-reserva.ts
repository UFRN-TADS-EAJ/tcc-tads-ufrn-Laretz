import { FastifyReply, FastifyRequest } from "fastify";
import { reservaParamsSchema } from "@/schemas/reserva-sala";
import { makeCancelarReservaUseCase } from "@/use-cases/@factories/reservas-sala/make-cancelar-reserva-use-case";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

export async function cancelarReservaSala(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = reservaParamsSchema.parse(request.params);

    const cancelarReservaUseCase = makeCancelarReservaUseCase();
    await cancelarReservaUseCase.execute({ id });

    return reply.status(200).send({ message: "reserva cancelada" });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: "Reserva não encontrada" });
    }

    console.error(
      "[DELETE /reservas-sala/:id] Erro ao cancelar reserva:",
      error
    );
    return reply.status(500).send({
      error: "Erro Interno do Servidor",
      message: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
    });
  }
}
