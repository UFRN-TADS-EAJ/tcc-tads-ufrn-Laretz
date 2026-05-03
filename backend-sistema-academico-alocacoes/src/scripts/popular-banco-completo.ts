import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { calcularUltimoDiaAula } from "../utils/parse-horario-consolidado";

const prisma = new PrismaClient();

function totalAulasPorCargaHoraria(carga_horaria: number) {
  return Math.ceil((carga_horaria * 60) / 50);
}

function dateOnlyUTC(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}

function timeOnlyUTC(hh: number, mm: number) {
  return new Date(
    `1970-01-01T${hh.toString().padStart(2, "0")}:${mm
      .toString()
      .padStart(2, "0")}:00.000Z`
  );
}

const HORARIOS_DEFINIDOS = {
  M: [
    { inicio: { hora: 7, minuto: 0 }, fim: { hora: 7, minuto: 50 } },
    { inicio: { hora: 7, minuto: 50 }, fim: { hora: 8, minuto: 40 } },
    { inicio: { hora: 8, minuto: 55 }, fim: { hora: 9, minuto: 45 } },
    { inicio: { hora: 9, minuto: 45 }, fim: { hora: 10, minuto: 35 } },
    { inicio: { hora: 10, minuto: 50 }, fim: { hora: 11, minuto: 40 } },
    { inicio: { hora: 11, minuto: 40 }, fim: { hora: 12, minuto: 30 } },
  ],
  T: [
    { inicio: { hora: 13, minuto: 0 }, fim: { hora: 13, minuto: 50 } },
    { inicio: { hora: 13, minuto: 50 }, fim: { hora: 14, minuto: 40 } },
    { inicio: { hora: 14, minuto: 55 }, fim: { hora: 15, minuto: 45 } },
    { inicio: { hora: 15, minuto: 45 }, fim: { hora: 16, minuto: 35 } },
    { inicio: { hora: 16, minuto: 50 }, fim: { hora: 17, minuto: 40 } },
    { inicio: { hora: 17, minuto: 40 }, fim: { hora: 18, minuto: 30 } },
  ],
  N: [
    { inicio: { hora: 18, minuto: 45 }, fim: { hora: 19, minuto: 35 } },
    { inicio: { hora: 19, minuto: 35 }, fim: { hora: 20, minuto: 25 } },
    { inicio: { hora: 20, minuto: 35 }, fim: { hora: 21, minuto: 25 } },
    { inicio: { hora: 21, minuto: 25 }, fim: { hora: 22, minuto: 15 } },
  ],
};

