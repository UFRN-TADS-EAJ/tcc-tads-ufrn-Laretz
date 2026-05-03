import { hash } from "bcryptjs";
import { UsersRepository } from "../../repositories/users-repository";
import { UserJaExisteError } from "../errors/email-ja-existe";
import { User, Role, Prisma } from "@prisma/client";

interface RegisterUseCaseRequest {
  nome: string;
  email: string;
  senha: string;
  role: Role | undefined;
  especializacao: string | undefined;
  carga_horaria_max: number | undefined;
  preferencia: string | undefined;
}

interface RegisterUseCaseResponse {
  user: User;
}

export class RegisterUseCase {
  constructor(private UserRepository: UsersRepository) {}

  async execute({
    nome,
    email,
    senha,
    role,
    especializacao,
    carga_horaria_max,
    preferencia,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const senhaHash = await hash(senha, 6);

    const userwithSameEmail = await this.UserRepository.findByEmail(email);

    if (userwithSameEmail) {
      throw new UserJaExisteError();
    }

    const data: Prisma.UserCreateInput = {
      nome,
      email,
      senha: senhaHash,
      role: role ?? Role.PROFESSOR,
    };

    if (especializacao !== undefined) {
      data.especializacao = especializacao;
    }
    if (carga_horaria_max !== undefined) {
      data.carga_horaria_max = carga_horaria_max;
    }
    if (preferencia !== undefined) {
      data.preferencia = preferencia;
    }

    const user = await this.UserRepository.create(data);
    return { user };
  }
}
