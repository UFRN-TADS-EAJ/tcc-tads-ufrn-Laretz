import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarAlocacoesBootstrapUseCase } from "@/use-cases/@factories/alocacao/make-buscar-alocacoes-bootstrap-use-case";
import { alocacoesBootstrapQuerySchema } from "@/schemas";

export async function buscarAlocacoesBootstrap(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { regime } = alocacoesBootstrapQuerySchema.parse(request.query ?? {});
  const useCase = makeBuscarAlocacoesBootstrapUseCase();
  const result = await useCase.execute({ regime });
  return reply.status(200).send(result);
}

