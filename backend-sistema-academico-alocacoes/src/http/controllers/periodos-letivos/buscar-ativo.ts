import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarPeriodoLetivoAtivoUseCase } from "@/use-cases/@factories/periodo-letivo/make-buscar-periodo-letivo-ativo-use-case";

export async function buscarPeriodoLetivoAtivo(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makeBuscarPeriodoLetivoAtivoUseCase();
  const { periodo } = await useCase.execute();

  return reply.send({
    periodo: {
      ...periodo,
      data_inicio: periodo.data_inicio.toISOString().slice(0, 10),
      data_fim: periodo.data_fim.toISOString().slice(0, 10),
      created_at: periodo.created_at.toISOString(),
      updated_at: periodo.updated_at.toISOString(),
    },
  });
}

