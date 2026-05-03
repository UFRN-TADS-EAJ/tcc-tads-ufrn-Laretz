import { User } from "@prisma/client";
import { UsersRepository } from "@/repositories/users-repository";

interface BuscarUsuariosUseCaseRequest {
  page: number;
  search?: string | undefined; // aceita explicitamente undefined
}

interface BuscarUsuariosUseCaseResponse {
  usuarios: User[];
}

export class BuscarUsuariosUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    page,
    search,
  }: BuscarUsuariosUseCaseRequest): Promise<BuscarUsuariosUseCaseResponse> {
    const usuarios = await this.usersRepository.findMany(page, search);

    if (!usuarios) {
      return {
        usuarios: [],
      };
    }

    return {
      usuarios,
    };
  }
}
