import { PrismaNotificacoesRepository } from "@/repositories/prisma-repositories/prisma-notificacoes-repository";
import { CriarNotificacaoUseCase } from "@/use-cases/notificacao/criar-notificacao";

export function makeCriarNotificacaoUseCase() {
  const repo = new PrismaNotificacoesRepository();
  return new CriarNotificacaoUseCase(repo);
}