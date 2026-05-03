import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { PossuiDependenciasError } from "@/use-cases/errors/possui-dependencias";
import { makeExcluirUsuarioUseCase } from "@/use-cases/@factories/usuario/make-excluir-usuario-use-case";

export async function excluirUsuario(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const excluirUsuarioParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = excluirUsuarioParamsSchema.parse(request.params);

  try {
    const excluirUsuarioUseCase = makeExcluirUsuarioUseCase();

    await excluirUsuarioUseCase.execute({ id });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }
    const err = new PossuiDependenciasError("usuário");
    return reply.status(409).send({ error: "Conflict", message: err.message });
  }
}
