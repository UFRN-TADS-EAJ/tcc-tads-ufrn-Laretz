import { FastifyReply, FastifyRequest } from "fastify";
import { marcarNotificacaoLidaParamsSchema, criarNotificacaoResponseSchema } from "@/schemas/notificacao";
import { makeMarcarNotificacaoLidaUseCase } from "@/use-cases/@factories/notificacao/make-marcar-notificacao-lida-use-case";
import { PrismaNotificacoesRepository } from "@/repositories/prisma-repositories/prisma-notificacoes-repository";

export async function marcarLida(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user?.sub;
  if (!userId) {
    return reply.status(401).send({ message: "Não autenticado" });
  }

  const parseParams = marcarNotificacaoLidaParamsSchema.safeParse(request.params);
  if (!parseParams.success) {
    return reply.status(400).send({ message: "Parâmetros inválidos", issues: parseParams.error.issues });
  }
  const { id } = parseParams.data;

  // Verifica propriedade da notificação
  const repo = new PrismaNotificacoesRepository();
  const existente = await repo.findById(id);
  if (!existente || existente.userId !== userId) {
    return reply.status(404).send({ message: "Notificação não encontrada" });
  }

  const useCase = makeMarcarNotificacaoLidaUseCase();
  const { notificacao } = await useCase.execute({ id });

  return reply.status(200).send(criarNotificacaoResponseSchema.parse({ notificacao }));
}