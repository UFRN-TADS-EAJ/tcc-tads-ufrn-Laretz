import { NotificacaoRepository } from "@/repositories/notificacao-repository";
import { Notificacao } from "@prisma/client";

interface Input {
  id: string;
}

interface Output {
  notificacao: Notificacao | null;
}

export class MarcarNotificacaoLidaUseCase {
  constructor(private notificacoesRepo: NotificacaoRepository) {}

  async execute(input: Input): Promise<Output> {
    const notificacao = await this.notificacoesRepo.markRead(input.id);
    return { notificacao };
  }
}