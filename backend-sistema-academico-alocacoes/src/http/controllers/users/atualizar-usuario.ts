import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { Role } from "@prisma/client";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { UserJaExisteError } from "../../../use-cases/errors/email-ja-existe";
import { makeAtualizarUsuarioUseCase } from "@/use-cases/@factories/usuario/make-atualizar-usuario-use-case";

export async function atualizarUsuario(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const atualizarUsuarioParamsSchema = z.object({
    id: z.uuid(),
  });

  const atualizarUsuarioBodySchema = z.object({
    nome: z.string().optional(),
    email: z.string().email().optional(),
    senha: z.string().min(6).optional(),
    role: z.enum(Role).optional(),
    especializacao: z.string().optional(),
    carga_horaria_max: z.number().optional(),
    preferencia: z.string().optional(),
  });

  const { id } = atualizarUsuarioParamsSchema.parse(request.params);
  const updateData = atualizarUsuarioBodySchema.parse(request.body);

  try {
    const atualizarUsuarioUseCase = makeAtualizarUsuarioUseCase();

    const { usuario } = await atualizarUsuarioUseCase.execute({
      id,
      ...updateData,
    });

    return reply.status(200).send({
      usuario: {
        ...usuario,
        senha: undefined, // Remove senha da resposta
      },
    });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof UserJaExisteError) {
      return reply.status(409).send({ message: error.message });
    }

    throw error;
  }
}
