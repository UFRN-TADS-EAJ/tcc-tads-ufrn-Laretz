import { FastifyReply, FastifyRequest } from "fastify";
import { responderNotificacaoBodySchema, responderNotificacaoParamsSchema, responderNotificacaoResponseSchema } from "@/schemas/notificacao";
import { makeResponderNotificacaoUseCase } from "@/use-cases/@factories/notificacao/make-responder-notificacao-use-case";
import { PrismaNotificacoesRepository } from "@/repositories/prisma-repositories/prisma-notificacoes-repository";

export async function responderNotificacao(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user?.sub;
  if (!userId) {
    return reply.status(401).send({ message: "Não autenticado" });
  }

  const parseParams = responderNotificacaoParamsSchema.safeParse(request.params);
  if (!parseParams.success) {
    return reply.status(400).send({ message: "Parâmetros inválidos", issues: parseParams.error.issues });
  }
  const { id } = parseParams.data;

  const parseBody = responderNotificacaoBodySchema.safeParse(request.body);
  if (!parseBody.success) {
    return reply.status(400).send({ message: "Dados inválidos", issues: parseBody.error.issues });
  }
  const { replyMessage } = parseBody.data;

  // Verifica propriedade da notificação
  const repo = new PrismaNotificacoesRepository();
  const existente = await repo.findById(id);
  if (!existente || existente.userId !== userId) {
    return reply.status(404).send({ message: "Notificação não encontrada" });
  }

  const useCase = makeResponderNotificacaoUseCase();
  const { notificacao } = await useCase.execute({ id, replyMessage });

  return reply.status(200).send(responderNotificacaoResponseSchema.parse({ notificacao }));
}