import { NotificacaoRepository } from "@/repositories/notificacao-repository";
import { Notificacao } from "@prisma/client";

interface Input {
  id: string;
  replyMessage: string;
}

interface Output {
  notificacao: Notificacao | null;
}

export class ResponderNotificacaoUseCase {
  constructor(private notificacoesRepo: NotificacaoRepository) {}

  async execute(input: Input): Promise<Output> {
    const notificacao = await this.notificacoesRepo.respond(input.id, input.replyMessage);
    return { notificacao };
  }
}