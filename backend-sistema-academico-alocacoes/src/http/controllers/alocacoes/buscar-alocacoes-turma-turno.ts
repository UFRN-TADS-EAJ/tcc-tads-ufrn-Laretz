import { FastifyRequest, FastifyReply } from "fastify";
import { makeBuscarAlocacoesTurmaTurnoUseCase } from "@/use-cases/@factories/alocacao/make-buscar-alocacoes-turma-turno-use-case";
import {
  alocacoesTurmaTurnoParamsSchema,
  alocacoesTurmaTurnoQuerySchema,
} from "@/schemas";

export async function buscarAlocacoesTurmaTurno(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id_turma } = alocacoesTurmaTurnoParamsSchema.parse(request.params);
  const { turno, page } = alocacoesTurmaTurnoQuerySchema.parse(
    request.query,
  );

  try {
    const buscarAlocacoesTurmaTurnoUseCase =
      makeBuscarAlocacoesTurmaTurnoUseCase();

    const { alocacoes } = await buscarAlocacoesTurmaTurnoUseCase.execute({
      id_turma,
      turno,
      page,
    });

    return reply.status(200).send({
      alocacoes,
    });
  } catch (err) {
    throw err;
  }
}
