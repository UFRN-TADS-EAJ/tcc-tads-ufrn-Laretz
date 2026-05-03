import type { AlocacoesRepository } from "@/repositories/alocacoes-repository";
import type { DisciplinasRepository } from "@/repositories/disciplinas-repository";
import type { HorariosRepository } from "@/repositories/horarios-repository";
import type { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";
import type { ProfessorDisciplinaRepository } from "@/repositories/professor-disciplina-repository";
import type { UserCursoRepository } from "@/repositories/user-curso-repository";
import type { UsersRepository } from "@/repositories/users-repository";
import { alocacaoResponseSchema } from "@/schemas/alocacao";
import type { GradeHorariosProfessorBootstrapResponse } from "@/schemas/user";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";
import { BuscarHorariosGradeConfigUseCase } from "../horario/buscar-horarios-grade-config";
import { BuscarDisciplinasProfessorUseCase } from "../professor-disciplina/buscar-disciplinas-professor";

interface BuscarGradeHorariosProfessorBootstrapUseCaseRequest {
  id_user: string;
}

export class BuscarGradeHorariosProfessorBootstrapUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private periodosRepository: PeriodosLetivosRepository,
    private alocacoesRepository: AlocacoesRepository,
    private userCursoRepository: UserCursoRepository,
    private professorDisciplinaRepository: ProfessorDisciplinaRepository,
    private disciplinasRepository: DisciplinasRepository,
    private horariosRepository: HorariosRepository,
  ) {}

  async execute({
    id_user,
  }: BuscarGradeHorariosProfessorBootstrapUseCaseRequest): Promise<GradeHorariosProfessorBootstrapResponse> {
    const usuario = await this.usersRepository.findById(id_user);
    if (!usuario) throw new RecursoNaoEncontradoError();

    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    const alocacoes = await this.alocacoesRepository.findByUserId(
      id_user,
      1,
      periodoAtivo.id,
    );
    const alocacoesParsed = alocacaoResponseSchema.array().parse(alocacoes);

    const cursosRaw = await this.userCursoRepository.findCursosByUser(id_user);
    const cursos = cursosRaw.map((c) => ({
      id: String(c.id),
      codigo: String(c.codigo),
      nome: String(c.nome),
      turno: c.turno as "MATUTINO" | "VESPERTINO" | "NOTURNO" | "INTEGRAL",
      duracao_semestres: Number(c.duracao_semestres ?? 0),
      vinculo: {
        id: String(c.vinculo?.id || ""),
        ativo: Boolean(c.vinculo?.ativo ?? true),
        created_at:
          c.vinculo?.created_at instanceof Date
            ? c.vinculo.created_at.toISOString()
            : String(c.vinculo?.created_at || ""),
      },
    }));

    const buscarDisciplinasProfessorUseCase = new BuscarDisciplinasProfessorUseCase(
      this.professorDisciplinaRepository,
      this.disciplinasRepository,
      this.usersRepository,
    );
    const { disciplinas } = await buscarDisciplinasProfessorUseCase.execute({
      id_user,
    });

    const buscarGradeConfigUseCase = new BuscarHorariosGradeConfigUseCase(
      this.horariosRepository,
    );
    const gradeConfig = await buscarGradeConfigUseCase.execute({
      regime: "SUPERIOR",
    });

    const horarios = (await this.horariosRepository.findMany(undefined, "SUPERIOR")).map(
      (h) => ({
        id: String(h.id),
        codigo: String(h.codigo),
        dia_semana: String(h.dia_semana),
        horario_inicio:
          h.horario_inicio instanceof Date
            ? h.horario_inicio.toISOString()
            : String(h.horario_inicio),
        horario_fim:
          h.horario_fim instanceof Date ? h.horario_fim.toISOString() : String(h.horario_fim),
        regime: h.regime as any,
      }),
    );

    return {
      professor: {
        id: String(usuario.id),
        nome: String(usuario.nome),
        email: String(usuario.email),
        role: usuario.role,
        especializacao: usuario.especializacao ?? null,
        carga_horaria_max: usuario.carga_horaria_max ?? null,
        preferencia: usuario.preferencia ?? null,
      },
      alocacoes: alocacoesParsed,
      cursos,
      disciplinas,
      gradeConfig,
      horarios,
    };
  }
}
