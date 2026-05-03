import { ProfessorDisciplinaRepository } from "@/repositories/professor-disciplina-repository";
import { DisciplinasRepository } from "@/repositories/disciplinas-repository";
import { UsersRepository } from "@/repositories/users-repository";
import type { DisciplinasProfessorResponse } from "@/schemas/professor-disciplina";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarDisciplinasProfessorUseCaseRequest {
  id_user: string;
}

export class BuscarDisciplinasProfessorUseCase {
  constructor(
    private professorDisciplinaRepository: ProfessorDisciplinaRepository,
    private disciplinasRepository: DisciplinasRepository,
    private usuarioRepository: UsersRepository
  ) {}

  async execute({
    id_user,
  }: BuscarDisciplinasProfessorUseCaseRequest): Promise<DisciplinasProfessorResponse> {
    // Verificar se o usuário existe
    const usuario = await this.usuarioRepository.findById(id_user);
    if (!usuario) {
      throw new RecursoNaoEncontradoError();
    }

    // Buscar disciplinas do professor
    const disciplinas =
      await this.professorDisciplinaRepository.findDisciplinasByUser(id_user);

    return {
      disciplinas: disciplinas.map((d: any) => ({
        id: String(d.id),
        nome: String(d.nome),
        carga_horaria: Number(d.carga_horaria ?? 0),
        total_aulas: Number(d.total_aulas ?? 0),
        carga_horaria_atual: Number(d.carga_horaria_atual ?? 0),
        tipo_de_sala: d.tipo_de_sala === "Lab" ? "Lab" : "Sala",
        codigo: d.codigo ?? null,
        semestre: Number(d.semestre ?? 0),
        obrigatoria: Boolean(d.obrigatoria ?? true),
        curso: {
          id: String(d.curso?.id || ""),
          nome: String(d.curso?.nome || ""),
          codigo: String(d.curso?.codigo || ""),
        },
        vinculo: {
          id: String(d.vinculo?.id || ""),
          ativo: Boolean(d.vinculo?.ativo ?? true),
          created_at:
            d.vinculo?.created_at instanceof Date
              ? d.vinculo.created_at.toISOString()
              : String(d.vinculo?.created_at || ""),
        },
      })),
    };
  }
}
