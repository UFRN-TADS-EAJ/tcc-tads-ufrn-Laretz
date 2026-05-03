import { describe, it, expect } from "vitest";
import { ListarNotificacoesUseCase } from "@/use-cases/notificacao/listar-notificacoes";
import { InMemoryNotificacoesRepository } from "@/repositories/in-memory/in-memory-notificacoes-repository";
import { NotificacaoStatus, NotificacaoType } from "@prisma/client";

describe("ListarNotificacoesUseCase", () => {
  it("deve listar por userId ordenado por created_at desc e filtrar por status quando informado", async () => {
    const repo = new InMemoryNotificacoesRepository();

    // cria notificacoes para dois usuarios
    await repo.create({ user: { connect: { id: "user-1" } }, type: NotificacaoType.GENERICA, title: "A", message: "m1" });
    await new Promise((r) => setTimeout(r, 2));
    await repo.create({ user: { connect: { id: "user-1" } }, type: NotificacaoType.GENERICA, title: "B", message: "m2" });
    await new Promise((r) => setTimeout(r, 2));
    const c = await repo.create({ user: { connect: { id: "user-1" } }, type: NotificacaoType.GENERICA, title: "C", message: "m3" });
    await repo.create({ user: { connect: { id: "user-2" } }, type: NotificacaoType.GENERICA, title: "D", message: "m4" });

    // marca uma como lida para testar filtro
    await repo.markRead(c.id);

    const sut = new ListarNotificacoesUseCase(repo);

    const { notificacoes: todas } = await sut.execute({ userId: "user-1" });
    expect(todas.length).toBe(3);
    expect(todas[0]!.title).toBe("C"); // última criada primeiro
    expect(todas[1]!.title).toBe("B");
    expect(todas[2]!.title).toBe("A");

    const { notificacoes: lidas } = await sut.execute({ userId: "user-1", status: NotificacaoStatus.LIDA });
    expect(lidas.length).toBe(1);
    expect(lidas[0]!.status).toBe(NotificacaoStatus.LIDA);
  });
});