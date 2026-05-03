import { UserCursoRepository } from "@/repositories/user-curso-repository";
import { CursosRepository } from "@/repositories/cursos-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface BuscarUsuariosCursoUseCaseRequest {
  id_curso: string;
}

interface BuscarUsuariosCursoUseCaseResponse {
  usuarios: Array<{
    id: string;
    nome: string;
    email: string;
    role: string;
    especializacao: string | null;
    carga_horaria_max: number | null;
    preferencia: string | null;
    vinculo: {
      id: string;
      ativo: boolean;
      created_at: Date;
    };
  }>;
}

export class BuscarUsuariosCursoUseCase {
  constructor(
    private userCursoRepository: UserCursoRepository,
    private cursosRepository: CursosRepository
  ) {}

  async execute({
    id_curso,
  }: BuscarUsuariosCursoUseCaseRequest): Promise<BuscarUsuariosCursoUseCaseResponse> {
    // Verificar se o curso existe
    const curso = await this.cursosRepository.findById(id_curso);
    if (!curso) {
      throw new RecursoNaoEncontradoError();
    }

    // Buscar usuários do curso
    const usuarios =
      await this.userCursoRepository.findUsuariosByCurso(id_curso);

    return { usuarios };
  }
}
