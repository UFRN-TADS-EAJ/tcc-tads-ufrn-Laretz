import { describe, it, expect } from "vitest";
import { ResponderNotificacaoUseCase } from "@/use-cases/notificacao/responder-notificacao";
import { InMemoryNotificacoesRepository } from "@/repositories/in-memory/in-memory-notificacoes-repository";
import { NotificacaoType } from "@prisma/client";

describe("ResponderNotificacaoUseCase", () => {
  it("deve responder notificacao e preencher responded_at e replyMessage", async () => {
    const repo = new InMemoryNotificacoesRepository();
    const created = await repo.create({ user: { connect: { id: "user-1" } }, type: NotificacaoType.GENERICA, title: "A", message: "m" });

    const sut = new ResponderNotificacaoUseCase(repo);
    const { notificacao } = await sut.execute({ id: created.id, replyMessage: "Ok, entendido" });

    expect(notificacao).not.toBeNull();
    expect(notificacao!.status).toBe("RESPONDIDA");
    expect(notificacao!.responded_at).toBeInstanceOf(Date);
    expect(notificacao!.replyMessage).toBe("Ok, entendido");
  });

  it("deve retornar null quando id nao existe", async () => {
    const repo = new InMemoryNotificacoesRepository();
    const sut = new ResponderNotificacaoUseCase(repo);
    const { notificacao } = await sut.execute({ id: "nao-existe", replyMessage: "msg" });
    expect(notificacao).toBeNull();
  });
});