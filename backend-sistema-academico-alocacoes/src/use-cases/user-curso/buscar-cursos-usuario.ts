import { UserCursoRepository } from "@/repositories/user-curso-repository";
import { UsersRepository } from "@/repositories/users-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarCursosUsuarioUseCaseRequest {
  id_user: string;
}

interface BuscarCursosUsuarioUseCaseResponse {
  cursos: Array<{
    id: string;
    codigo: string;
    nome: string;
    turno: string;
    duracao_semestres: number;
    vinculo: {
      id: string;
      ativo: boolean;
      created_at: Date;
    };
  }>;
}

export class BuscarCursosUsuarioUseCase {
  constructor(
    private userCursoRepository: UserCursoRepository,
    private usuarioRepository: UsersRepository
  ) {}

  async execute({
    id_user,
  }: BuscarCursosUsuarioUseCaseRequest): Promise<BuscarCursosUsuarioUseCaseResponse> {
    // Verificar se o usuário existe
    const usuario = await this.usuarioRepository.findById(id_user);
    if (!usuario) {
      throw new RecursoNaoEncontradoError();
    }

    // Buscar cursos do usuário
    const cursos = await this.userCursoRepository.findCursosByUser(id_user);

    return { cursos };
  }
}
