import { FastifyReply, FastifyRequest } from "fastify";
import { predioQuerySchema } from "@/schemas/predio";
import { makeBuscarPrediosUseCase } from "@/use-cases/@factories/predio/make-buscar-predios-use-case";

export async function buscarPredios(request: FastifyRequest, reply: FastifyReply) {
  const { search, sortBy = "nome", sortOrder = "asc" } = predioQuerySchema.parse(
    request.query,
  );

  try {
    const buscarPrediosUseCase = makeBuscarPrediosUseCase();

    const payload: {
      search?: string;
      sortBy?: "nome" | "codigo" | "created_at" | "updated_at" | "descricao";
      sortOrder?: "asc" | "desc";
    } = { sortBy, sortOrder };
    if (search !== undefined) payload.search = search;

    const { predios } = await buscarPrediosUseCase.execute(payload);

    return reply.status(200).send({ predios });
  } catch (error) {
    throw error;
  }
}
