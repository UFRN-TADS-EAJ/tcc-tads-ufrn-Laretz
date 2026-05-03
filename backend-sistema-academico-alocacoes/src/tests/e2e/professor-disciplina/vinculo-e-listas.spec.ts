import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { createAndAuthenticateUser } from "@/tests/e2e/helpers/create-and-authenticate-user";

describe("Professor-Disciplina (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("vincular professor a disciplina, listar e desvincular", async () => {
    const { token: adminToken } = await createAndAuthenticateUser(app, true);
    const { token: profToken, email } = await createAndAuthenticateUser(app, false);
    const prof = await prisma.user.findUnique({ where: { email } });

    const curso = await prisma.curso.create({
      data: { nome: "Curso PD", codigo: "CPD", duracao_semestres: 8, turno: "MATUTINO" },
    });

    const disciplina = await prisma.disciplina.create({
      data: { nome: "Disciplina PD", codigo: "DPD", carga_horaria: 60, id_curso: curso.id, tipo_de_sala: "Sala" },
    });

    const resVincular = await request(app.server)
      .post("/professor-disciplina/vincular")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ id_user: prof!.id, id_disciplina: disciplina.id })
      .expect(201);

    expect(resVincular.body.id_user).toBe(prof!.id);
    expect(resVincular.body.id_disciplina).toBe(disciplina.id);

    const resDisciplinasProfessor = await request(app.server)
      .get(`/professores/${prof!.id}/disciplinas`)
      .set("Authorization", `Bearer ${profToken}`)
      .expect(200);

    expect(resDisciplinasProfessor.body.disciplinas.length).toBeGreaterThanOrEqual(1);

    const resProfessoresDisciplina = await request(app.server)
      .get(`/disciplinas/${disciplina.id}/professores`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(resProfessoresDisciplina.body.professores.length).toBeGreaterThanOrEqual(1);

    await request(app.server)
      .delete("/professor-disciplina/desvincular")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ id_user: prof!.id, id_disciplina: disciplina.id })
      .expect(200);
  });
});