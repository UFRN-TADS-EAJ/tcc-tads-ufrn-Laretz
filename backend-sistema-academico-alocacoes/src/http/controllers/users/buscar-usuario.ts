import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeBuscarUsuarioUseCase } from "@/use-cases/@factories/usuario/make-buscar-usuario-use-case";

export async function buscarUsuario(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const buscarUsuarioParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = buscarUsuarioParamsSchema.parse(request.params);

  try {
    const buscarUsuarioUseCase = makeBuscarUsuarioUseCase();

    const { usuario } = await buscarUsuarioUseCase.execute({ id });

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

    throw error;
  }
}
