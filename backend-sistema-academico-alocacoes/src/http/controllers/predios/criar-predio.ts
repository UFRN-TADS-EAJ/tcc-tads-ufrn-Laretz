import { FastifyReply, FastifyRequest } from "fastify";
import { createPredioSchema } from "@/schemas/predio";
import { makeCriarPredioUseCase } from "@/use-cases/@factories/predio/make-criar-predio-use-case";
import { CodigoJaExisteError } from "@/use-cases/errors/codigo-ja-existe";

export async function criarPredio(request: FastifyRequest, reply: FastifyReply) {
  const { codigo, nome, descricao } = createPredioSchema.parse(request.body);

  try {
    const criarPredioUseCase = makeCriarPredioUseCase();

    const payload: { codigo: string; nome: string; descricao?: string } = {
      codigo,
      nome,
    };
    if (descricao !== undefined) {
      payload.descricao = descricao;
    }

    const { predio } = await criarPredioUseCase.execute(payload);

    return reply.status(201).send({ predio });
  } catch (error) {
    if (error instanceof CodigoJaExisteError) {
      return reply.status(400).send({ message: error.message });
    }

    throw error;
  }
}
