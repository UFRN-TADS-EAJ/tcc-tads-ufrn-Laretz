import { FastifyReply, FastifyRequest } from "fastify";
import { avancarPeriodoLetivoSchema } from "@/schemas/periodo-letivo";
import { makeAvancarPeriodoLetivoUseCase } from "@/use-cases/@factories/periodo-letivo/make-avancar-periodo-letivo-use-case";

export async function avancarPeriodoLetivo(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { nome, data_inicio, data_fim } = avancarPeriodoLetivoSchema.parse(
    request.body,
  );

  const useCase = makeAvancarPeriodoLetivoUseCase();
  const { periodo, encerrados } = await useCase.execute({
    nome,
    data_inicio: new Date(
      `${typeof data_inicio === "string" ? data_inicio : data_inicio.toISOString().slice(0, 10)}T00:00:00.000Z`,
    ),
    data_fim: new Date(
      `${typeof data_fim === "string" ? data_fim : data_fim.toISOString().slice(0, 10)}T23:59:59.999Z`,
    ),
  });

  return reply.status(201).send({
    encerrados,
    periodo: {
      ...periodo,
      data_inicio: periodo.data_inicio.toISOString().slice(0, 10),
      data_fim: periodo.data_fim.toISOString().slice(0, 10),
      created_at: periodo.created_at.toISOString(),
      updated_at: periodo.updated_at.toISOString(),
    },
  });
}

