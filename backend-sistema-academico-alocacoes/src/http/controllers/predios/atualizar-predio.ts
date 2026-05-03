import { FastifyReply, FastifyRequest } from "fastify";
import { predioParamsSchema, updatePredioSchema } from "@/schemas/predio";
import { makeAtualizarPredioUseCase } from "@/use-cases/@factories/predio/make-atualizar-predio-use-case";
import { CodigoJaExisteError } from "@/use-cases/errors/codigo-ja-existe";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

export async function atualizarPredio(request: FastifyRequest, reply: FastifyReply) {
  const { id } = predioParamsSchema.parse(request.params);
  const { codigo, nome, descricao } = updatePredioSchema.parse(request.body);

  try {
    const atualizarPredioUseCase = makeAtualizarPredioUseCase();

    const payload: {
      id: string;
      codigo?: string;
      nome?: string;
      descricao?: string;
    } = { id };
    if (codigo !== undefined) payload.codigo = codigo;
    if (nome !== undefined) payload.nome = nome;
    if (descricao !== undefined) payload.descricao = descricao;

    const { predio } = await atualizarPredioUseCase.execute(payload);

    return reply.status(200).send({ predio });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof CodigoJaExisteError) {
      return reply.status(400).send({ message: error.message });
    }

    throw error;
  }
}
