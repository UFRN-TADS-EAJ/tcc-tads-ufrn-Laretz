import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "@/app";
import request from "supertest";
import { createAndAuthenticateUser } from "@/tests/e2e/helpers/create-and-authenticate-user";

describe("Períodos letivos (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("deve criar e listar períodos letivos (ADMIN)", async () => {
    const { token } = await createAndAuthenticateUser(app, true);
    const nome = `2026.1-${Date.now()}`;

    const createResponse = await request(app.server)
      .post("/periodos-letivos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome,
        data_inicio: "2026-01-01",
        data_fim: "2026-06-30",
      })
      .expect(201);

    await request(app.server)
      .patch(`/periodos-letivos/${createResponse.body.periodo.id}/ativar`)
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(200);

    expect(createResponse.body).toEqual({
      periodo: expect.objectContaining({
        id: expect.any(String),
        nome,
        ativo: true,
      }),
    });

    const listResponse = await request(app.server)
      .get("/periodos-letivos")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listResponse.body.periodos)).toBe(true);
    expect(
      listResponse.body.periodos.some(
        (p: any) => p.id === createResponse.body.periodo.id && p.nome === nome,
      ),
    ).toBe(true);
  });

  it("deve retornar o período letivo ativo (JWT)", async () => {
    const { token: adminToken } = await createAndAuthenticateUser(app, true);
    const { token } = await createAndAuthenticateUser(app, false);
    const nome = `2026.1-${Date.now()}`;

    const createResponse = await request(app.server)
      .post("/periodos-letivos")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome,
        data_inicio: "2026-01-01",
        data_fim: "2026-06-30",
      })
      .expect(201);

    await request(app.server)
      .patch(`/periodos-letivos/${createResponse.body.periodo.id}/ativar`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send()
      .expect(200);

    const activeResponse = await request(app.server)
      .get("/periodos-letivos/ativo")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(activeResponse.body.periodo.id).toBe(createResponse.body.periodo.id);
    expect(activeResponse.body.periodo.ativo).toBe(true);
  });

  it("deve ativar um período e desativar os demais (ADMIN)", async () => {
    const { token } = await createAndAuthenticateUser(app, true);
    const nome1 = `2026.1-${Date.now()}`;
    const nome2 = `2026.2-${Date.now()}`;

    const p1 = await request(app.server)
      .post("/periodos-letivos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: nome1,
        data_inicio: "2026-01-01",
        data_fim: "2026-06-30",
      })
      .expect(201);

    const p2 = await request(app.server)
      .post("/periodos-letivos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: nome2,
        data_inicio: "2026-07-01",
        data_fim: "2026-12-20",
      })
      .expect(201);

    await request(app.server)
      .patch(`/periodos-letivos/${p1.body.periodo.id}/ativar`)
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(200);

    const activeResponse = await request(app.server)
      .get("/periodos-letivos/ativo")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(activeResponse.body.periodo.id).toBe(p1.body.periodo.id);
    expect(activeResponse.body.periodo.ativo).toBe(true);

    const listResponse = await request(app.server)
      .get("/periodos-letivos")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const byId = new Map<string, any>(
      listResponse.body.periodos.map((p: any) => [p.id, p] as const),
    );
    expect(byId.get(p1.body.periodo.id)?.ativo).toBe(true);
    expect(byId.get(p2.body.periodo.id)?.ativo).toBe(false);
  });

  it("deve avançar o período: encerrar o ativo e criar/ativar o próximo (ADMIN)", async () => {
    const { token } = await createAndAuthenticateUser(app, true);
    const nome1 = `2026.1-${Date.now()}`;
    const nome2 = `2026.2-${Date.now()}`;

    await request(app.server)
      .post("/periodos-letivos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: nome1,
        data_inicio: "2026-01-01",
        data_fim: "2026-06-30",
      })
      .expect(201);

    const advanceResponse = await request(app.server)
      .post("/periodos-letivos/avancar")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: nome2,
        data_inicio: "2026-07-01",
        data_fim: "2026-12-20",
      })
      .expect(201);

    expect(advanceResponse.body).toEqual({
      encerrados: expect.any(Number),
      periodo: expect.objectContaining({
        id: expect.any(String),
        nome: nome2,
        ativo: true,
      }),
    });
    expect(advanceResponse.body.encerrados).toBeGreaterThanOrEqual(1);

    const activeResponse = await request(app.server)
      .get("/periodos-letivos/ativo")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(activeResponse.body.periodo.id).toBe(advanceResponse.body.periodo.id);
    expect(activeResponse.body.periodo.nome).toBe(nome2);
  });
});
