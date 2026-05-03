import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { createAndAuthenticateUser } from "@/tests/e2e/helpers/create-and-authenticate-user";

describe("Salas - Grade de horários (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("deve retornar grade preenchida para sala com alocação", async () => {
    const { token: adminToken } = await createAndAuthenticateUser(app, true);

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

    const curso = await prisma.curso.create({
      data: { nome: "Curso Sala", codigo: "CSL", duracao_semestres: 8, turno: "MATUTINO" },
    });
    const disciplina = await prisma.disciplina.create({
      data: { nome: "Disc Sala", codigo: "DSL", carga_horaria: 60, id_curso: curso.id, tipo_de_sala: "Sala" },
    });
    const cd = await prisma.cursoDisciplina.create({ data: { id_curso: curso.id, id_disciplina: disciplina.id } });
    const turma = await prisma.turma.create({
      data: { nome: "2025.1", num_alunos: 25, turno: "MATUTINO", id_curso: curso.id, semestre: 1 },
    });
    const sala = await prisma.sala.create({ data: { nome: "Sala GH", capacidade: 25, tipo: "Sala" } });
    const horario = await prisma.horario.create({
      data: { codigo: "HGH", dia_semana: "segunda", horario_inicio: new Date("1970-01-01T07:30:00Z"), horario_fim: new Date("1970-01-01T08:20:00Z") },
    });
    const { email } = await createAndAuthenticateUser(app, false);
    const prof = await prisma.user.findUnique({ where: { email } });

    await request(app.server)
      .post("/alocacoes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ id_user: prof!.id, id_curso_disciplina: cd.id, id_turma: turma.id, id_sala: sala.id, id_horario: horario.id })
      .expect(201);

    const resGrade = await request(app.server)
      .get(`/grade-horarios?id_sala=${sala.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(typeof resGrade.body.gradeHorarios).toBe("object");
  });
});
