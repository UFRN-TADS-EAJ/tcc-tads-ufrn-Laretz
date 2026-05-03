import { ProfessorDisciplinaRepository } from "@/repositories/professor-disciplina-repository";
import { UsersRepository } from "@/repositories/users-repository";
import { DisciplinasRepository } from "@/repositories/disciplinas-repository";
import type { ProfessorDisciplinaResponse } from "@/schemas/professor-disciplina";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface VincularProfessorDisciplinaUseCaseRequest {
  id_user: string;
  id_disciplina: string;
}
interface VincularProfessorDisciplinaUseCaseResponse {
  professorDisciplina: ProfessorDisciplinaResponse;
}

export class VincularProfessorDisciplinaUseCase {
  constructor(
    private professorDisciplinaRepository: ProfessorDisciplinaRepository,
    private usuarioRepository: UsersRepository,
    private disciplinasRepository: DisciplinasRepository
  ) {}

  async execute({
    id_user,
    id_disciplina,
  }: VincularProfessorDisciplinaUseCaseRequest): Promise<VincularProfessorDisciplinaUseCaseResponse> {
    // Verificar se o usuário existe
    const usuario = await this.usuarioRepository.findById(id_user);
    if (!usuario) {
      throw new RecursoNaoEncontradoError();
    }

    // Verificar se a disciplina existe
    const disciplina = await this.disciplinasRepository.findById(id_disciplina);
    if (!disciplina) {
      throw new RecursoNaoEncontradoError();
    }

    // Verificar se o vínculo já existe
    const vinculoExistente =
      await this.professorDisciplinaRepository.findByUserAndDisciplina(
        id_user,
        id_disciplina
      );

    if (vinculoExistente) {
      // Se existe mas está inativo, reativar
      if (!vinculoExistente.ativo) {
        const professorDisciplina =
          await this.professorDisciplinaRepository.update(vinculoExistente.id, {
            ativo: true,
          });
        return {
          professorDisciplina: {
            id: String(professorDisciplina.id),
            id_user: String(professorDisciplina.id_user),
            id_disciplina: String(professorDisciplina.id_disciplina),
            ativo: Boolean(professorDisciplina.ativo),
            created_at:
              professorDisciplina.created_at instanceof Date
                ? professorDisciplina.created_at.toISOString()
                : String(professorDisciplina.created_at),
            updated_at:
              professorDisciplina.updated_at instanceof Date
                ? professorDisciplina.updated_at.toISOString()
                : String(professorDisciplina.updated_at),
          },
        };
      }
      // Se já existe e está ativo, retornar o existente
      return {
        professorDisciplina: {
          id: String(vinculoExistente.id),
          id_user: String(vinculoExistente.id_user),
          id_disciplina: String(vinculoExistente.id_disciplina),
          ativo: Boolean(vinculoExistente.ativo),
          created_at:
            vinculoExistente.created_at instanceof Date
              ? vinculoExistente.created_at.toISOString()
              : String(vinculoExistente.created_at),
          updated_at:
            vinculoExistente.updated_at instanceof Date
              ? vinculoExistente.updated_at.toISOString()
              : String(vinculoExistente.updated_at),
        },
      };
    }

    // Criar novo vínculo
    const professorDisciplina = await this.professorDisciplinaRepository.create(
      {
        user: {
          connect: { id: id_user }
        },
        disciplina: {
          connect: { id: id_disciplina }
        }
      }
    );

    return {
      professorDisciplina: {
        id: String(professorDisciplina.id),
        id_user: String(professorDisciplina.id_user),
        id_disciplina: String(professorDisciplina.id_disciplina),
        ativo: Boolean(professorDisciplina.ativo),
        created_at:
          professorDisciplina.created_at instanceof Date
            ? professorDisciplina.created_at.toISOString()
            : String(professorDisciplina.created_at),
        updated_at:
          professorDisciplina.updated_at instanceof Date
            ? professorDisciplina.updated_at.toISOString()
            : String(professorDisciplina.updated_at),
      },
    };
  }
}
