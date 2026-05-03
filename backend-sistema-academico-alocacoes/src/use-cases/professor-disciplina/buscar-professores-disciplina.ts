import { ProfessorDisciplinaRepository } from "@/repositories/professor-disciplina-repository";
import { DisciplinasRepository } from "@/repositories/disciplinas-repository";
import type { ProfessoresDisciplinaResponse } from "@/schemas/professor-disciplina";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarProfessoresDisciplinaUseCaseRequest {
  id_disciplina: string;
}

export class BuscarProfessoresDisciplinaUseCase {
  constructor(
    private professorDisciplinaRepository: ProfessorDisciplinaRepository,
    private disciplinasRepository: DisciplinasRepository
  ) {}

  async execute({
    id_disciplina,
  }: BuscarProfessoresDisciplinaUseCaseRequest): Promise<ProfessoresDisciplinaResponse> {
    // Verificar se a disciplina existe
    const disciplina = await this.disciplinasRepository.findById(id_disciplina);
    if (!disciplina) {
      throw new RecursoNaoEncontradoError();
    }

    // Buscar professores da disciplina
    const professores =
      await this.professorDisciplinaRepository.findProfessoresByDisciplina(
        id_disciplina
      );

    return {
      professores: professores.map((p: any) => ({
        id: String(p.id),
        nome: String(p.nome),
        email: String(p.email),
        especializacao: p.especializacao ?? null,
        carga_horaria_max:
          p.carga_horaria_max === null || p.carga_horaria_max === undefined
            ? null
            : Number(p.carga_horaria_max),
        preferencia: p.preferencia ?? null,
        vinculo: {
          id: String(p.vinculo?.id || ""),
          ativo: Boolean(p.vinculo?.ativo ?? true),
          created_at:
            p.vinculo?.created_at instanceof Date
              ? p.vinculo.created_at.toISOString()
              : String(p.vinculo?.created_at || ""),
        },
      })),
    };
  }
}