async function seed() {
  const periodoLetivo = "2026.1";
  const dataInicio = dateOnlyUTC("2026-02-01");
  const dataFimPrevista = dateOnlyUTC("2026-07-31");

  const periodo = await prisma.periodoLetivo.upsert({
    where: { nome: periodoLetivo },
    create: {
      nome: periodoLetivo,
      data_inicio: dataInicio,
      data_fim: dataFimPrevista,
      ativo: true,
    },
    update: {
      data_inicio: dataInicio,
      data_fim: dataFimPrevista,
      ativo: true,
    },
    select: { id: true },
  });

  await prisma.periodoLetivo.updateMany({
    where: { id: { not: periodo.id }, ativo: true },
    data: { ativo: false },
  });

  const curso = await prisma.curso.upsert({
    where: { codigo: "TADS" },
    create: {
      codigo: "TADS",
      nome: "Tecnologia em Análise e Desenvolvimento de Sistemas",
      turno: "NOTURNO",
      duracao_semestres: 6,
      ativo: true,
    },
    update: {
      nome: "Tecnologia em Análise e Desenvolvimento de Sistemas",
      turno: "NOTURNO",
      duracao_semestres: 6,
      ativo: true,
    },
  });

  const predio = await prisma.predio.upsert({
    where: { codigo: "PRED-TADS" },
    create: {
      codigo: "PRED-TADS",
      nome: "Prédio TADS",
      descricao: "Prédio principal do curso TADS",
    },
    update: {
      nome: "Prédio TADS",
      descricao: "Prédio principal do curso TADS",
    },
  });

  const salasBase = [
    { nome: "Lab 1", numero: "L1", tipo: "Lab", capacidade: 40, computadores: 40 },
    { nome: "Lab 2", numero: "L2", tipo: "Lab", capacidade: 40, computadores: 40 },
    { nome: "Sala 1", numero: "S1", tipo: "Sala", capacidade: 40, computadores: 0 },
    { nome: "Sala 2", numero: "S2", tipo: "Sala", capacidade: 40, computadores: 0 },
  ] as const;

  for (const sala of salasBase) {
    const existente = await prisma.sala.findFirst({ where: { nome: sala.nome } });
    if (existente) {
      await prisma.sala.update({
        where: { id: existente.id },
        data: {
          numero: sala.numero,
          tipo: sala.tipo,
          capacidade: sala.capacidade,
          computadores: sala.computadores,
          predioId: predio.id,
          ativa: true,
        },
      });
      continue;
    }

    await prisma.sala.create({
      data: {
        nome: sala.nome,
        numero: sala.numero,
        capacidade: sala.capacidade,
        tipo: sala.tipo,
        computadores: sala.computadores,
        predioId: predio.id,
        ativa: true,
      },
    });
  }

  const adminEmail = "admin@admin.com";
  const senhaAdmin = await hash("123123", 6);
  const senhaPadrao = await hash("123456", 6);

  const usuarios = [
    {
      nome: "admin",
      email: adminEmail,
      role: "ADMIN" as const,
      especializacao: "administração do sistema",
      carga_horaria_max: null,
      preferencia: null,
    },
    {
      nome: "taniro",
      email: "taniro@tads.edu.br",
      role: "PROFESSOR" as const,
      especializacao: "programação web e mobile",
      carga_horaria_max: 40,
      preferencia: "web/mobile",
    },
    {
      nome: "antonino",
      email: "antonino@tads.edu.br",
      role: "PROFESSOR" as const,
      especializacao: "inteligência artificial e aprendizado de máquina",
      carga_horaria_max: 40,
      preferencia: "ia/rl",
    },
    {
      nome: "carla",
      email: "carla@tads.edu.br",
      role: "PROFESSOR" as const,
      especializacao: "banco de dados",
      carga_horaria_max: 40,
      preferencia: "dados",
    },
    {
      nome: "tasia",
      email: "tasia@tads.edu.br",
      role: "PROFESSOR" as const,
      especializacao: "matemática e escrita",
      carga_horaria_max: 40,
      preferencia: "matemática/textos",
    },
  ];

  const usersByEmail = new Map<string, { id: string }>();
  for (const u of usuarios) {
    const senha = u.email === adminEmail ? senhaAdmin : senhaPadrao;
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        nome: u.nome,
        email: u.email,
        senha,
        role: u.role,
        especializacao: u.especializacao,
        carga_horaria_max: u.carga_horaria_max ?? null,
        preferencia: u.preferencia ?? null,
      },
      update: {
        nome: u.nome,
        senha,
        role: u.role,
        especializacao: u.especializacao,
        carga_horaria_max: u.carga_horaria_max ?? null,
        preferencia: u.preferencia ?? null,
      },
      select: { id: true },
    });
    usersByEmail.set(u.email, user);
  }

  const userCursoData = usuarios.map((u) => ({
    id_user: usersByEmail.get(u.email)!.id,
    id_curso: curso.id,
    ativo: true,
  }));

  await prisma.userCurso.createMany({
    data: userCursoData,
    skipDuplicates: true,
  });

  const diasSemana = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
  for (const dia_semana of diasSemana) {
    for (const [turno, slots] of Object.entries(HORARIOS_DEFINIDOS)) {
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (!slot) continue;
        const codigo = `${turno}${i + 1}`;

        const existente = await prisma.horario.findFirst({
          where: { dia_semana, codigo, regime: "SUPERIOR" },
          select: { id: true },
        });

        if (!existente) {
          throw new Error(
            `Horário ausente no banco: regime=SUPERIOR dia_semana=${dia_semana} codigo=${codigo}. Rode 'npm run setup:horarios' antes do seed.`,
          );
        }
      }
    }
  }

  const disciplinasBase = [
    { semestre: 1, codigo: "TAD0001", nome: "FUNDAMENTOS DA COMPUTACAO", carga_horaria: 60, tipo_de_sala: "Sala" as const },
    { semestre: 1, codigo: "TAD0006", nome: "SISTEMAS OPERACIONAIS", carga_horaria: 60, tipo_de_sala: "Lab" as const },
    { semestre: 1, codigo: "TAD0102", nome: "ALGORITMOS E PROGRAMAÇÃO", carga_horaria: 90, tipo_de_sala: "Lab" as const },
    { semestre: 1, codigo: "TAD0105", nome: "MATEMÁTICA APLICADA I", carga_horaria: 60, tipo_de_sala: "Sala" as const },
    { semestre: 1, codigo: "TAD0201", nome: "RACIOCÍNIO LÓGICO", carga_horaria: 45, tipo_de_sala: "Sala" as const },
    { semestre: 1, codigo: "TAD0202", nome: "LEITURA E PRODUÇÃO DE TEXTOS", carga_horaria: 60, tipo_de_sala: "Sala" as const },

    { semestre: 2, codigo: "TAD0009", nome: "PROGRAMACAO ORIENTADA A OBJETOS", carga_horaria: 60, tipo_de_sala: "Lab" as const },
    { semestre: 2, codigo: "TAD0012", nome: "PROCESSO DE DESENVOLVIMENTO DE SOFTWARE", carga_horaria: 45, tipo_de_sala: "Sala" as const },
    { semestre: 2, codigo: "TAD0013", nome: "MATEMATICA APLICADA II", carga_horaria: 60, tipo_de_sala: "Sala" as const },
    { semestre: 2, codigo: "TAD0016", nome: "VERTENTES PRODUTIVAS NAS CIENCIAS AGRARIAS", carga_horaria: 45, tipo_de_sala: "Sala" as const },
    { semestre: 2, codigo: "TAD0103", nome: "BANCO DE DADOS", carga_horaria: 60, tipo_de_sala: "Lab" as const },
    { semestre: 2, codigo: "TAD0111", nome: "PROGRAMAÇÃO VISUAL E AUTORIA WEB", carga_horaria: 60, tipo_de_sala: "Lab" as const },
    { semestre: 2, codigo: "TAD0114", nome: "REDES DE COMPUTADORES", carga_horaria: 60, tipo_de_sala: "Lab" as const },

    { semestre: 3, codigo: "TAD0004", nome: "ANALISE E PROJETO ORIENTADO A OBJETOS", carga_horaria: 45, tipo_de_sala: "Sala" as const },
    { semestre: 3, codigo: "TAD0019", nome: "PROGRAMACAO WEB", carga_horaria: 60, tipo_de_sala: "Lab" as const },
    { semestre: 3, codigo: "TAD0020", nome: "ESTRUTURAS DE DADOS", carga_horaria: 60, tipo_de_sala: "Lab" as const },
    { semestre: 3, codigo: "TAD0022", nome: "ESTATISTICA APLICADA", carga_horaria: 45, tipo_de_sala: "Sala" as const },
    { semestre: 3, codigo: "TAD0025", nome: "INTELIGÊNCIA COMPUTACIONAL", carga_horaria: 60, tipo_de_sala: "Lab" as const },
    { semestre: 3, codigo: "TAD0123", nome: "SISTEMAS DIGITAIS", carga_horaria: 45, tipo_de_sala: "Lab" as const },
    { semestre: 3, codigo: "TAD0203", nome: "GESTÃO DE QUALIDADE DE SOFTWARE", carga_horaria: 45, tipo_de_sala: "Sala" as const },
  ];

  const disciplinasByCodigo = new Map<string, { id: string }>();
  for (const d of disciplinasBase) {
    const existente = await prisma.disciplina.findFirst({
      where: { codigo: d.codigo, id_curso: curso.id },
      select: { id: true },
    });

    const data = {
      codigo: d.codigo,
      nome: d.nome,
      carga_horaria: d.carga_horaria,
      total_aulas: totalAulasPorCargaHoraria(d.carga_horaria),
      tipo_de_sala: d.tipo_de_sala,
      semestre: d.semestre,
      id_curso: curso.id,
      obrigatoria: true,
      carga_horaria_atual: 0,
      aulas_ministradas: 0,
      periodo_letivo: periodoLetivo,
      data_inicio: dataInicio,
      data_fim_prevista: dataFimPrevista,
      data_fim_real: null,
      horario_consolidado: null,
    };

    const disciplina = existente
      ? await prisma.disciplina.update({ where: { id: existente.id }, data, select: { id: true } })
      : await prisma.disciplina.create({ data, select: { id: true } });

    disciplinasByCodigo.set(d.codigo, disciplina);
  }

  const cursoDisciplinaData = Array.from(disciplinasByCodigo.values()).map((d) => ({
    id_curso: curso.id,
    id_disciplina: d.id,
  }));

  await prisma.cursoDisciplina.createMany({
    data: cursoDisciplinaData,
    skipDuplicates: true,
  });

  const cursoDisciplinas = await prisma.cursoDisciplina.findMany({
    where: { id_curso: curso.id },
    select: { id: true, id_disciplina: true },
  });

  const cursoDisciplinaIdByDisciplinaId = new Map(
    cursoDisciplinas.map((cd) => [cd.id_disciplina, cd.id])
  );

  const turmaBase = [
    { nome: "TADS 2024", semestre: 1, num_alunos: 35, turno: "NOTURNO" },
    { nome: "TADS 2025", semestre: 2, num_alunos: 32, turno: "NOTURNO" },
    { nome: "TADS 2026", semestre: 3, num_alunos: 30, turno: "NOTURNO" },
  ] as const;

  const turmasByNome = new Map<string, { id: string }>();
  for (const t of turmaBase) {
    const existente = await prisma.turma.findFirst({
      where: { nome: t.nome, id_curso: curso.id },
      select: { id: true },
    });

    const turma = existente
      ? await prisma.turma.update({
          where: { id: existente.id },
          data: {
            num_alunos: t.num_alunos,
            turno: t.turno,
            semestre: t.semestre,
            ativa: true,
          },
          select: { id: true },
        })
      : await prisma.turma.create({
          data: {
            nome: t.nome,
            num_alunos: t.num_alunos,
            turno: t.turno,
            id_curso: curso.id,
            semestre: t.semestre,
            ativa: true,
          },
          select: { id: true },
        });

    turmasByNome.set(t.nome, turma);
  }

  const salasCriadas = await prisma.sala.findMany({
    where: { nome: { in: salasBase.map((s) => s.nome) } },
    select: { id: true, nome: true },
  });

  const salaIdByNome = new Map(salasCriadas.map((s) => [s.nome, s.id]));

  async function getHorarioId(dia_semana: string, codigo: string) {
    const horario = await prisma.horario.findFirst({
      where: { dia_semana, codigo, regime: "SUPERIOR" },
      select: { id: true },
    });
    if (!horario) {
      throw new Error(`horario nao encontrado: ${dia_semana} ${codigo}`);
    }
    return horario.id;
  }

  const professorDisciplinaMap: Record<string, string[]> = {
    "taniro@tads.edu.br": ["TAD0009", "TAD0111", "TAD0019"],
    "antonino@tads.edu.br": ["TAD0025", "TAD0022", "TAD0201"],
    "carla@tads.edu.br": ["TAD0103"],
    "tasia@tads.edu.br": ["TAD0105", "TAD0013", "TAD0202", "TAD0022"],
  };

  const professorDisciplinaData = Object.entries(professorDisciplinaMap)
    .flatMap(([email, codigos]) => {
      const user = usersByEmail.get(email);
      if (!user) return [];
      return codigos
        .map((codigo) => {
          const disciplina = disciplinasByCodigo.get(codigo);
          if (!disciplina) return null;
          return { id_user: user.id, id_disciplina: disciplina.id, ativo: true };
        })
        .filter((x): x is { id_user: string; id_disciplina: string; ativo: boolean } => Boolean(x));
    });

  if (professorDisciplinaData.length > 0) {
    await prisma.professorDisciplina.createMany({
      data: professorDisciplinaData,
      skipDuplicates: true,
    });
  }

  const alocacoes = [
    {
      userEmail: "taniro@tads.edu.br",
      turmaNome: "TADS 2024",
      disciplinaCodigo: "TAD0102",
      salaNome: "Lab 1",
      dia_semana: "SEGUNDA",
      horarioCodigo: "N1",
    },
    {
      userEmail: "tasia@tads.edu.br",
      turmaNome: "TADS 2024",
      disciplinaCodigo: "TAD0105",
      salaNome: "Sala 1",
      dia_semana: "TERCA",
      horarioCodigo: "N1",
    },
    {
      userEmail: "tasia@tads.edu.br",
      turmaNome: "TADS 2024",
      disciplinaCodigo: "TAD0202",
      salaNome: "Sala 2",
      dia_semana: "QUARTA",
      horarioCodigo: "N1",
    },
    {
      userEmail: "carla@tads.edu.br",
      turmaNome: "TADS 2025",
      disciplinaCodigo: "TAD0103",
      salaNome: "Lab 2",
      dia_semana: "SEGUNDA",
      horarioCodigo: "N2",
    },
    {
      userEmail: "taniro@tads.edu.br",
      turmaNome: "TADS 2025",
      disciplinaCodigo: "TAD0009",
      salaNome: "Lab 1",
      dia_semana: "TERCA",
      horarioCodigo: "N2",
    },
    {
      userEmail: "tasia@tads.edu.br",
      turmaNome: "TADS 2025",
      disciplinaCodigo: "TAD0013",
      salaNome: "Sala 1",
      dia_semana: "QUARTA",
      horarioCodigo: "N2",
    },
    {
      userEmail: "taniro@tads.edu.br",
      turmaNome: "TADS 2026",
      disciplinaCodigo: "TAD0019",
      salaNome: "Lab 1",
      dia_semana: "QUINTA",
      horarioCodigo: "N1",
    },
    {
      userEmail: "antonino@tads.edu.br",
      turmaNome: "TADS 2026",
      disciplinaCodigo: "TAD0025",
      salaNome: "Lab 2",
      dia_semana: "QUINTA",
      horarioCodigo: "N2",
    },
    {
      userEmail: "tasia@tads.edu.br",
      turmaNome: "TADS 2026",
      disciplinaCodigo: "TAD0022",
      salaNome: "Sala 2",
      dia_semana: "SEXTA",
      horarioCodigo: "N1",
    },
  ];

  const alocacaoData = [];
  const horarioConsolidadoByDisciplinaId = new Map<string, Set<string>>();
  const diaNumero: Record<string, string> = {
    DOMINGO: "1",
    SEGUNDA: "2",
    TERCA: "3",
    QUARTA: "4",
    QUINTA: "5",
    SEXTA: "6",
    SABADO: "7",
  };
  for (const a of alocacoes) {
    const user = usersByEmail.get(a.userEmail);
    const turma = turmasByNome.get(a.turmaNome);
    const disciplina = disciplinasByCodigo.get(a.disciplinaCodigo);
    const salaId = salaIdByNome.get(a.salaNome);
    if (!user || !turma || !disciplina || !salaId) continue;
    const horarioId = await getHorarioId(a.dia_semana, a.horarioCodigo);
    const cursoDisciplinaId = cursoDisciplinaIdByDisciplinaId.get(disciplina.id);
    if (!cursoDisciplinaId) continue;

    const turno = a.horarioCodigo.slice(0, 1);
    const numero = a.horarioCodigo.slice(1);
    const dia = diaNumero[a.dia_semana];
    if (dia && numero) {
      const set = horarioConsolidadoByDisciplinaId.get(disciplina.id) ?? new Set<string>();
      set.add(`${dia}${turno}${numero}`);
      horarioConsolidadoByDisciplinaId.set(disciplina.id, set);
    }

    alocacaoData.push({
      id_user: user.id,
      id_disciplina: disciplina.id,
      id_turma: turma.id,
      id_sala: salaId,
      id_horario: horarioId,
      id_curso_disciplina: cursoDisciplinaId,
      periodoId: periodo.id,
      is_modulo_principal: true,
    });
  }

  if (alocacaoData.length > 0) {
    await prisma.alocacao.createMany({
      data: alocacaoData,
      skipDuplicates: true,
    });
  }

  for (const [disciplinaId, set] of horarioConsolidadoByDisciplinaId.entries()) {
    const horario_consolidado = Array.from(set).sort().join(", ");

    const disciplina = await prisma.disciplina.findUnique({
      where: { id: disciplinaId },
      select: { data_inicio: true, total_aulas: true },
    });

    const data_fim_prevista_calculada =
      disciplina?.data_inicio && disciplina.total_aulas > 0
        ? calcularUltimoDiaAula(
            horario_consolidado,
            disciplina.data_inicio,
            disciplina.total_aulas,
          )
        : null;

    await prisma.disciplina.update({
      where: { id: disciplinaId },
      data: {
        horario_consolidado,
        ...(data_fim_prevista_calculada ? { data_fim_prevista: data_fim_prevista_calculada } : {}),
      },
    });
  }

  const totalDisciplinas = await prisma.disciplina.count({ where: { id_curso: curso.id } });
  const totalUsuarios = await prisma.user.count();
  const totalSalas = await prisma.sala.count({ where: { nome: { in: salasBase.map((s) => s.nome) } } });
  const totalTurmas = await prisma.turma.count({ where: { id_curso: curso.id } });
  const totalHorarios = await prisma.horario.count({ where: { regime: "SUPERIOR" } });
  const totalAlocacoes = await prisma.alocacao.count();

  console.log("seed concluído");
  console.log(`curso: ${curso.codigo}`);
  console.log(`salas: ${totalSalas}`);
  console.log(`usuarios: ${totalUsuarios}`);
  console.log(`disciplinas: ${totalDisciplinas}`);
  console.log(`turmas: ${totalTurmas}`);
  console.log(`horarios: ${totalHorarios}`);
  console.log(`alocacoes: ${totalAlocacoes}`);
}

seed()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
