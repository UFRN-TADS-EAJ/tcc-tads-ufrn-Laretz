import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarHorariosGradeConfigUseCase } from "@/use-cases/@factories/horario/make-buscar-horarios-grade-config-use-case";
import { horariosGradeConfigQuerySchema } from "@/schemas/horarios";

export async function buscarHorariosGradeConfig(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = horariosGradeConfigQuerySchema.parse(request.query);
  const useCase = makeBuscarHorariosGradeConfigUseCase();
  const result = await useCase.execute(
    parsed.regime ? { regime: parsed.regime } : undefined,
  );
  return reply.status(200).send(result);
}
