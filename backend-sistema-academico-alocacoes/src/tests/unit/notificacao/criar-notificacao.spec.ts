import { describe, it, expect } from "vitest";
import { CriarNotificacaoUseCase } from "@/use-cases/notificacao/criar-notificacao";
import { InMemoryNotificacoesRepository } from "@/repositories/in-memory/in-memory-notificacoes-repository";
import { NotificacaoStatus, NotificacaoType } from "@prisma/client";

describe("CriarNotificacaoUseCase", () => {
  it("deve criar uma notificacao pendente com metadata opcional", async () => {
    const repo = new InMemoryNotificacoesRepository();
    const sut = new CriarNotificacaoUseCase(repo);

    const { notificacao } = await sut.execute({
      userId: "user-1",
      type: NotificacaoType.GENERICA,
      title: "Aviso",
      message: "Teste de notificacao",
      metadata: { origem: "teste" },
    });

    expect(notificacao).toBeDefined();
    expect(notificacao.userId).toBe("user-1");
    expect(notificacao.type).toBe(NotificacaoType.GENERICA);
    expect(notificacao.title).toBe("Aviso");
    expect(notificacao.message).toBe("Teste de notificacao");
    expect(notificacao.status).toBe(NotificacaoStatus.PENDENTE);
    expect(notificacao.created_at).toBeInstanceOf(Date);
    expect(notificacao.read_at).toBeNull();
    expect(notificacao.responded_at).toBeNull();
    expect(notificacao.metadata).toStrictEqual({ origem: "teste" });
  });

  it("deve criar notificacao sem metadata quando nao informado", async () => {
    const repo = new InMemoryNotificacoesRepository();
    const sut = new CriarNotificacaoUseCase(repo);

    const { notificacao } = await sut.execute({
      userId: "user-1",
      type: NotificacaoType.GENERICA,
      title: "Sem metadata",
      message: "Mensagem",
    });

    expect(notificacao.metadata).toBeNull();
  });
});