import { TurmasRepository } from "../../repositories/turmas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface AtualizarTurmaUseCaseRequest {
  id: string;
  nome?: string;
  num_alunos?: number;
  turno?: string;
  id_curso?: string;
  semestre?: number;
  ativa?: boolean;
}

export class AtualizarTurmaUseCase {
  constructor(private turmasRepository: TurmasRepository) {}

  async execute({
    id,
    nome,
    num_alunos,
    turno,
    id_curso,
    semestre,
    ativa,
  }: AtualizarTurmaUseCaseRequest) {
    const turmaExiste = await this.turmasRepository.findById(id);

    if (!turmaExiste) {
      throw new RecursoNaoEncontradoError();
    }

    // Cria um objeto com apenas os campos que foram fornecidos
    const updateData: Partial<{
      nome: string;
      num_alunos: number;
      turno: string;
      id_curso: string;
      semestre: number;
      ativa: boolean;
    }> = {};
    if (nome !== undefined) updateData.nome = nome;
    if (num_alunos !== undefined) updateData.num_alunos = num_alunos;
    if (turno !== undefined) updateData.turno = turno;
    if (id_curso !== undefined) updateData.id_curso = id_curso;
    if (semestre !== undefined) updateData.semestre = semestre;
    if (ativa !== undefined) updateData.ativa = ativa;

    const turma = await this.turmasRepository.update(id, updateData);

    return { turma };
  }
}
