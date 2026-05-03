import { UserCursoRepository } from "@/repositories/user-curso-repository";
import { UsersRepository } from "@/repositories/users-repository";
import { CursosRepository } from "@/repositories/cursos-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface VincularUserCursoUseCaseRequest {
  id_user: string;
  id_curso: string;
}

interface VincularUserCursoUseCaseResponse {
  userCurso: {
    id: string;
    id_user: string;
    id_curso: string;
    ativo: boolean;
    created_at: Date;
    updated_at: Date;
  };
}

export class VincularUserCursoUseCase {
  constructor(
    private userCursoRepository: UserCursoRepository,
    private usuarioRepository: UsersRepository,
    private cursosRepository: CursosRepository
  ) {}

  async execute({
    id_user,
    id_curso,
  }: VincularUserCursoUseCaseRequest): Promise<VincularUserCursoUseCaseResponse> {
    // Verificar se o usuário existe
    const usuario = await this.usuarioRepository.findById(id_user);
    if (!usuario) {
      throw new RecursoNaoEncontradoError();
    }

    // Verificar se o curso existe
    const curso = await this.cursosRepository.findById(id_curso);
    if (!curso) {
      throw new RecursoNaoEncontradoError();
    }

    // Verificar se o vínculo já existe
    const vinculoExistente = await this.userCursoRepository.findByUserAndCurso(
      id_user,
      id_curso
    );

    if (vinculoExistente) {
      // Se existe mas está inativo, reativar
      if (!vinculoExistente.ativo) {
        const userCurso = await this.userCursoRepository.update(
          vinculoExistente.id,
          {
            ativo: true,
          }
        );
        return { userCurso };
      }
      // Se já existe e está ativo, retornar o existente
      return { userCurso: vinculoExistente };
    }

    // Criar novo vínculo
    const userCurso = await this.userCursoRepository.create({
      user: {
        connect: { id: id_user },
      },
      curso: {
        connect: { id: id_curso },
      },
    });

    return { userCurso };
  }
}
