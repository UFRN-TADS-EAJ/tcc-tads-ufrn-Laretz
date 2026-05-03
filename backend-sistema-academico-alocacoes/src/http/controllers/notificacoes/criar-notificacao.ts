import { FastifyReply, FastifyRequest } from "fastify";
import { criarNotificacaoBodySchema, criarNotificacaoResponseSchema } from "@/schemas/notificacao";
import { NotificacaoType } from "@prisma/client";
import { makeCriarNotificacaoUseCase } from "@/use-cases/@factories/notificacao/make-criar-notificacao-use-case";

export async function criarNotificacao(request: FastifyRequest, reply: FastifyReply) {
  const parseBody = criarNotificacaoBodySchema.safeParse(request.body);
  if (!parseBody.success) {
    return reply.status(400).send({ message: "Dados inválidos", issues: parseBody.error.issues });
  }

  const { userId, type, title, message, metadata } = parseBody.data;
  const tipoNotificacao = type as NotificacaoType;

  const useCase = makeCriarNotificacaoUseCase();
  const { notificacao } = await useCase.execute({ userId, type: tipoNotificacao, title, message, metadata });

  return reply.status(201).send(criarNotificacaoResponseSchema.parse({ notificacao }));
}