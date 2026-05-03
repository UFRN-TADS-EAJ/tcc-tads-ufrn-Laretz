import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeBuscarSalasUseCase } from "@/use-cases/@factories/sala/make-buscar-salas-use-case";

export async function buscarSalas(request: FastifyRequest, reply: FastifyReply) {
    const buscarSalasQuerySchema = z.object({
        page: z.coerce.number().min(1).default(1),
    });

    const { page } = buscarSalasQuerySchema.parse(request.query);

    try {
        const buscarSalasUseCase = makeBuscarSalasUseCase();

        const { salas } = await buscarSalasUseCase.execute({
            page,
        });

        return reply.status(200).send({ salas });
    } catch (error) {
        throw error;
    }
}
