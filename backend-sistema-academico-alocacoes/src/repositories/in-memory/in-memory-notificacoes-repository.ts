import type { Notificacao, NotificacaoStatus, NotificacaoType, Prisma } from "@prisma/client";
import { NotificacaoRepository } from "../notificacao-repository";

export class InMemoryNotificacoesRepository implements NotificacaoRepository {
  public items: Notificacao[] = [];

  async create(data: Prisma.NotificacaoCreateInput): Promise<Notificacao> {
    const notificacao: Notificacao = {
      id: `notificacao-${this.items.length + 1}`,
      userId:
        typeof data.user === "object" &&
        "connect" in data.user &&
        data.user.connect?.id
          ? data.user.connect.id
          : ((data as any).userId ?? "user-default"),
      type: (data.type as NotificacaoType) ?? ("GENERICA" as NotificacaoType),
      title: data.title,
      message: data.message,
      status: (data.status as NotificacaoStatus) ?? ("PENDENTE" as NotificacaoStatus),
      replyMessage: (data.replyMessage as string | null) ?? null,
      metadata:
        data.metadata !== undefined
          ? (data.metadata as unknown as Prisma.JsonValue)
          : null,
      created_at: new Date(),
      read_at: null,
      responded_at: null,
    };

    this.items.push(notificacao);
    return notificacao;
  }

  async findMany(filter: {
    userId: string;
    status?: NotificacaoStatus;
  }): Promise<Notificacao[]> {
    const result = this.items
      .filter((n) => n.userId === filter.userId)
      .filter((n) => (filter.status ? n.status === filter.status : true))
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return result;
  }

  async markRead(id: string): Promise<Notificacao | null> {
    const idx = this.items.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    const current = this.items[idx];
    if (!current) return null;

    const updated: Notificacao = {
      id: current.id,
      userId: current.userId,
      type: current.type,
      title: current.title,
      message: current.message,
      status: "LIDA" as NotificacaoStatus,
      replyMessage: current.replyMessage ?? null,
      metadata: current.metadata,
      created_at: current.created_at,
      read_at: new Date(),
      responded_at: current.responded_at,
    };
    this.items[idx] = updated;
    return updated;
  }

  async respond(id: string, replyMessage: string): Promise<Notificacao | null> {
    const idx = this.items.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    const current = this.items[idx];
    if (!current) return null;

    const updated: Notificacao = {
      id: current.id,
      userId: current.userId,
      type: current.type,
      title: current.title,
      message: current.message,
      status: "RESPONDIDA" as NotificacaoStatus,
      replyMessage: replyMessage ?? current.replyMessage ?? null,
      metadata: current.metadata,
      created_at: current.created_at,
      read_at: current.read_at,
      responded_at: new Date(),
    };
    this.items[idx] = updated;
    return updated;
  }

  async findById(id: string): Promise<Notificacao | null> {
    return this.items.find((n) => n.id === id) ?? null;
  }
}
