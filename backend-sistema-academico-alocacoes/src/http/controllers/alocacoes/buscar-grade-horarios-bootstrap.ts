import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarGradeHorariosBootstrapUseCase } from "@/use-cases/@factories/alocacao/make-buscar-grade-horarios-bootstrap-use-case";
import { gradeHorariosBootstrapQuerySchema } from "@/schemas";

export async function buscarGradeHorariosBootstrap(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { regime, orderPeriodos } = gradeHorariosBootstrapQuerySchema.parse(
    request.query ?? {},
  );

  const useCase = makeBuscarGradeHorariosBootstrapUseCase();
  const result = await useCase.execute({ regime, orderPeriodos });

  return reply.status(200).send(result);
}

