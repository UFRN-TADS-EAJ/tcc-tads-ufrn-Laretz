import { FastifyReply, FastifyRequest } from "fastify";
import { listarNotificacoesQuerySchema, listarNotificacoesResponseSchema } from "@/schemas/notificacao";
import { makeListarNotificacoesUseCase } from "@/use-cases/@factories/notificacao/make-listar-notificacoes-use-case";

export async function listarNotificacoes(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user?.sub;
  if (!userId) {
    return reply.status(401).send({ message: "Não autenticado" });
  }

  const parseQuery = listarNotificacoesQuerySchema.safeParse(request.query);
  if (!parseQuery.success) {
    return reply.status(400).send({ message: "Query inválida", issues: parseQuery.error.issues });
  }

  const useCase = makeListarNotificacoesUseCase();
  const { notificacoes } = await useCase.execute({ userId, status: parseQuery.data.status });

  return reply.status(200).send(listarNotificacoesResponseSchema.parse({ notificacoes }));
}