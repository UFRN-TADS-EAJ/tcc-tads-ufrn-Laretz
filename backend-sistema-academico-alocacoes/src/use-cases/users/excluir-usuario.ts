import { UsersRepository } from "@/repositories/users-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface ExcluirUsuarioUseCaseRequest {
  id: string;
}

export class ExcluirUsuarioUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ id }: ExcluirUsuarioUseCaseRequest): Promise<void> {
    const usuario = await this.usersRepository.findById(id);

    if (!usuario) {
      throw new RecursoNaoEncontradoError();
    }

    await this.usersRepository.delete(id);
  }
}
