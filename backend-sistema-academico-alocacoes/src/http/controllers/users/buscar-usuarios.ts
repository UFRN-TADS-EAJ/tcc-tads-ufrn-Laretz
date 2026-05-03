import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeBuscarUsuariosUseCase } from "@/use-cases/@factories/usuario/make-buscar-usuarios-use-case";

export async function buscarUsuarios(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const buscarUsuariosQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    search: z.string().optional(),
  });

  const { page, search } = buscarUsuariosQuerySchema.parse(request.query);

  try {
    const buscarUsuariosUseCase = makeBuscarUsuariosUseCase();

    const { usuarios } = await buscarUsuariosUseCase.execute({
      page,
      search,
    });

    return reply.status(200).send({ usuarios });
  } catch (error) {
    throw error;
  }
}
