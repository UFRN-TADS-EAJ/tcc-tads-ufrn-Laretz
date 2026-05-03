import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeAtualizarSalaUseCase } from "@/use-cases/@factories/sala/make-atualizar-sala-use-case";

export async function atualizarSala(request: FastifyRequest, reply: FastifyReply) {
    const atualizarSalaParamsSchema = z.object({
        id: z.string().uuid(),
    });

    const atualizarSalaBodySchema = z.object({
        nome: z.string().optional(),
        predioId: z.string().optional(),
        capacidade: z.number().optional(),
        tipo: z.string().optional(),
    });

    const { id } = atualizarSalaParamsSchema.parse(request.params);
    const { nome, predioId, capacidade, tipo } = atualizarSalaBodySchema.parse(request.body);

    try {
        const atualizarSalaUseCase = makeAtualizarSalaUseCase();

        const { sala } = await atualizarSalaUseCase.execute({
            id,
            nome,
            predioId,
            capacidade,
            tipo,
        });

        return reply.status(200).send({ sala });
    } catch (error) {
        if (error instanceof RecursoNaoEncontradoError) {
            return reply.status(404).send({ message: error.message });
        }

        throw error;
    }
}
