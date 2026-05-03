import { TurmasRepository } from "../../repositories/turmas-repository";

interface CriarTurmaUseCaseRequest {
  nome: string;
  num_alunos: number;
  turno: string;
  id_curso: string;
  semestre?: number;
  ativa?: boolean;
}

export class CriarTurmaUseCase {
  constructor(private turmasRepository: TurmasRepository) {}

  async execute({
    nome,
    num_alunos,
    turno,
    id_curso,
    semestre,
    ativa,
  }: CriarTurmaUseCaseRequest) {
    // Aplicar valores padrão (regras de negócio)
    const ativaDefault = ativa ?? true;

    const turma = await this.turmasRepository.create({
      nome,
      num_alunos,
      turno,
      semestre: semestre ?? 1,
      ativa: ativaDefault,
      curso: {
        connect: {
          id: id_curso,
        },
      },
    });

    return { turma };
  }
}
