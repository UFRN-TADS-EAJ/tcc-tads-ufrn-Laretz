import { FastifyReply, FastifyRequest } from "fastify";
import { periodoLetivoParamsSchema } from "@/schemas/periodo-letivo";
import { makeAtivarPeriodoLetivoUseCase } from "@/use-cases/@factories/periodo-letivo/make-ativar-periodo-letivo-use-case";
import { PeriodoEncerradoError } from "@/use-cases/errors/periodo-encerrado";

export async function ativarPeriodoLetivo(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = periodoLetivoParamsSchema.parse(request.params);

  try {
    const useCase = makeAtivarPeriodoLetivoUseCase();
    const { periodo } = await useCase.execute({ id });

    return reply.send({
      periodo: {
        ...periodo,
        data_inicio: periodo.data_inicio.toISOString().slice(0, 10),
        data_fim: periodo.data_fim.toISOString().slice(0, 10),
        created_at: periodo.created_at.toISOString(),
        updated_at: periodo.updated_at.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof PeriodoEncerradoError) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }
}
