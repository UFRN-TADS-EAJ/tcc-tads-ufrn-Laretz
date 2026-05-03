import { User, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { UsersRepository } from "../../repositories/users-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";
import { UserJaExisteError } from "../errors/email-ja-existe";

interface AtualizarUsuarioUseCaseRequest {
  id: string;
  nome?: string | undefined;
  email?: string | undefined;
  senha?: string | undefined;
  role?: Role | undefined;
  especializacao?: string | undefined;
  carga_horaria_max?: number | undefined;
  preferencia?: string | undefined;
}

interface AtualizarUsuarioUseCaseResponse {
  usuario: User;
}

export class AtualizarUsuarioUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
    nome,
    email,
    senha,
    role,
    especializacao,
    carga_horaria_max,
    preferencia,
  }: AtualizarUsuarioUseCaseRequest): Promise<AtualizarUsuarioUseCaseResponse> {
    const usuario = await this.usersRepository.findById(id);

    if (!usuario) {
      throw new RecursoNaoEncontradoError();
    }

    // Verifica se o email já existe (se estiver sendo alterado)
    if (email && email !== usuario.email) {
      const usuarioComMesmoEmail =
        await this.usersRepository.findByEmail(email);
      if (usuarioComMesmoEmail) {
        throw new UserJaExisteError();
      }
    }

    // Prepara os dados para atualização
    const updateData: any = {};

    if (nome !== undefined) updateData.nome = nome;
    if (email !== undefined) updateData.email = email;
    if (senha !== undefined) updateData.senha = await hash(senha, 6);
    if (role !== undefined) updateData.role = role;
    if (especializacao !== undefined)
      updateData.especializacao = especializacao;
    if (carga_horaria_max !== undefined)
      updateData.carga_horaria_max = carga_horaria_max;
    if (preferencia !== undefined) updateData.preferencia = preferencia;

    const usuarioAtualizado = await this.usersRepository.update(id, updateData);

    return {
      usuario: usuarioAtualizado,
    };
  }
}
