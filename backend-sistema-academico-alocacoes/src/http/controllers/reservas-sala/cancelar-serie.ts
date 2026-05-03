import { FastifyReply, FastifyRequest } from "fastify";
import { seriesParamsSchema } from "@/schemas/reserva-sala";
import { makeCancelarSerieUseCase } from "@/use-cases/@factories/reservas-sala/make-cancelar-serie-use-case";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

export async function cancelarSerieReservasSala(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { seriesId } = seriesParamsSchema.parse(request.params);

    const cancelarSerieUseCase = makeCancelarSerieUseCase();
    await cancelarSerieUseCase.execute({ seriesId });

    return reply.status(200).send({ message: "Série cancelada com sucesso" });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: "Série de reservas não encontrada" });
    }

    console.error(
      "[DELETE /reservas-sala/series/:seriesId] Erro ao cancelar série:",
      error
    );
    return reply.status(500).send({
      error: "Erro Interno do Servidor",
      message: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
    });
  }
}