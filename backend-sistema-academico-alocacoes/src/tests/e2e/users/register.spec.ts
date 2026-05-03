import { afterAll, beforeAll, describe, expect, it, test } from "vitest";
import { app } from "@/app";
import request from "supertest";

describe("Register (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to register", async () => {
    const uniqueEmail = `unique-${Date.now()}@email.com`;
    const response = await request(app.server).post("/register").send({
      nome: "John Doe",
      email: uniqueEmail,
      senha: "123456",
    });
    expect(response.statusCode).toEqual(201);
  });
});
