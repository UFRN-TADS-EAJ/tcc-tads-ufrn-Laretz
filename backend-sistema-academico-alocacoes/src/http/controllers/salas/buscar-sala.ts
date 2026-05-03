import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeBuscarSalaUseCase } from "@/use-cases/@factories/sala/make-buscar-sala-use-case";

export async function buscarSala(request: FastifyRequest, reply: FastifyReply) {
    const buscarSalaParamsSchema = z.object({
        id: z.string().uuid(),
    });

    const { id } = buscarSalaParamsSchema.parse(request.params);

    try {
        const buscarSalaUseCase = makeBuscarSalaUseCase();

        const { sala } = await buscarSalaUseCase.execute({
            id,
        });

        return reply.status(200).send({ sala });
    } catch (error) {
        if (error instanceof RecursoNaoEncontradoError) {
            return reply.status(404).send({ message: error.message });
        }

        throw error;
    }
}
