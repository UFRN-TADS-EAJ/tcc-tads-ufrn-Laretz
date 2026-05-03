import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeExcluirSalaUseCase } from "@/use-cases/@factories/sala/make-excluir-sala-use-case";

export async function excluirSala(request: FastifyRequest, reply: FastifyReply) {
    const excluirSalaParamsSchema = z.object({
        id: z.string().uuid(),
    });

    const { id } = excluirSalaParamsSchema.parse(request.params);

    try {
        const excluirSalaUseCase = makeExcluirSalaUseCase();

        await excluirSalaUseCase.execute({
            id,
        });

        return reply.status(204).send();
    } catch (error) {
        if (error instanceof RecursoNaoEncontradoError) {
            return reply.status(404).send({ message: error.message });
        }

        throw error;
    }
}
