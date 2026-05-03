import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { createAndAuthenticateUser } from "@/tests/e2e/helpers/create-and-authenticate-user";

describe("User-Curso (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("vincular usuário a curso, listar e desvincular", async () => {
    const { token: adminToken } = await createAndAuthenticateUser(app, true);

    const curso = await prisma.curso.create({
      data: { nome: "Curso UC", codigo: "CUC", duracao_semestres: 8, turno: "MATUTINO" },
    });

    const { token: profToken, email } = await createAndAuthenticateUser(app, false);
    const prof = await prisma.user.findUnique({ where: { email } });

    const resVincular = await request(app.server)
      .post("/user-curso/vincular")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ id_user: prof!.id, id_curso: curso.id })
      .expect(201);

    expect(resVincular.body.id_user).toBe(prof!.id);
    expect(resVincular.body.id_curso).toBe(curso.id);

    const resCursosUsuario = await request(app.server)
      .get(`/user-curso/cursos/${prof!.id}`)
      .set("Authorization", `Bearer ${profToken}`)
      .expect(200);

    expect(resCursosUsuario.body.cursos.length).toBeGreaterThanOrEqual(1);

    const resUsuariosCurso = await request(app.server)
      .get(`/user-curso/usuarios/${curso.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(resUsuariosCurso.body.usuarios.length).toBeGreaterThanOrEqual(1);

    await request(app.server)
      .delete("/user-curso/desvincular")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ id_user: prof!.id, id_curso: curso.id })
      .expect(200);
  });
});