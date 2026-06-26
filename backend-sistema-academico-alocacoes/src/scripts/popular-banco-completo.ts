import { PeriodoStatus, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function dateOnlyUTC(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}


type SeedSala = {
  nome: string;
  numero?: string;
  tipo: "Lab" | "Sala";
  computadores: number;
  capacidade: number;
  predioCodigo: string;
};

const PREDIOS = [
  {
    codigo: "PREDIO-INFORMATICA",
    nome: "Prédio da Informática",
    descricao: "Infraestrutura principal de laboratórios e salas do TADS.",
  },
  {
    codigo: "SETOR-AULAS-GRADUACAO",
    nome: "Setor de Aulas da Graduação",
    descricao: "Bloco de salas de aula utilizado pela graduação.",
  },
] as const;

const SALAS: SeedSala[] = [
  {
    nome: "Laboratório de Microcomputadores 1",
    tipo: "Lab",
    computadores: 40,
    capacidade: 48,
    predioCodigo: "PREDIO-INFORMATICA",
  },
  {
    nome: "Laboratório de Microcomputadores 2",
    tipo: "Lab",
    computadores: 20,
    capacidade: 21,
    predioCodigo: "PREDIO-INFORMATICA",
  },
  {
    nome: "Laboratório de Microcomputadores 3",
    tipo: "Lab",
    computadores: 20,
    capacidade: 21,
    predioCodigo: "PREDIO-INFORMATICA",
  },
  {
    nome: "Laboratório de Microcomputadores 4",
    tipo: "Lab",
    computadores: 40,
    capacidade: 44,
    predioCodigo: "PREDIO-INFORMATICA",
  },
  {
    nome: "Laboratório de Informática",
    tipo: "Lab",
    computadores: 40,
    capacidade: 40,
    predioCodigo: "SETOR-AULAS-GRADUACAO",
  },
  {
    nome: "Laboratório de Sistemas Embarcados e Eletrônica",
    tipo: "Lab",
    computadores: 40,
    capacidade: 16,
    predioCodigo: "PREDIO-INFORMATICA",
  },
  {
    nome: "Laboratório de Redes de Computadores",
    tipo: "Lab",
    computadores: 0,
    capacidade: 15,
    predioCodigo: "PREDIO-INFORMATICA",
  },
  {
    nome: "Sala de Aula Teórica",
    tipo: "Sala",
    computadores: 0,
    capacidade: 44,
    predioCodigo: "PREDIO-INFORMATICA",
  },
  ...Array.from({ length: 10 }, (_, index) => ({
    nome: `Sala de Aula ${index + 1}`,
    numero: `${index + 1}`,
    tipo: "Sala" as const,
    computadores: 0,
    capacidade: 40,
    predioCodigo: "SETOR-AULAS-GRADUACAO",
  })),
];

async function upsertSala(sala: SeedSala, predioId: string) {
  const existente = await prisma.sala.findFirst({
    where: {
      nome: sala.nome,
      predioId,
    },
    select: { id: true },
  });

  const data = {
    nome: sala.nome,
    numero: sala.numero ?? null,
    tipo: sala.tipo,
    computadores: sala.computadores,
    capacidade: sala.capacidade,
    predioId,
    ativa: true,
  };

  if (existente) {
    await prisma.sala.update({
      where: { id: existente.id },
      data,
    });
    return;
  }

  await prisma.sala.create({ data });
}

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
      status: "ATIVO",
    },
    update: {
      data_inicio: dataInicio,
      data_fim: dataFimPrevista,
      ativo: true,
      status: "ATIVO",
    },
    select: { id: true },
  });

  await prisma.periodoLetivo.updateMany({
    where: { id: { not: periodo.id }, ativo: true },
    data: { ativo: false, status: PeriodoStatus.ENCERRADO },
  });

  const adminEmail = "admin@admin.com";
  const senhaAdmin = await hash("123123", 6);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      nome: "admin",
      email: adminEmail,
      senha: senhaAdmin,
      role: "ADMIN",
      especializacao: "administração do sistema",
      carga_horaria_max: null,
      preferencia: null,
    },
    update: {
      nome: "admin",
      senha: senhaAdmin,
      role: "ADMIN",
      especializacao: "administração do sistema",
      carga_horaria_max: null,
      preferencia: null,
    },
  });

  const predioIdByCodigo = new Map<string, string>();

  for (const predio of PREDIOS) {
    const saved = await prisma.predio.upsert({
      where: { codigo: predio.codigo },
      create: predio,
      update: {
        nome: predio.nome,
        descricao: predio.descricao,
      },
      select: { id: true },
    });

    predioIdByCodigo.set(predio.codigo, saved.id);
  }

  for (const sala of SALAS) {
    const predioId = predioIdByCodigo.get(sala.predioCodigo);
    if (!predioId) {
      throw new Error(`Prédio não encontrado para a sala ${sala.nome}: ${sala.predioCodigo}`);
    }

    await upsertSala(sala, predioId);
  }

  console.log("Seed concluído com sucesso.");
  console.log("Admin: admin@admin.com / 123123");
  console.log(`Período letivo ativo: ${periodoLetivo}`);
  console.log(`Prédios criados/atualizados: ${PREDIOS.length}`);
  console.log(`Salas criadas/atualizadas: ${SALAS.length}`);
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
