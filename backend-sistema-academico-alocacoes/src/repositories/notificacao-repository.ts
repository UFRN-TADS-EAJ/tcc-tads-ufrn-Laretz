import { Notificacao, NotificacaoStatus, Prisma } from "@prisma/client";

export interface NotificacaoRepository {
  create(data: Prisma.NotificacaoCreateInput): Promise<Notificacao>;
  findMany(filter: { userId: string; status?: NotificacaoStatus }): Promise<Notificacao[]>;
  markRead(id: string): Promise<Notificacao | null>;
  respond(id: string, replyMessage: string): Promise<Notificacao | null>;
  findById(id: string): Promise<Notificacao | null>;
}