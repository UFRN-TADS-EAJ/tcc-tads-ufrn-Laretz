import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarHorariosConflitosUseCase } from "@/use-cases/@factories/alocacao/make-buscar-horarios-conflitos-use-case";
import { horariosConflitosQuerySchema } from "@/schemas";

export async function buscarHorariosConflitos(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id_turma, id_user, id_sala, periodoId, regime } =
    horariosConflitosQuerySchema.parse(request.query);

  const useCase = makeBuscarHorariosConflitosUseCase();
  const result = await useCase.execute({
    id_turma,
    id_user,
    id_sala,
    periodoId,
    regime,
  });

  return reply.status(200).send(result);
}

