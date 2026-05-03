import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { createAndAuthenticateUser } from "@/tests/e2e/helpers/create-and-authenticate-user";

describe("Alocações (e2e)", () => {
  beforeAll(async () => {
    await app.ready();

    await prisma.periodoLetivo.updateMany({
      where: { ativo: true },
      data: { ativo: false },
    });
    await prisma.periodoLetivo.create({
      data: {
        nome: `e2e-${Date.now()}`,
        data_inicio: new Date("2026-01-01T00:00:00.000Z"),
        data_fim: new Date("2026-06-30T00:00:00.000Z"),
        ativo: true,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("deve criar alocação e listar", async () => {
    const { token } = await createAndAuthenticateUser(app, true);

    const curso = await prisma.curso.create({
      data: {
        nome: "Curso E2E",
        codigo: `CE2E-${Date.now()}`,
        duracao_semestres: 8,
        turno: "MATUTINO",
      },
    });

    const disciplina = await prisma.disciplina.create({
      data: {
        nome: "Disciplina E2E",
        codigo: `DE2E-${Date.now()}`,
        carga_horaria: 60,
        id_curso: curso.id,
        tipo_de_sala: "Sala",
        horario_consolidado: "SEG 08:00-10:00",
      },
    });

    const turma = await prisma.turma.create({
      data: {
        nome: "2025.1",
        num_alunos: 30,
        turno: "MATUTINO",
        id_curso: curso.id,
        semestre: 1,
      },
    });

    const sala = await prisma.sala.create({
      data: { nome: "Sala E2E", capacidade: 30, tipo: "Sala" },
    });

    const horario = await prisma.horario.create({
      data: {
        codigo: "H1",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("1970-01-01T08:00:00Z"),
        horario_fim: new Date("1970-01-01T10:00:00Z"),
      },
    });

    const professor = await prisma.user.create({
      data: {
        nome: "Prof E2E",
        email: `prof_${Date.now()}@example.com`,
        senha: "senha-secreta",
        role: "PROFESSOR",
      },
    });

    const cd = await prisma.cursoDisciplina.create({
      data: { id_curso: curso.id, id_disciplina: disciplina.id },
    });

    const resCreate = await request(app.server)
      .post("/alocacoes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_user: professor.id,
        id_curso_disciplina: cd.id,
        id_turma: turma.id,
        id_sala: sala.id,
        id_horario: horario.id,
      })
      .expect(201);

    expect(resCreate.body.alocacao).toBeDefined();

    const resList = await request(app.server)
      .get("/alocacoes")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(resList.body.alocacoes)).toBe(true);
    expect(resList.body.alocacoes.length).toBeGreaterThanOrEqual(1);
  });

  it("deve detectar conflito ao duplicar professor no mesmo horário", async () => {
    const { token } = await createAndAuthenticateUser(app, true);

    const curso = await prisma.curso.create({
      data: {
        nome: "Curso E2E 2",
        codigo: `CE2E2-${Date.now()}`,
        duracao_semestres: 8,
        turno: "MATUTINO",
      },
    });

    const disciplina = await prisma.disciplina.create({
      data: {
        nome: "Disciplina 2",
        codigo: `D2-${Date.now()}`,
        carga_horaria: 60,
        id_curso: curso.id,
        tipo_de_sala: "Sala",
      },
    });

    const turma = await prisma.turma.create({
      data: {
        nome: "2025.2",
        num_alunos: 28,
        turno: "MATUTINO",
        id_curso: curso.id,
        semestre: 1,
      },
    });

    const sala = await prisma.sala.create({
      data: { nome: "Sala 2", capacidade: 28, tipo: "Sala" },
    });

    const horario = await prisma.horario.create({
      data: {
        codigo: "H2",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("1970-01-01T08:00:00Z"),
        horario_fim: new Date("1970-01-01T10:00:00Z"),
      },
    });

    const professor = await prisma.user.create({
      data: {
        nome: "Prof 2",
        email: `prof2_${Date.now()}@example.com`,
        senha: "senha-secreta",
        role: "PROFESSOR",
      },
    });

    const cd = await prisma.cursoDisciplina.create({
      data: { id_curso: curso.id, id_disciplina: disciplina.id },
    });

    await request(app.server)
      .post("/alocacoes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_user: professor.id,
        id_curso_disciplina: cd.id,
        id_turma: turma.id,
        id_sala: sala.id,
        id_horario: horario.id,
      })
      .expect(201);

    const resConflict = await request(app.server)
      .post("/alocacoes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_user: professor.id,
        id_curso_disciplina: cd.id,
        id_turma: turma.id,
        id_sala: sala.id,
        id_horario: horario.id,
      })
      .expect(409);

    expect(resConflict.body).toEqual(
      expect.objectContaining({
        code: expect.any(String),
        message: expect.any(String),
      }),
    );
  });
});
