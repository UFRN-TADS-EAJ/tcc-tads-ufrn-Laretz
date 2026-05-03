import { NotificacaoRepository } from "@/repositories/notificacao-repository";
import { Notificacao, Prisma } from "@prisma/client";

type Input = {
  userId: string;
  type: Prisma.NotificacaoUncheckedCreateInput["type"];
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
};

interface Output {
  notificacao: Notificacao;
}

export class CriarNotificacaoUseCase {
  constructor(private notificacoesRepo: NotificacaoRepository) {}

  async execute(input: Input): Promise<Output> {
    const data: Prisma.NotificacaoCreateInput = {
      user: { connect: { id: input.userId } },
      type: input.type,
      title: input.title,
      message: input.message,
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    };

    const notificacao = await this.notificacoesRepo.create(data);

    return { notificacao };
  }
}