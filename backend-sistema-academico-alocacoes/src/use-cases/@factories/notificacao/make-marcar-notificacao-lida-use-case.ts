import { PrismaNotificacoesRepository } from "@/repositories/prisma-repositories/prisma-notificacoes-repository";
import { MarcarNotificacaoLidaUseCase } from "@/use-cases/notificacao/marcar-notificacao-lida";

export function makeMarcarNotificacaoLidaUseCase() {
  const repo = new PrismaNotificacoesRepository();
  return new MarcarNotificacaoLidaUseCase(repo);
}