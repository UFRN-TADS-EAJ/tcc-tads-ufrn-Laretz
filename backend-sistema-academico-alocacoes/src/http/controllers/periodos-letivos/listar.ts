import { FastifyReply, FastifyRequest } from "fastify";
import { makeListarPeriodosLetivosUseCase } from "@/use-cases/@factories/periodo-letivo/make-listar-periodos-letivos-use-case";
import { periodosLetivosListQuerySchema } from "@/schemas/periodo-letivo";

export async function listarPeriodosLetivos(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { order } = periodosLetivosListQuerySchema.parse(request.query ?? {});
  const useCase = makeListarPeriodosLetivosUseCase();
  const { periodos } = await useCase.execute({ order });

  return reply.send({
    periodos: periodos.map((p) => ({
      ...p,
      data_inicio: p.data_inicio.toISOString().slice(0, 10),
      data_fim: p.data_fim.toISOString().slice(0, 10),
      created_at: p.created_at.toISOString(),
      updated_at: p.updated_at.toISOString(),
    })),
  });
}
