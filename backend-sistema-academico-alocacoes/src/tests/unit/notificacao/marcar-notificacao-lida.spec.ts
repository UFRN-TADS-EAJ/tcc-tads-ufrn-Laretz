import { describe, it, expect } from "vitest";
import { MarcarNotificacaoLidaUseCase } from "@/use-cases/notificacao/marcar-notificacao-lida";
import { InMemoryNotificacoesRepository } from "@/repositories/in-memory/in-memory-notificacoes-repository";
import { NotificacaoType } from "@prisma/client";

describe("MarcarNotificacaoLidaUseCase", () => {
  it("deve marcar como lida e preencher read_at", async () => {
    const repo = new InMemoryNotificacoesRepository();
    const created = await repo.create({ user: { connect: { id: "user-1" } }, type: NotificacaoType.GENERICA, title: "A", message: "m" });

    const sut = new MarcarNotificacaoLidaUseCase(repo);
    const { notificacao } = await sut.execute({ id: created.id });

    expect(notificacao).not.toBeNull();
    expect(notificacao!.status).toBe("LIDA");
    expect(notificacao!.read_at).toBeInstanceOf(Date);
  });

  it("deve retornar null quando id nao existe", async () => {
    const repo = new InMemoryNotificacoesRepository();
    const sut = new MarcarNotificacaoLidaUseCase(repo);
    const { notificacao } = await sut.execute({ id: "nao-existe" });
    expect(notificacao).toBeNull();
  });
});