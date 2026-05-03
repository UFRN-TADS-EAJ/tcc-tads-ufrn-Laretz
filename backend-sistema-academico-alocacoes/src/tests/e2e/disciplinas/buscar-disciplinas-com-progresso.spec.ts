import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { createAndAuthenticateUser } from "@/tests/e2e/helpers/create-and-authenticate-user";
import { prisma } from "@/lib/prisma";

describe("Buscar Disciplinas com Progresso (e2e)", () => {
  let periodoId: string;

  beforeAll(async () => {
    await app.ready();

    await prisma.periodoLetivo.updateMany({
      where: { ativo: true },
      data: { ativo: false },
    });
    const periodo = await prisma.periodoLetivo.create({
      data: {
        nome: `e2e-${Date.now()}`,
        data_inicio: new Date("2026-01-01T00:00:00.000Z"),
        data_fim: new Date("2026-06-30T00:00:00.000Z"),
        ativo: true,
      },
    });
    periodoId = periodo.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to fetch all disciplines with progress", async () => {
    const { token } = await createAndAuthenticateUser(app);

    // Criar dados de teste
    const curso = await prisma.curso.create({
      data: {
        nome: "Engenharia de Software",
        codigo: "ES001",
        duracao_semestres: 8,
        turno: "MATUTINO",
      },
    });

    const turma = await prisma.turma.create({
      data: {
        nome: "Turma 1",
        num_alunos: 30,
        turno: "MATUTINO",
        id_curso: curso.id,
        semestre: 1,
      },
    });

    const disciplina = await prisma.disciplina.create({
      data: {
        nome: "Programação I",
        codigo: "PROG001",
        carga_horaria: 60,
        id_curso: curso.id,
        horario_consolidado: "SEG 08:00-10:00, QUA 08:00-10:00",
        tipo_de_sala: "Lab",
      },
    });

    // Criar dependências mínimas para alocação
    const user = await prisma.user.create({
      data: {
        nome: "Professor Teste",
        email: `prof_${Date.now()}@example.com`,
        senha: "senha-secreta",
        role: "PROFESSOR",
      },
    });

    const sala = await prisma.sala.create({
      data: {
        nome: "Sala 101",
        capacidade: 30,
        tipo: "Sala",
      },
    });

    const horario = await prisma.horario.create({
      data: {
        codigo: "M1",
        dia_semana: "SEGUNDA",
        horario_inicio: new Date("1970-01-01T07:30:00Z"),
        horario_fim: new Date("1970-01-01T08:20:00Z"),
      },
    });

    const cursoDisciplina = await prisma.cursoDisciplina.create({
      data: {
        id_curso: curso.id,
        id_disciplina: disciplina.id,
      },
    });

    await prisma.alocacao.create({
      data: {
        id_user: user.id,
        id_disciplina: disciplina.id,
        id_turma: turma.id,
        id_sala: sala.id,
        id_horario: horario.id,
        id_curso_disciplina: cursoDisciplina.id,
        periodoId,
      },
    });

    const response = await request(app.server)
      .get("/disciplinas/com-progresso")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.disciplinas).toHaveLength(1);
    expect(response.body.disciplinas[0]).toEqual(
      expect.objectContaining({
        id: disciplina.id,
        nome: "Programação I",
        carga_horaria: 60,
        carga_horaria_atual: expect.any(Number),
        total_aulas: expect.any(Number),
        aulas_ministradas: expect.any(Number),
        tipo_de_sala: "Lab",
      }),
    );
  });

  it("should be able to fetch disciplines by turma", async () => {
    const { token } = await createAndAuthenticateUser(app);

    const curso = await prisma.curso.create({
      data: {
        nome: "Ciência da Computação",
        codigo: "CC001",
        duracao_semestres: 8,
        turno: "MATUTINO",
      },
    });

    const turma1 = await prisma.turma.create({
      data: {
        nome: "2024.1",
        num_alunos: 35,
        turno: "MATUTINO",
        id_curso: curso.id,
        semestre: 1,
      },
    });

    const turma2 = await prisma.turma.create({
      data: {
        nome: "2024.2",
        num_alunos: 40,
        turno: "VESPERTINO",
        id_curso: curso.id,
        semestre: 2,
      },
    });

    const disciplina1 = await prisma.disciplina.create({
      data: {
        nome: "Algoritmos I",
        codigo: "ALG001",
        carga_horaria: 60,
        id_curso: curso.id,
        horario_consolidado: "TER 10:00-12:00",
        tipo_de_sala: "Sala",
      },
    });

    const disciplina2 = await prisma.disciplina.create({
      data: {
        nome: "Algoritmos II",
        codigo: "ALG002",
        carga_horaria: 60,
        id_curso: curso.id,
        horario_consolidado: "QUI 14:00-16:00",
        tipo_de_sala: "Sala",
      },
    });

    // Criar dependências para alocações
    const user2 = await prisma.user.create({
      data: {
        nome: "Professor Teste 2",
        email: `prof2_${Date.now()}@example.com`,
        senha: "senha-secreta",
        role: "PROFESSOR",
      },
    });

    const sala2 = await prisma.sala.create({
      data: {
        nome: "Sala 102",
        capacidade: 35,
        tipo: "Sala",
      },
    });

    const horario2 = await prisma.horario.create({
      data: {
        codigo: "M2",
        dia_semana: "TERCA",
        horario_inicio: new Date("1970-01-01T10:00:00Z"),
        horario_fim: new Date("1970-01-01T12:00:00Z"),
      },
    });

    const cd1 = await prisma.cursoDisciplina.create({
      data: { id_curso: curso.id, id_disciplina: disciplina1.id },
    });
    await prisma.alocacao.create({
      data: {
        id_user: user2.id,
        id_disciplina: disciplina1.id,
        id_turma: turma1.id,
        id_sala: sala2.id,
        id_horario: horario2.id,
        id_curso_disciplina: cd1.id,
        periodoId,
      },
    });

    const cd2 = await prisma.cursoDisciplina.create({
      data: { id_curso: curso.id, id_disciplina: disciplina2.id },
    });
    const horario3 = await prisma.horario.create({
      data: {
        codigo: "M3",
        dia_semana: "QUARTA",
        horario_inicio: new Date("1970-01-01T10:00:00Z"),
        horario_fim: new Date("1970-01-01T12:00:00Z"),
      },
    });
    await prisma.alocacao.create({
      data: {
        id_user: user2.id,
        id_disciplina: disciplina2.id,
        id_turma: turma2.id,
        id_sala: sala2.id,
        id_horario: horario3.id,
        id_curso_disciplina: cd2.id,
        periodoId,
      },
    });

    const response = await request(app.server)
      .get(`/disciplinas/com-progresso?turmaId=${turma1.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.disciplinas).toHaveLength(1);
    expect(response.body.disciplinas[0].nome).toBe("Algoritmos I");
  });

  it("should be able to fetch disciplines by curso", async () => {
    const { token } = await createAndAuthenticateUser(app);

    const curso1 = await prisma.curso.create({
      data: {
        nome: "Sistemas de Informação",
        codigo: "SI001",
        duracao_semestres: 8,
        turno: "MATUTINO",
      },
    });

    const curso2 = await prisma.curso.create({
      data: {
        nome: "Engenharia da Computação",
        codigo: "EC001",
        duracao_semestres: 10,
        turno: "MATUTINO",
      },
    });

    const disciplina1 = await prisma.disciplina.create({
      data: {
        nome: "Banco de Dados",
        codigo: "BD001",
        carga_horaria: 60,
        id_curso: curso1.id,
        horario_consolidado: "SEX 08:00-10:00",
        tipo_de_sala: "Lab",
      },
    });

    const disciplina2 = await prisma.disciplina.create({
      data: {
        nome: "Circuitos Digitais",
        codigo: "CD001",
        carga_horaria: 80,
        id_curso: curso2.id,
        horario_consolidado: "SEG 14:00-16:00",
        tipo_de_sala: "Lab",
      },
    });

    const response = await request(app.server)
      .get(`/disciplinas/com-progresso?cursoId=${curso1.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    const user = await prisma.user.create({
      data: {
        nome: "Professor Curso",
        email: `prof_curso_${Date.now()}@example.com`,
        senha: "senha-secreta",
        role: "PROFESSOR",
      },
    });
    const sala = await prisma.sala.create({
      data: { nome: "Sala Curso", capacidade: 30, tipo: "Sala" },
    });
    const horario = await prisma.horario.create({
      data: {
        codigo: "M4",
        dia_semana: "SEXTA",
        horario_inicio: new Date("1970-01-01T08:00:00Z"),
        horario_fim: new Date("1970-01-01T10:00:00Z"),
      },
    });
    const turma = await prisma.turma.create({
      data: {
        nome: "2024.1",
        num_alunos: 25,
        turno: "MATUTINO",
        id_curso: curso1.id,
        semestre: 1,
      },
    });
    const cd = await prisma.cursoDisciplina.create({
      data: { id_curso: curso1.id, id_disciplina: disciplina1.id },
    });
    await prisma.alocacao.create({
      data: {
        id_user: user.id,
        id_disciplina: disciplina1.id,
        id_turma: turma.id,
        id_sala: sala.id,
        id_horario: horario.id,
        id_curso_disciplina: cd.id,
        periodoId,
      },
    });

    const response2 = await request(app.server)
      .get(`/disciplinas/com-progresso?cursoId=${curso1.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response2.body.disciplinas).toHaveLength(1);
    expect(response2.body.disciplinas[0].nome).toBe("Banco de Dados");
  });

  it("should return empty array when no disciplines found", async () => {
    const { token } = await createAndAuthenticateUser(app);

    const curso = await prisma.curso.create({
      data: {
        nome: "Curso Vazio",
        codigo: `CVAZIO-${Date.now()}`,
        duracao_semestres: 8,
        turno: "MATUTINO",
      },
    });

    const turma = await prisma.turma.create({
      data: {
        nome: `TVAZIA-${Date.now()}`,
        num_alunos: 25,
        turno: "MATUTINO",
        id_curso: curso.id,
        semestre: 1,
      },
    });

    const response = await request(app.server)
      .get(`/disciplinas/com-progresso?turmaId=${turma.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.disciplinas).toHaveLength(0);
  });
});
