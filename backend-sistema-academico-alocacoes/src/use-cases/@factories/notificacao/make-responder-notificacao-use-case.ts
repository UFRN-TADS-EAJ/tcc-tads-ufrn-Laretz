import { PrismaNotificacoesRepository } from "@/repositories/prisma-repositories/prisma-notificacoes-repository";
import { ResponderNotificacaoUseCase } from "@/use-cases/notificacao/responder-notificacao";

export function makeResponderNotificacaoUseCase() {
  const repo = new PrismaNotificacoesRepository();
  return new ResponderNotificacaoUseCase(repo);
}