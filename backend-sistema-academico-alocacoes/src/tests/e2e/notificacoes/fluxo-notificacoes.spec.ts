import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

describe("Notificações (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("fluxo de criar, listar, marcar lida e responder", async () => {
    const coordEmail = `coord_${Date.now()}@example.com`;
    await prisma.user.create({
      data: {
        nome: "Coord E2E",
        email: coordEmail,
        senha: await hash("123456", 6),
        role: "COORDENADOR",
      },
    });

    const authCoord = await request(app.server).post("/session").send({ email: coordEmail, senha: "123456" });
    const coordToken = authCoord.body.token;

    const profEmail = `prof_notif_${Date.now()}@example.com`;
    const prof = await prisma.user.create({
      data: {
        nome: "Prof Notif",
        email: profEmail,
        senha: await hash("123456", 6),
        role: "PROFESSOR",
      },
    });

    const authProf = await request(app.server).post("/session").send({ email: profEmail, senha: "123456" });
    const profToken = authProf.body.token;

    const resCreate = await request(app.server)
      .post("/notificacoes")
      .set("Authorization", `Bearer ${coordToken}`)
      .send({ userId: prof.id, type: "GENERICA", title: "Aviso", message: "Teste" })
      .expect(201);

    const notifId = resCreate.body.notificacao.id;

    const resList = await request(app.server)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${profToken}`)
      .expect(200);

    expect(resList.body.notificacoes.length).toBeGreaterThanOrEqual(1);

    const resRead = await request(app.server)
      .patch(`/notificacoes/${notifId}/read`)
      .set("Authorization", `Bearer ${profToken}`)
      .expect(200);

    expect(resRead.body.notificacao.status).toBeDefined();

    const resRespond = await request(app.server)
      .post(`/notificacoes/${notifId}/respond`)
      .set("Authorization", `Bearer ${profToken}`)
      .send({ replyMessage: "OK" })
      .expect(200);

    expect(resRespond.body.notificacao.status).toBe("RESPONDIDA");
  });
});