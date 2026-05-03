import { Prisma, Alocacao } from "@prisma/client";

// Tipo para alocações com relacionamentos incluídos
export type AlocacaoWithRelations = Alocacao & {
  user: {
    id: string;
    nome: string;
    email: string;
    senha: string;
    role: any;
    especializacao: string | null;
    carga_horaria_max: number | null;
    preferencia: string | null;
  };
  disciplina: {
    id: string;
    nome: string;
    codigo: string | null;
    carga_horaria: number;
    carga_horaria_atual: number;
    total_aulas: number;
    aulas_ministradas: number;
    tipo_de_sala: any;
    data_inicio: Date | null;
    data_fim_prevista: Date | null;
    data_fim_real: Date | null;
    periodo_letivo: string | null;
    horario_consolidado: string | null;
    id_curso: string;
    semestre: number;
    obrigatoria: boolean;
  };
  cursoDisciplina?: {
    id: string;
    id_curso: string;
    id_disciplina: string;
  };
  turma: {
    id: string;
    nome: string;
    num_alunos: number;
    semestre: number;
    turno: string;
    id_curso: string;
    ativa: boolean;
  };
  sala: {
    id: string;
    nome: string;
    ativa: boolean;
    numero: string | null;
    capacidade: number;
    tipo: string;
    computadores: number;
    predioId: string | null;
    predio?: {
      id: string;
      nome: string;
      codigo: string;
      created_at: Date;
      updated_at: Date;
      descricao: string | null;
    } | null;
  };
  horario: {
    id: string;
    codigo: string;
    dia_semana: string;
    horario_inicio: Date;
    horario_fim: Date;
  };
};

export interface AlocacoesRepository {
  create(data: Prisma.AlocacaoCreateInput): Promise<Alocacao>;
  findById(id: string, periodoId: string): Promise<AlocacaoWithRelations | null>;
  findByUserIdAndHorarioId(
    id_user: string,
    id_horario: string,
    periodoId: string,
  ): Promise<Alocacao | null>;
  findBySalaIdAndHorarioId(
    id_sala: string,
    id_horario: string,
    periodoId: string,
  ): Promise<Alocacao | null>;
  findByTurmaIdAndHorarioId(
    id_turma: string,
    id_horario: string,
    periodoId: string,
  ): Promise<Alocacao | null>;
  findOverlapBySala(
    id_sala: string,
    dia_semana: string,
    inicio: Date,
    fim: Date,
    periodoId: string,
  ): Promise<Alocacao | null>;
  findOverlapByUser(
    id_user: string,
    dia_semana: string,
    inicio: Date,
    fim: Date,
    periodoId: string,
  ): Promise<Alocacao | null>;
  findOverlapByTurma(
    id_turma: string,
    dia_semana: string,
    inicio: Date,
    fim: Date,
    periodoId: string,
  ): Promise<Alocacao | null>;
  findMany(page: number, periodoId: string): Promise<AlocacaoWithRelations[]>;
  findByUserId(
    id_user: string,
    page: number,
    periodoId: string,
  ): Promise<AlocacaoWithRelations[]>;
  findByTurmaId(
    id_turma: string,
    page: number,
    periodoId: string,
  ): Promise<AlocacaoWithRelations[]>;
  findByTurma(turmaId: string, periodoId: string): Promise<AlocacaoWithRelations[]>;
  findAllByTurmaId(
    id_turma: string,
    periodoId: string,
  ): Promise<AlocacaoWithRelations[]>;
  findBySalaId(
    id_sala: string,
    page: number,
    periodoId: string,
  ): Promise<AlocacaoWithRelations[]>;
  findByDisciplinaId(
    id_disciplina: string,
    periodoId: string,
  ): Promise<AlocacaoWithRelations[]>;
  findByTurnoManha(page: number, periodoId: string): Promise<AlocacaoWithRelations[]>;
  findByTurmaIdWithTurno(
    id_turma: string,
    turno: string,
    page: number,
    periodoId: string,
  ): Promise<AlocacaoWithRelations[]>;
  deleteAllByTurmaId(id_turma: string, periodoId: string): Promise<void>;
  deleteAllByTurmaAndDisciplina(
    id_turma: string,
    id_disciplina: string,
    periodoId: string,
  ): Promise<void>;
  update(
    id: string,
    data: Prisma.AlocacaoUpdateInput,
    periodoId: string,
  ): Promise<Alocacao>;
  delete(id: string, periodoId: string): Promise<void>;
}
