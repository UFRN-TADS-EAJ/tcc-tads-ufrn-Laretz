import { PrismaNotificacoesRepository } from "@/repositories/prisma-repositories/prisma-notificacoes-repository";
import { ListarNotificacoesUseCase } from "@/use-cases/notificacao/listar-notificacoes";

export function makeListarNotificacoesUseCase() {
  const repo = new PrismaNotificacoesRepository();
  return new ListarNotificacoesUseCase(repo);
}