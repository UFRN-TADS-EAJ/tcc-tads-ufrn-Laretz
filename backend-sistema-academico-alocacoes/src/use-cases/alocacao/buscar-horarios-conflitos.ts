import { AlocacoesRepository } from "@/repositories/alocacoes-repository";
import { HorariosRepository } from "@/repositories/horarios-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";
import type {
  HorariosConflitosQueryRequest,
  HorariosConflitosResponse,
} from "@/schemas";
import type { RegimeHorario } from "@prisma/client";

export class BuscarHorariosConflitosUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private horariosRepository: HorariosRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute({
    id_turma,
    id_user,
    id_sala,
    periodoId,
    regime,
  }: HorariosConflitosQueryRequest): Promise<HorariosConflitosResponse> {
    const periodo = periodoId
      ? await this.periodosRepository.findById(periodoId)
      : await this.periodosRepository.findActive();

    if (!periodo) {
      throw new Error(
        periodoId
          ? "Periodo not found"
          : "Nenhum período letivo ativo encontrado",
      );
    }

    const fetchAllPages = async <T>(
      fetcher: (page: number) => Promise<T[]>,
      opts?: { pageSize?: number; maxPages?: number },
    ): Promise<T[]> => {
      const pageSize = opts?.pageSize ?? 20;
      const maxPages = opts?.maxPages ?? 50;
      const all: T[] = [];

      for (let page = 1; page <= maxPages; page++) {
        const chunk = await fetcher(page);
        all.push(...chunk);
        if (chunk.length < pageSize) break;
      }

      return all;
    };

    const horariosSobrepoem = (
      aInicio: Date,
      aFim: Date,
      bInicio: Date,
      bFim: Date,
    ) => {
      return aInicio.getTime() < bFim.getTime() && bInicio.getTime() < aFim.getTime();
    };

    const horarios = await this.horariosRepository.findMany(
      undefined,
      regime as RegimeHorario | undefined,
    );

    if (!id_turma && !id_user && !id_sala) {
      return { conflitos: {} };
    }

    const [alocacoesTurma, alocacoesProfessor, alocacoesSala] =
      await Promise.all([
        id_turma
          ? this.alocacoesRepository.findAllByTurmaId(id_turma, periodo.id)
          : Promise.resolve([]),
        id_user
          ? fetchAllPages((page) =>
              this.alocacoesRepository.findByUserId(id_user, page, periodo.id),
            )
          : Promise.resolve([]),
        id_sala
          ? fetchAllPages((page) =>
              this.alocacoesRepository.findBySalaId(id_sala, page, periodo.id),
            )
          : Promise.resolve([]),
      ]);

    const conflitos: HorariosConflitosResponse["conflitos"] = {};

    horarios.forEach((horario) => {
      const temProfessor = !!id_user;
      const temSala = !!id_sala;
      const temTurma = !!id_turma;

      let conflitaProfessor = false;
      let conflitaSala = false;
      let conflitaTurma = false;

      if (temProfessor) {
        conflitaProfessor = alocacoesProfessor.some((alocacao: any) => {
          const horarioDaAlocacao = alocacao?.horario;
          if (!horarioDaAlocacao) return false;
          if (String(horarioDaAlocacao.dia_semana || "") !== String(horario.dia_semana || "")) return false;
          return horariosSobrepoem(
            horarioDaAlocacao.horario_inicio,
            horarioDaAlocacao.horario_fim,
            horario.horario_inicio,
            horario.horario_fim,
          );
        });
      }

      if (temTurma) {
        conflitaTurma = alocacoesTurma.some((alocacao: any) => {
          const horarioDaAlocacao = alocacao?.horario;
          if (!horarioDaAlocacao) return false;
          if (String(horarioDaAlocacao.dia_semana || "") !== String(horario.dia_semana || "")) return false;
          return horariosSobrepoem(
            horarioDaAlocacao.horario_inicio,
            horarioDaAlocacao.horario_fim,
            horario.horario_inicio,
            horario.horario_fim,
          );
        });
      }

      if (temSala) {
        conflitaSala = alocacoesSala.some((alocacao: any) => {
          const horarioDaAlocacao = alocacao?.horario;
          if (!horarioDaAlocacao) return false;
          if (String(horarioDaAlocacao.dia_semana || "") !== String(horario.dia_semana || "")) return false;
          return horariosSobrepoem(
            horarioDaAlocacao.horario_inicio,
            horarioDaAlocacao.horario_fim,
            horario.horario_inicio,
            horario.horario_fim,
          );
        });
      }

      if (!conflitaProfessor && !conflitaSala && !conflitaTurma) return;

      const horarioId = String(horario.id);

      if (conflitaProfessor && conflitaSala && conflitaTurma) {
        conflitos[horarioId] = "todos";
        return;
      }
      if (conflitaProfessor && conflitaSala) {
        conflitos[horarioId] = "professor_sala";
        return;
      }
      if (conflitaProfessor && conflitaTurma) {
        conflitos[horarioId] = "professor_turma";
        return;
      }
      if (conflitaSala && conflitaTurma) {
        conflitos[horarioId] = "sala_turma";
        return;
      }
      if (conflitaProfessor) {
        conflitos[horarioId] = "professor";
        return;
      }
      if (conflitaSala) {
        conflitos[horarioId] = "sala";
        return;
      }
      conflitos[horarioId] = "turma";
    });

    return { conflitos };
  }
}
