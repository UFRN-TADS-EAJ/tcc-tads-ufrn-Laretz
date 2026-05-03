import { prisma } from "@/lib/prisma";
import { NotificacaoRepository } from "@/repositories/notificacao-repository";
import { Notificacao, NotificacaoStatus, Prisma } from "@prisma/client";

export class PrismaNotificacoesRepository implements NotificacaoRepository {
  async create(data: Prisma.NotificacaoCreateInput): Promise<Notificacao> {
    const notificacao = await prisma.notificacao.create({ data });
    return notificacao;
  }

  async findMany(filter: { userId: string; status?: NotificacaoStatus }): Promise<Notificacao[]> {
    const where: Prisma.NotificacaoWhereInput = {
      userId: filter.userId,
      ...(filter.status ? { status: filter.status } : {}),
    };
    const notificacoes = await prisma.notificacao.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    return notificacoes;
  }

  async markRead(id: string): Promise<Notificacao | null> {
    const updated = await prisma.notificacao.update({
      where: { id },
      data: { status: NotificacaoStatus.LIDA, read_at: new Date() },
    }).catch(() => null);
    return updated ?? null;
  }

  async respond(id: string, replyMessage: string): Promise<Notificacao | null> {
    const updated = await prisma.notificacao.update({
      where: { id },
      data: { status: NotificacaoStatus.RESPONDIDA, replyMessage, responded_at: new Date() },
    }).catch(() => null);
    return updated ?? null;
  }

  async findById(id: string): Promise<Notificacao | null> {
    const found = await prisma.notificacao.findUnique({ where: { id } });
    return found ?? null;
  }
}