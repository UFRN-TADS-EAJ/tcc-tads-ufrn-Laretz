import { afterAll, beforeAll, describe, expect, it, test } from "vitest";
import { app } from "@/app";
import request from "supertest";
import { createAndAuthenticateUser } from "@/tests/e2e/helpers/create-and-authenticate-user";

describe("Create Disciplina (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to create a discipline", async () => {
    const { token } = await createAndAuthenticateUser(app, true);

    // Primeiro criar um curso
    const cursoResponse = await request(app.server)
      .post("/cursos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        codigo: "ENG001",
        nome: "Engenharia de Software",
        turno: "MATUTINO",
        duracao_semestres: 8
      });

    const cursoId = cursoResponse.body.curso.id;

    const response = await request(app.server)
      .post("/disciplinas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Matemática",
        carga_horaria: 60,
        id_curso: cursoId,
        tipo_de_sala: "Lab",
        data_inicio: "2024-02-01T00:00:00.000Z",
        data_fim_prevista: "2024-06-30T00:00:00.000Z",
        periodo_letivo: "2024.1",
        codigo: "MAT001",
        semestre: 1
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body.disciplina).toEqual(
      expect.objectContaining({
        nome: "Matemática",
        carga_horaria: 60,
        total_aulas: 72,
        periodo_letivo: "2024.1",
        codigo: "MAT001",
        semestre: 1
      })
    );
  });
});
