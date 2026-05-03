import { NotificacaoRepository } from "@/repositories/notificacao-repository";
import { Notificacao, NotificacaoStatus } from "@prisma/client";

interface Input {
  userId: string;
  status?: NotificacaoStatus | undefined;
}

interface Output {
  notificacoes: Notificacao[];
}

export class ListarNotificacoesUseCase {
  constructor(private notificacoesRepo: NotificacaoRepository) {}

  async execute(input: Input): Promise<Output> {
    const filtro = input.status
      ? { userId: input.userId, status: input.status }
      : { userId: input.userId };
    const notificacoes = await this.notificacoesRepo.findMany(filtro);

    return { notificacoes };
  }
}